import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main(){
    const user1 = await prisma.user.create({
        data: {
            email: "ovy.hydrogen@gmai.com",
            name: "Ovi",
            passwordHash: "test"
        }
    })

    const user2 = await prisma.user.create({
        data: {
            email: "mailexam@example.com",
            name: "Guest",
            passwordHash: "pass"
        }
    })

    await prisma.dashboard.create({
        data: {
            name: "1st dashboard",
            position: 0,
            userId: user1.id,
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
            userId: user2.id,
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
