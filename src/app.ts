import { DashboardService } from "./dashboard-service";
import { prisma } from "./prisma";
import path from "path";
import { Router } from "express";
import { getJwtKeys } from "./key";
import jwt from "jsonwebtoken"

const app = Router();

const dashboardService = new DashboardService(prisma)

async function verifyToken(header: string | undefined): Promise<string | null>{
    if(!header){
        return null
    }
        //Bearer x7ahz<lkpa73
    const match = /Bearer (.+)/.exec(header)
    if(!match){
        return null;
    }
    const token = match[1]
    const {publicKey} = await getJwtKeys();
    try{
        const data = jwt.verify(token, publicKey, {
            algorithms: ["RS256"]
        }) as {id: string};
        return data.id;
    } catch {
        return null;
    }
}

//used by anyother app.
app.use( async (req,res,next)=>{
    const authHeader = req.headers["authorization"]
    const userId = await verifyToken(authHeader)
    if(!userId){
        return res.status(400).send({ERROR: "invalid auth"})
    }
    res.locals.userId = userId;
    next();
})

/*app.get("/", (req,res)=>{
    console.log(__dirname);
    return res.sendFile(path.join(__dirname, "/index.html"))

})*/
 
 //API dashboard
 app.get("/", async (req, res)=>{
     const userId =  res.locals.userId
     const dashboards = await dashboardService.getDashboard(userId);
     res.send(dashboards)
 });
 
 //post for moving dashboardd
 app.post("/:dashboardId/move", async(req,res)=>{
     //verify if dash exists
     const {position} = req.body;
     const {dashboardId} = req.params;
     const userId = res.locals.userId
     const ok = await dashboardService.moveDashboard(userId,dashboardId, position)
     if(!ok){
         return res.status(401).send({msg: "unnable to move dash"})
     }
 
     const dashboards = await dashboardService.getDashboard(userId);
     res.send(dashboards)
 })
 
 app.post("/:dashboardId/:contentId/move", async(req,res)=>{
     //specify pos & dash in which arrives
     const to = req.body;
     const {dashboardId,  contentId} = req.params;
     const userId = res.locals.userId
     const ok = await dashboardService.moveContent(
         userId,
         contentId, 
         to.position, 
         dashboardId,
         to.dashboardId,
     );
     if(!ok){
         return res.status(401).send({msg: "unnable to move dash"})
     }
 
     const dashboards = await dashboardService.getDashboard(userId);
     res.send(dashboards)
 })
 
 app.post("/", async(req,res)=>{
     const {name} = req.body;
     const userId = res.locals.userId
     await dashboardService.createDashboard(userId,name);
     const dashboards = await dashboardService.getDashboard(userId);
     res.send(dashboards)
 })
 app.post("/:dashboardId", async(req,res)=>{
     const {dashboardId} = req.params
     const {text} = req.body;
     const userId = res.locals.userId
 
     await dashboardService.createContent(userId,dashboardId, text);
     const dashboards = await dashboardService.getDashboard(userId);
     res.send(dashboards)
 })
 
 app.delete("/:dashboardId", async(req,res)=>{
     const {dashboardId} = req.params
     const userId = res.locals.userId
     const dashboard = await dashboardService.deleteDashboard(userId,dashboardId);
     if(!dashboard){
         return res.status(401).send({msg: "cannot delete dashboard"})
     }
     const dashboards = await dashboardService.getDashboard(userId);
     res.send(dashboards)
 })
 
 app.delete("/:dashboardId/:contentId", async(req,res)=>{
     const {dashboardId, contentId} = req.params;
     const userId = res.locals.userId
     const content = await dashboardService.deleteContent(userId,dashboardId, contentId);
     if(!content){
         return res.status(401).send({msg: "cannot delete content"})
     }
     const dashboards = await dashboardService.getDashboard(userId);
     res.send(dashboards)
 })

 export {app};