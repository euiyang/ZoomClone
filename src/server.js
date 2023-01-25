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

wsServer.on("connection",(socket)=>{
    socket.on("enter_room",(msg,done)=>{
        console.log(msg);
        setTimeout(()=>{
            done();
        },10000);
    });
    //done은 프론트에서 실행되는 callback 함수
});

const handleListen=()=>console.log(`listening on http://localhost:3000`);
httpServer.listen(3000,handleListen);