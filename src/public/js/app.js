const messageList = document.querySelector("ul");
const nickForm =document.querySelector("#nick");
const messageForm =document.querySelector("#message");
//socket : 서버로의 연결
const socket = new WebSocket(`ws://${window.location.host}`);


//닉네임과 메시지를 구별하기 위해 오브젝트 형성
// 백엔드에 문자타입으로 전달해야 하므로 stringify사용
function makeMessage(type, payload){
  const msg = {type, payload};
  return JSON.stringify(msg);
}


socket.addEventListener("open", ()=>{
  console.log("Connected to Server ✔");
});

socket.addEventListener("message", (message)=>{
  const li = document.createElement("li");
  li.innerText = message.data;

  messageList.append(li);

});

socket.addEventListener("close", ()=>{
  console.log("Connected to Server ❌");
});

// setTimeout(() => {
//   socket.send("hello from the browser ");
// }, 10000);




function handleSubmit(event){
  event.preventDefault();
  const input = messageForm.querySelector("input");

  //백엔드로 메시지 송신후 , 인풋을 비워주기(초기화)
  socket.send(makeMessage("new_message", input.value));
  input.value = "";

}

function handleNickSubmit(event){
  event.preventDefault();
  const input = nickForm.querySelector("input");
  socket.send(makeMessage("nickname", input.value));
  input.value = "";
}


messageForm.addEventListener("submit", handleSubmit);
nickForm.addEventListener("submit", handleNickSubmit)