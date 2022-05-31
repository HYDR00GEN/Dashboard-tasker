import express from "express";
import { prisma } from "./prisma";
import { hashSync, compareSync } from "bcrypt";
import {User} from ".prisma/client"
import { getJwtKeys } from "./key";
import jwt from "jsonwebtoken"
import {Router} from "express"

const auth = Router();

async function verifyEmailAndPassword(email: string, password: string): Promise<User | null>{
    const user = await prisma.user.findUnique({
        where:{
            email: email,
        }
    });
    if(!user){
        return null;
    }
    if(!compareSync(password, user.passwordHash)){
        return null;
    }
    return user
}

function getExpTime(min: number){
    const now = Math.trunc(new Date().getTime()/1000);
    return now + min * 60;
}

async function generateJwt(user: User): Promise<string>{
    const payload = {
        aud: "access",
        exp: getExpTime(2*60), //exp in 2h
        id: user.id,
        email: user.email
    }
    const {privateKey} = await getJwtKeys()
    return jwt.sign(payload, privateKey, {algorithm: "RS256"});
}
    
auth.post("/login",async(req,res)=>{
    const{ email, password, name } = req.body;
    const user = await verifyEmailAndPassword(email, password)
    if(!user){
        return res.status(401).send({ error: "invalid auth"})
    }
    const token = await generateJwt(user);
    return res.status(201).send({
        accessToken: token,
    });
})

auth.post("/register", async(req,res)=>{
    const{ email, password, name }= req.body;
    const passwordHash = hashSync(password, 10);
    let user: User;
    try{

        user = await prisma.user.create({
            data: {
                email: email,
                name: name,
                passwordHash: passwordHash,
                }
            });
    } catch {
        return res.status(401).send({ error: "unnable to create user"})
        }
        return res.status(201).send({
        id: user.id,
        email: user.email,
        name: user.name,
    });
});

export {auth};