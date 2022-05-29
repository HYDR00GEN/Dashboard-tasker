import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main(){
    await prisma.dashboard.create({
        data: {
            name: "1st dashboard",
            position: 0,
            contents: {
                create: [{
                    text: "1st task",
                    position: 0
                },{
                    text: "2nd task",
                    position: 1
                }]
            }
        }
    });
    await prisma.dashboard.create({
        data: {
            name: "2nd dashboard",
            position: 1,
            contents: {
                create: [{
                    text: "3rd task",
                    position: 0
                },{
                    text: "4th task",
                    position: 1
                }]
            }
        }
    })
}

main()
.then(()=>{
    console.log("seed started")
    process.exit(0)
})
.catch((err)=>{
    console.error(err)
    process.exit(1)
})
