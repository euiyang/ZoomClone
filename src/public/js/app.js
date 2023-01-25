const socket=io();

const welcome=document.getElementById("welcome");
const form = welcome.querySelector("form");

function handleRoomSubmit(event){
    event.preventDefault();
    const input=form.querySelector("input");
    socket.emit("enter_room", {payload:input.value},()=>{
        console.log("server is done");
    });
    //이전 websocket과 달리 어떠한 이벤트든 반응 가능하고 string으로 보낼 필요 없음
    //emit 함수의 3번째 인자로 들어가는 callback은 서버 측에서 실행되는 함수를 의미함
    input.value="";
}

form.addEventListener("submit",handleRoomSubmit);