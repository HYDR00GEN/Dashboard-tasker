import express from "express";
import { PrismaClient } from "@prisma/client";
import { DashboardService } from "./dashboard-service";

const prisma  = new PrismaClient();
prisma.$disconnect()

const dashboardService = new DashboardService(prisma)

const server = express();

const PORT = 3000
const serverInstance = server.listen(PORT, ()=>{
    console.log(`...🐍ssserver started @ port : ${PORT}`)
})

//parsing body into json
server.use(express.json());

//API dashboard
server.get("/", async (req, res)=>{
    const dashboards = await dashboardService.getDashboard();
    res.send(dashboards)
});

//post for moving dashboard
server.post("/:dashboardId/move", async(req,res)=>{
    //verify if dash exists
    const {position} = req.body;
    const {dashboardId} = req.params;
    const ok = await dashboardService.moveDashboard(dashboardId, position)
    if(!ok){
        return res.status(401).send({msg: "unnable to move dash"})
    }

    const dashboards = await dashboardService.getDashboard();
    res.send(dashboards)
})


//enabling soft closing serverr
process.on("SIGTERM",async()=> {
    console.log("...🐍ssserver closing")
    serverInstance.close();
    await prisma.$disconnect()
})