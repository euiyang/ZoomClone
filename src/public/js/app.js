const socket=io();

const welcome=document.getElementById("welcome");
const form = welcome.querySelector("form");
const room=document.getElementById("room");

room.hidden=true;

let roomName;



function addMessage(message){
    const ul=room.querySelector("ul");
    const li=document.createElement("li");
    li.innerText=message;
    ul.appendChild(li);
}

function backendDone(msg){
    console.log("backend says "+msg);
}

function handleMessageSubmit(event){
    event.preventDefault();
    const input=room.querySelector("#msg input");
    const value=input.value;
    socket.emit("new_message",input.value,roomName,()=>{
        addMessage(`you: ${value}`);
    });
    input.value="";
}

function handleNicknameSubmit(event){
    event.preventDefault();
    const input=room.querySelector("#name input");
    const value=input.value;
    socket.emit("nickname",input.value);
}

function showRoom(){
    welcome.hidden=true;
    room.hidden=false;
    const h3=room.querySelector("h3");
    h3.innerText=`Room ${roomName}`;
    const msgForm=room.querySelector("#msg");
    const nameForm=room.querySelector("#name")
    msgForm.addEventListener("submit",handleMessageSubmit);
    nameForm.addEventListener("submit",handleNicknameSubmit);
}

function handleRoomSubmit(event){
    event.preventDefault();
    const input=form.querySelector("input");
    socket.emit("enter_room",input.value,showRoom);
    //이전 websocket과 달리 어떠한 이벤트든 반응 가능하고 string으로 보낼 필요 없음
    //emit 함수의 마지막 인자로 들어가는 callback은 서버 측에서 실행되는 함수를 의미함
    roomName=input.value;
    input.value="";
}

form.addEventListener("submit",handleRoomSubmit);

socket.on("welcome",(user,newCount)=>{
    const h3=room.querySelector("h3");
    h3.innerText=`Room ${roomName} (${newCount})`;
    addMessage(`${user} arrived`);
});

socket.on("bye",(left,newCount)=>{
    const h3=room.querySelector("h3");
    h3.innerText=`Room ${roomName} (${newCount})`;
    addMessage(`${left} left`);
})

socket.on("new_message",addMessage);

socket.on("room_change",console.log);

socket.on("room_change",(rooms)=>{
    roomList.innerHTML="";
    if(rooms.length===0){
        return;
    }
    const roomList=welcome.querySelector("ul");
    rooms.forEach((room)=>{
        const li=document.createElement("li");
        li.innerText=room;
        roomList.append(li);
    })
})