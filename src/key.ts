import { generateKeyPairSync } from "crypto";
import {prisma} from "./prisma"
import jwt from "jsonwebtoken"

export interface JwtKeys{
    privateKey: string;
    publicKey: string;
}

function generateKeys(): JwtKeys{
    const keys = generateKeyPairSync(`rsa`, {
        modulusLength: 4096,
        publicKeyEncoding: {
            type: "spki",
            format: "pem"
        },
        privateKeyEncoding: {
            type: "pkcs8",
            format: "pem"
        }
    })
    return keys;
}

export async function getJwtKeys(): Promise<JwtKeys> {
    let keys = await prisma.jwtKey.findFirst();
    if(!keys){
        const genKeys = generateKeys()
        keys = await prisma.jwtKey.create({
            data: {
                privateKey: genKeys.privateKey,
                publicKey: genKeys.publicKey
            }
        })
        return {
            privateKey: keys.privateKey,
            publicKey: keys.publicKey
        }
    }
}