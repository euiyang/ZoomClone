import http from "http";
import WebSocket from "ws";
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

const handleListen=()=>console.log(`listening on http://localhost:3000`);

const server=http.createServer(app);
const wss =new WebSocket.Server({server});

// function handleConnection(socket){
//     console.log(socket);
//     //소켓 정보에 대한것을 출력하는 함수
// }

// wss.on("connection",handleConnection);

const sockets=[];

wss.on("connection",(socket)=>{
    sockets.push(socket);

    socket["nickname"]="Anonymous";

    console.log("Connected to Browser");
    socket.on("close",()=>console.log("Disconnected from the Browser"));
    // socket.on("message",(message)=>{
    //     // console.log(message.toString("utf8"));
    //     socket.send("hello");
    // });
    socket.on("message",(message)=>{
        // sockets.forEach(aSocket=>aSocket.send(message.toString("utf8")));
        //모든 메세지를 한번에 처리하는 경우

        const parsed=JSON.parse(message);
        // if(parsed.type==="new_message"){
        //     sockets.forEach((aSocket)=>aSocket.send(parsed.payload));
        // }else{
        //     console.log(parsed.payload);
        // }

        switch(parsed.type){
            case "new_message":
                sockets.forEach((aSocket)=>
                aSocket.send(`${socket.nickname}:${parsed.payload}`)
                );
            case "nickname":
                // console.log(parsed.payload);
                socket["nickname"]=parsed.payload;
        }
    });
});

server.listen(3000,handleListen);
