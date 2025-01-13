import jwt from "jsonwebtoken"
import getKey from "./getKey"


export default function createToken(payload: { userId: number, password: string, username: string }): string {
    const key = getKey()
    return jwt.sign(payload, key, { expiresIn: '168h' })
}