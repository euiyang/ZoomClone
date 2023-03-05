const socket=io();

const myFace=document.getElementById("myFace");
const muteBtn=document.getElementById("mute");
const cameraBtn=document.getElementById("camera");
const camerasSelect=document.getElementById("cameras");

const welcome =document.getElementBy("welcome");
const call =document.getElementById("call");

call.hidden=true;

let myStream;
//stream= audio+ video
let muted=false;
let cameraOff=false;
let roomName;
let myPeerConnection;

async function getCameras(){
    try{
        const devices=await navigator.mediaDevices.enumerateDevices();
        //장치 전부 검색
        const cameras=devices.filter(divied=>devices.kind==="videoinput");
        //videoinput에 해당하는 장치 필터링
        const currentCamera=myStream.getVideoTracks()[0];
        cameras.forEach(camera=>{
            const option=document.createElement("option");
            option.value=camera.deviceId;
            option.innerText=camera.label;

            if(currentCamera.label==camera.label){
                option.selected=true;
            }// 현재 사용중인 장치 확인 코드

            camerasSelect.appendChild(option);
        })
        //장치 선택하도록 설정
    }catch(e){
        console.log(e);
    }
}

async function getMedia(deviceId){
    const initialConstrains={
        audio:true,
        video:{facingMode:"user"},
    };

    const cameraConstrains={
        audio:true,
        video:{deviceId:{exact: deviceId}},
    };

    try{
        myStream=await navigator.mediaDevices.getUserMedia(
            deviceId ? cameraConstrains : initialConstrains
        );
        myFace.srcObject=myStream;
        if(!deviceId){
            await getCameras();
        }
        
    }catch(e){
        console.log(e);
    }
}


function handleMuteClick(){
    myStream.getAudioTracks().forEach((track)=>(track.enabled=!track.enabled));
    //트랙에 접근 가능 enable<->disable 수정 코드
    if(!muted){
        muteBtn.innerText="Unmute";
        muted=true;
    }else{
        muteBtn.innerText="Mute";
        muted=false;
    }
}

function handleCameraClick(){
    myStream.getVideoTracks().forEach((track)=>(track.enabled=!track.enabled));
    if(cameraOff){
        cameraBtn.innerText="Turn Camera On";
        cameraOff=false;
    }else{
        cameraBtn.innerText="Turn Camera Off";
        cameraOff=true;
    }
}

async function handleCameraChange(){
    await getMedia(camerasSelect.value);
    if(myPeerConnection){
        const videoTrack=myStream.getVideoTracks()[0];
        const videoSender=myPeerConnection.getSenders().find(sender=>sender.track.kind=="video");
        videoSender.replaceTrack(videoTrack);
    }//선택한 장치가 바뀌는 경우 수정을 위해 sender를 수정
}
//장치 변경시 id를 변경하는 것이 중요

muteBtn.addEventListener("click",handleMuteClick);
cameraBtn.addEventListener("click",handleCameraClick);
camerasSelect.addEventListener("input",handleCameraChange);

welcomeForm=welcome.querySelector("form");

async function initCall(){
    welcome.hidden=true;
    call.hidden=false;
    await getMedia();
    makeConnection();
}

async function handleWelcomeSubmit(event){
    event.preventDefault();
    const input=welcomeForm.querySelector("input");
    await initCall();
    socket.emit("join_room",input.value);
    roomName=input.value;
    input.value="";
}

welcomeForm.addEventListener("submit",handleWelcomeSubmit);

socket.on("welcome", async()=>{
    // console.log("someone joined");
    const offer=await myPeerConnection.createOffer();
    myPeerConnection.setLocalDescription(offer);
    console.log("sent the offer");
    socket.emit("offer",offer,roomName);
}); //A: offer 생성

socket.on("offer",async (offer)=>{
    console.log("receive the offer");
    myPeerConnection.setRemoteDescription(offer);
    const answer=await myPeerConnection.createAnswer();
    myPeerConnection.setLocalDescription(answer);
    socket.emit("answer",answer,roomName);
    console.log("sent the answer");
})//B: offer 받음, answer 전달

socket.on("answer",answer=>{
    console.log("receive the answer");
    myPeerConnection.setLocalDescription(answer);
});

socket.on("ice",(ice)=>{
    console.log("received candidate");
    myPeerConnection.addIceCandidate(ice);
})

//RTC code

function makeConnection(){
    myPeerConnection = new RTCPeerConnection({
        iceServers:[
            {
                urls:[//google free stun server url
                    "stun.l.google.com:19302",
                    "stun1.l.google.com:19302",
                    "stun2.l.google.com:19302",
                    "stun3.l.google.com:19302",
                    "stun4.l.google.com:19302",
                ],
            },
        ],
    });
    myPeerConnection.addEventListener("icecandidate",handleIce);

    myPeerConnection.addEventListener("addStream",handleAddStream);
    myStream
        .getTracks()
        .forEach(track=> myPeerConnection.addTrack(track,myStream));
    //addStream 대신 addTracks 함수로 영상의 stream 데이터를 넣음.

}

function hancleIce(data){
    console.log("sent candidate");
    socket.emit("ice",data.candidate,roomName);
}

function handleAddStream(data){
    const peerFace=document.getElementById("peerFace");
    peerFace.srcObject=data.stream;

}