import http from "http";
// import WebSocket from "ws";
import {Server} from "socket.io";
import {instrument} from "@socket.io/admin-ui";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

//미들웨어 : 모든 요청들이 use를 지나감 : 
//express.static : 특정 파일에 링크된 텍스트 파일을 읽을때 사용 (모든 파일의 소스는 public에서 )
app.use("/public", express.static(__dirname + "/public"));

// get요청 : 위 설정한 /views/.pug파일을 디폴트 홈으로 요청하여 화면 표시함
app.get("/", (req, res) => res.render("home"));

//홈의 뒤에 어느 문자를 입력해도 홈으로 돌아오도록 함
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

//app에 등록된 http서버에 acess
const httpserver = http.createServer(app);
const io = new Server(httpserver, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true,
  },
});

instrument(io,{
  auth:false,
});

function publicRooms(){
  // const sids = io.sockets.adapter.sids;
  // const rooms = io.sockets.adapter.rooms;
  //위의 코드를 아래로 표현할 수 있음
  //io.sockets.adapter 에서 sids, rooms를 가져옴
  const {sockets: {adapter: {sids, rooms}}} = io;

  const publicRooms = [];
  rooms.forEach((_, key) => {
    if(sids.get(key) === undefined){
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

function countRoom(roomName){
  return io.sockets.adapter.rooms.get(roomName)?.size;
}

io.on("connection", (socket)=>{
  socket["nickname"] = "Anon";
  //.onAny : 미들웨어
  socket.onAny((event) =>{
    console.log(`Socket Event: ${event}`);
  });

  socket.on("enter_room", (roomName, done) =>{
    socket.join(roomName);
    done();
    //.to :  room에 참가하면 나를 제외한 모든 사람에게 프론트의 welcome 실행
    socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
    io.sockets.emit("room_change", publicRooms() );
  });
  
  //클라이언트가 서버와 끊어지기 전에 실행
  //클라이언트가 떠나기 직전임으로 멤버수 countRoom-1
  socket.on("disconnecting", ()=>{
    socket.rooms.forEach((room)=> socket.to(room).emit("bye", socket.nickname, countRoom(room) -1));
  });
  socket.on("disconnect", () =>{
    io.sockets.emit("room_change", publicRooms() );
  });

  socket.on("new_message", (msg, room, done)=>{
    socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
    done();
  });

  socket.on("nickname", (nickname )=> (socket["nickname"] = nickname));
});


httpserver.listen(3000, handleListen);