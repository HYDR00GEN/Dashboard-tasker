import express from "express";

const server = express();

server.get("/", (req, res)=>{
    res.send({msg: "init all"})
})


const PORT = 3000
server.listen(PORT, ()=>{
    console.log(`...ssserver started @ port : ${PORT}`)
})