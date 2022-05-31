import {Content, Dashboard, PrismaClient } from "@prisma/client";

export class DashboardService{
    constructor(private readonly prisma: PrismaClient){}

    async moveDashboard(userId: string, dashboardId: string, position: number): Promise<boolean>{
            const dashboards = await this.prisma.dashboard.findMany({
                where:{
                    userId: userId,
                },
                orderBy: {
                    position: "asc",
                },
            });
            //i can't use a position greater than my array's lenn
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
    async createContent(userId: string,dashboardId: string, text: string){
        const dashboard = await this.getDash(userId, dashboardId);
        if(!dashboard){
            return;
        }
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

    async createDashboard(userId: string,name: string){
        const countDashboards = await this.prisma.dashboard.count({});
        return await this.prisma.dashboard.create({
            data: {
                position: countDashboards,
                name: name,
                userId: userId,
            }
        })
    }

    async deleteDashboard(userId: string,dashboardId: string){
        const dashboard = await this.getDash(userId, dashboardId);
        if(!dashboard){
            return null;
        }
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

    async deleteContent(userId: string,dashboardId: string, contentId: string){
        const dashboard = await this.getDash(userId, dashboardId);
        if(!dashboard){
            return;
        }
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
            userId: string,
            contentId: string, 
            position: number, 
            fromDashboardId: string, 
            toDashboardId: string
            ): Promise<boolean>{
            const fromToSameDashboard = fromDashboardId === toDashboardId;

            const fromDashboard = await this.getDash(userId, fromDashboardId);
            if(!fromDashboard){
                return false;
            }

            if(!fromToSameDashboard){
                const toDashboard = await this.getDash(userId, toDashboardId);
                if(!toDashboard){
                    return false;
                    }
            }

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

    getDashboard(userId: string){
        return this.prisma.dashboard.findMany({
            where: {
                userId: userId,
            },
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

    private async reoderDashboard(dashboards: Dashboard[]){
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

    private async reoderContent(contents: Content[], dashboardId: string){
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
    
    getDash(userId: string, dashboardId: string){
        return this.prisma.dashboard.findUnique({
            where:{
                id_userId: {
                    id: dashboardId,
                    userId: userId,
                },
            },
        });
    }
    
}