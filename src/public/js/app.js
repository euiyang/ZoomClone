const socket=io();

const myFace=document.getElementById("myFace");
const muteBtn=document.getElementById("mute");
const cameraBtn=document.getElementById("camera");
const camerasSelect=document.getElementById("cameras");


let myStream;
//stream= audio+ video
let muted=false;
let cameraOff=false;

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

getMedia();

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

function handleCameraChange(){
    getMedia(camerasSelect.value);
}
//장치 변경시 id를 변경하는 것이 중요

muteBtn.addEventListener("click",handleMuteClick);
cameraBtn.addEventListener("click",handleCameraClick);
camerasSelect.addEventListener("input",handleCameraChange);