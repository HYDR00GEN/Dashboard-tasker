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
    
}