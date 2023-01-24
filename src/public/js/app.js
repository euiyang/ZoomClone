
const messageList=document.querySelector("ul");
const messageForm=document.querySelector("#message");
const nickForm=document.querySelector("#nick");
const socket=new WebSocket(`ws://${window.location.host}`);
//window.location.host는 사용자가 어디에 있는지에 대한 정보를 가져온다.

function makeMessage(type,payload){
    const msg={type,payload};
    return JSON.stringify(msg);
}

socket.addEventListener("open",()=>{
    console.log("Connected to Server");
})

socket.addEventListener("message",(message)=>{
    console.log("Just got this:",message.data,"from the server");
    //message를 출력하면 해당 message에 대한 다양한 정보를 모두 출력
});

socket.addEventListener("message",(message)=>{
    const li =document.createElement("li");
    li.innerText=message.data;
    messageList.append(li);
})

socket.addEventListener("close",()=>{
    console.log("Disconnected from Server");
});

// setTimeout(()=>{
//     socket.send("hello from the browser");
// },5000);

function handleSubmit(event){
    event.preventDefault();
    const input= messageForm.querySelector("input");
    socket.send(makeMessage("new_message",input.value));
    input.value="";
}

function handleNickSubmit(event){
    event.preventDefault();
    const input=nickForm.querySelector("input");
    socket.send(makeMessage("nickname",input.value));
    input.value="";
}

//Json.stringify: json을 string 화, Json.parse: string을 json으로

messageForm.addEventListener("submit",handleSubmit);
nickForm.addEventListener("submit",handleNickSubmit);

