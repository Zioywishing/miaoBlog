import jwt from "jsonwebtoken"
import getKey from "./getKey"


export default function createToken(userId: number): string {
    const key = getKey()
    return jwt.sign({ userId }, key, { expiresIn: '168h' })
}