import http from "http";
import SocketIo from "socket.io"
// import WebSocket from "ws";
import express, { application } from "express"
import { WebSocketServer } from "ws";
import { doesNotMatch } from "assert";

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


WebSocketServer.on("connection",(socket)=>{
    socket.on("join_room",roomName=>{
        socket.join(roomName);
        socket.to(roomName).emit("welcome");
    });
    socket.on("offer",(offer,roomName)=>{
        socket.to(roomName).emit("offer",offer);
    });
    socket.emit("answer",(answer,roomName)=>{
        socket.to(roomName).emit("answer",answer);
    });

    socket.on("ice",(ice,roomName)=>{
        socket.to(roomName).emit("ice",ice);
    });
});



const handleListen=()=>console.log(`listening on http://localhost:3000`);
httpServer.listen(3000,handleListen);