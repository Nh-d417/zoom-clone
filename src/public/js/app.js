// io  : 자동적으로 백엔드와 socket.io를 연결해주는 function
const socket = io();
const welcome = document.querySelector("#welcome");
const form = document.querySelector("form");
const room = document.querySelector("#room");

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const cameraSelect = document.getElementById("cameras");
let myStream;

//room 초기화면에서 숨기기
room.hidden = true;
let roomName ;
let muted = false;
let cameraOff = false;

async function getCamera(){
  try {
    // 유저환경의 모든디바이스  enumerateDevices
    const devices = await navigator.mediaDevices.enumerateDevices();
    //유저환경의 모든디바이스중  videoinput만 거르기
    const cameras = devices.filter(device => device.kind === "videoinput");

    const currentCamera = myStream.getVideoTracks()[0];

    cameras.forEach(camera => {
      //거른 videoinput을 고를 수 있도록 cameraSelect에 넣어주기
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;

      if(currentCamera.label == camera.label){
        option.selected = true;
      }

      cameraSelect.appendChild(option);
    });
  } catch (error) {
    console.log(e);
  }
}

async function getMedia(deviceId){
 // 모바일폰의 전면카메라 , 초기실행
  const initialConstrains = {
    audio: true,
    video: {facingMode: "user"},
 };

 //deviceId가 필요할 때, 카메라를 선택할 때 
 const cameraConstraints = {
  audio: true,
  video:{deviceId: {exact: deviceId}},
 };

  try {
    //유저환경의 디바이스  getUserMedia
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId? cameraConstraints : initialConstrains
    );
    myFace.srcObject = myStream;
    if(!deviceId){
      await getCamera();
    }
  } catch (e){
    console.log(e);
  }
}

getMedia();

function handleMuteClick(){
  //비디오 
  myStream.getAudioTracks().forEach(track => (track.enabled = !track.enabled));
  if(!muted){
    muteBtn.innerText = "Unmute";
    muted = true;
  }else{
    muteBtn.innerText = "Mute";
    muted = false;
  }
}

function handleCameraClick(){
  myStream.getVideoTracks().forEach(track => (track.enabled = !track.enabled));
  if(cameraOff){
    cameraBtn.innerText = "Turn Camera Off";
    cameraOff = false;
  }else{
    cameraBtn.innerText = "Turn Camera On";
    cameraOff = true;
  }
}

async function handleCameraChange(){
  await getMedia(cameraSelect.value);
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
cameraSelect.addEventListener("input", handleCameraChange);
//
//
//메시지
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