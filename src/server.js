import http from "http";
import WebSocket from "ws";
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
const server = http.createServer(app);
//http서버 위로 Websocket서버를 생성
// http와 ws서버 둘다 처리가 가능하게 됨
const wss = new WebSocket.Server({server});


//브라우저대응을 위한 가짜 데이터베이스 용
const sockets = [];

wss.on("connection",  (socket) =>{
  sockets.push(socket);
  socket["nickname"] = "Anon";
   //socket : 연결된 브라우저
  console.log("Connected to Browser");

  //브라우저 창이 닫힐 때 터미널 로그출력
  socket.on("close", () =>console.log("Connected to Browser ❌"));

  //브라우저로부터 메시지 받기
  socket.on("message", (msg)=>{
    const message = JSON.parse(msg.toString('utf8'));
    
    switch(message.type){
      case "new_message":
        //브라우저에서 받은 메시지를 다시 보내기
        // socket.send(message.toString('utf8'));
        sockets.forEach((aSocket) => aSocket.send(
          `${socket.nickname}: ${message.payload}`));
      
      case "nickname":
        socket["nickname"] = message.payload;
    }
    
     
    //브라우저에 메시지 보내기
    // socket.send(msg.toString('utf8'));
  });

});

server.listen(3000, handleListen);