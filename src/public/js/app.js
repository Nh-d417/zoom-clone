// io  : 자동적으로 백엔드와 socket.io를 연결해주는 function
const socket = io();
const welcome = document.querySelector("#welcome");
const form = document.querySelector("form");
const room = document.querySelector("#room");

//room 초기화면에서 숨기기
room.hidden = true;
let roomName ;

function handleMessageSubmit(event ){
  event.preventDefault();
  const input = room.querySelector("#msg input");
  const value = input.value;
  socket.emit("new_message", input.value, roomName, ()=>{
    //내 화면에 표시
    addMessage(`You: ${value}`);
  });
  input.value = "";
}

function handleNicknameSubmit(event){
  event.preventDefault();
  const input = room.querySelector("#name input");
  socket.emit("nickname", input.value);
}

function addMessage(message){
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = "Someone joined!";
  ul.appendChild(li);
}

function showRoom(){
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerText  = `Room ${roomName}`;

  const msgForm = room.querySelector("#msg");
  const nameForm = room.querySelector("#name");
  msgForm.addEventListener("submit",handleMessageSubmit);
  nameForm.addEventListener("submit",handleNicknameSubmit);
}

function handleRoomSubmit(event){
  event.preventDefault();
  const input = form.querySelector("input");

  // 오브젝트 전송 가능
  socket.emit("enter_room", input.value, showRoom);
  roomName = input.value;
  input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);

// 누군가 방에 참가할 때
socket.on("welcome", (user, newCount) =>{
  const h3 = room.querySelector("h3");
  h3.innerText  = `Room ${roomName} (${newCount})`;

  addMessage(`${user} arrived!`);
  
});

//누군가 방을 떠날 때
socket.on("bye", (left, newCount)=>{
  const h3 = room.querySelector("h3");
  h3.innerText  = `Room ${roomName} (${newCount})`;

  addMessage(`${left} left T-T`);
});

//모든사람의 화면에 표시
socket.on("new_message", addMessage);


socket.on("room_change", (rooms) =>{
  const roomlist = welcome.querySelector("ul");
  
  // 방이 없을 때 실시간으로 비움표시
  roomlist.innerText = "";
  if(rooms.length === 0){
    return;
  }
  
  // 방이 존재하는 경우 리스트 표시
  rooms.forEach(room =>{
    const li = document.createElement("li");
    li.innerText = room;
    roomlist.append(li);
  });
});