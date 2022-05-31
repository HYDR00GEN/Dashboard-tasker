import express from "express";
import { PrismaClient } from "@prisma/client"
import { DashboardService } from "./dashboard-service";
import {prisma} from "./prisma";
import {auth} from "./auth"
import path from "path";
import cors from "cors";
import {app} from "./app"

//const prisma  = new PrismaClient();
prisma.$disconnect()


const server = express();

const PORT = 3000
const serverInstance = server.listen(PORT, ()=>{
    console.log(`...🐍ssserver started @ port : ${PORT}`)
})

//parsing body into json
server.use(express.json());
server.use("/app", app)
server.use("/auth", auth)
//server.use("/", app)

//enabling soft closing serverr
process.on("SIGTERM",async()=> {
    console.log("...🐍ssserver closing")
    serverInstance.close();
    await prisma.$disconnect()
})

export default server
