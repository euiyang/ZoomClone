import http from "http";
import SocketIo from "socket.io"
// import WebSocket from "ws";
import express, { application } from "express"

const app=express();
app.set("view engine","pug");
//pug로 view engine 설정
app.set("views",__dirname+"/views");
//express에 template이 어디 있는지 지정
app.use("/public",express.static(__dirname+"/public"));
//public url을 생성해서 유저에게 파일 공유
app.get("/",(req,res)=>res.render("home"));
//home.pug를 render 해주는 route handler를 만듦
app.get("/*",(_,res)=>res.redirect("/"));


const httpServer=http.createServer(app);
const wsServer=SocketIo(httpServer);

function countRoom(roomName){
    return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

function publicRooms(){
    // const sids=wsServer.sockets.adapter.sids;
    // const rooms=wsServer.sockets.adapter.rooms;
    const{
        sockets:{
            adapter:{sids,rooms},
        },
    }=wsServer;

    const publicRooms=[];
    rooms.forEach((_,key)=>{
        if(sids.get(key)===undefined){
            publicRooms.push(key);
        }
    });
    return publicRooms;
}

wsServer.on("connection",(socket)=>{

    socket["nickname"]="Ano";

    socket.onAny((event)=>{
            console.log(`Socket Event:${event}`);
        })
    socket.on("enter_room",(roomName,done)=>{
        socket.join(roomName);
        done();
        socket.to(roomName).emit("welcome",socket.nickname,countRoom(roomName));
        wsServer.sockets.emit("room_change",publicRooms());
    });
    //done은 프론트에서 실행되는 callback 함수
    //backend에서는 frontend에서 오는 함수를 실행시키면 안됨(보안 이슈)
    //따라서 backend가 frontend에 있는 함수를 frontend에서 실행하도록 함

    socket.on("disconnecting",()=>{
        socket.rooms.forEach((room)=>socket.to(room).emit("bye",socket.nickname,countRoom(room)-1));
    });

    socket.on("disconnect",()=>{
        wsServer.emit("room_change",publicRooms());
    });

    socket.on("new_message",(msg,room,done)=>{
        socket.to(room).emit("new_message",`${socket.nickname}: ${msg}`);
        done();
    });
    socket.on("nickname",(nickname)=>(socket["nickname"]=nickname));
});



const handleListen=()=>console.log(`listening on http://localhost:3000`);
httpServer.listen(3000,handleListen);