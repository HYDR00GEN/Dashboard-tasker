import {Content, Dashboard, PrismaClient } from "@prisma/client";

export class DashboardService{
    constructor(private readonly prisma: PrismaClient){}

    async moveDashboard(dashboardId: string, position: number): Promise<boolean>{
            const dashboards = await this.prisma.dashboard.findMany({
                orderBy: {
                    position: "asc",
                },
            });
            //i can't use a position greater than my array's len
            if(position >= dashboards.length){
                return false
            }
            const oldPosition = dashboards.findIndex(d=> d.id == dashboardId);
            if (oldPosition == -1){
                return false
            }
            //return eliminated elements
            const [dashboard] = dashboards.splice(oldPosition, 1)
            dashboards.splice(position, 0, dashboard)
            await this.reoderDashboard(dashboards);
            return true;
        }
    //implementing CRUD api    
    async createContent(dashboardId: string, text: string){
        const countContent = await this.prisma.content.count({
            where: {
                dashboardId: dashboardId,
            }
        });
        return await this.prisma.content.create({
            data: {
                position: countContent,
                text: text,
                dashboardId: dashboardId,
            }
        })
    }

    async createDashboard(name: string){
        const countDashboards = await this.prisma.dashboard.count({});
        return await this.prisma.dashboard.create({
            data: {
                position: countDashboards,
                name: name,
            }
        })
    }

    async deleteDashboard(dashboardId: string){
        const contentsInDashboard = await this.prisma.content.count({
            where:{
                dashboardId: dashboardId
            }
        });
        if(contentsInDashboard > 0){
            return null
        }
        return await this.prisma.dashboard.delete({
            where: {
                id: dashboardId,
            }
        })
    }

    async deleteContent(dashboardId: string, contentId: string){
        return await this.prisma.content.delete({
            where: {
                id_dashboardId: {
                    dashboardId: dashboardId,
                    id: contentId,
                }
            }
        })
    }

    async moveContent(
            contentId: string, 
            position: number, 
            fromDashboardId: string, 
            toDashboardId: string
            ): Promise<boolean>{
            const fromToSameDashboard = fromDashboardId == toDashboardId;
                //list of contents from start
            const fromContents = await this.prisma.content.findMany({
                orderBy: {
                    position: "asc",
                },
                where: {
                    dashboardId: fromDashboardId
                }
            });

            const toContents = fromToSameDashboard ? 
            fromContents : await this.prisma.content.findMany({
                orderBy: {
                    position: "asc",
                },
                where: {
                    dashboardId: toDashboardId
                }
            });

            //i can't use a position greater than my array's len
            if(position > toContents.length){
                return false
            }

            const oldPosition = fromContents.findIndex(c=> c.id == contentId);
            if (oldPosition == -1){
                return false
            }
            //return eliminated elements
            const [content] = fromContents.splice(oldPosition, 1)
            if(oldPosition<position){
                position = position -1;
            }

            toContents.splice(position, 0, content);
            await this.reoderContent(fromContents, fromDashboardId)

            if(!fromToSameDashboard){
                await this.reoderContent(toContents, toDashboardId)
            }
            return true;
        }

    getDashboard(){
        return this.prisma.dashboard.findMany({
            orderBy: {
                position: "asc",
            },
            include: {
                contents: {
                    orderBy: {
                        position: "asc",
                    },
                },
            },
        });
    }

    async reoderDashboard(dashboards: Dashboard[]){
        //prepate all my updates transaction
        const updates = dashboards.map((dashboard, position)=>{
            return this.prisma.dashboard.update({
                where: {
                    id: dashboard.id,
                },
                data:{
                    position: position,
                },
            });
        });
        //return all my updates
        await this.prisma.$transaction(updates)
    }

    async reoderContent(contents: Content[], dashboardId: string){
        const updates = contents.map((content, position)=>{
            return this.prisma.content.update({
                where: {
                    id: content.id,
                },
                data:{
                    position: position,
                    dashboardId: dashboardId,
                },
            });
        });
        await this.prisma.$transaction(updates)
    }
    
}