import serverConfig from "../server.config"
// import { verify } from 'jsonwebtoken'
import jwt from 'jsonwebtoken'
import getKey from "../utils/getKey"

const pathNeedAuth = serverConfig.auth.api

export default defineEventHandler(async (event) => {
    const path = getRequestURL(event).pathname
    if (pathNeedAuth.has(path)) {
        const key = getKey()
        // @ts-ignore
        const authHeader = event.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
        }
        const token = authHeader.split('Bearer ')[1].trim()
        try {
            const decoded = jwt.verify(token, key) as { userId: number, password: string, username: string, exp: number }
            if (decoded.exp > Date.now()) {
                throw createError({ statusCode: 401, statusMessage: 'Token invalid or expired', data: { err: 'token expired', token } })
            }
            // console.log(decoded)
            // 将用户ID挂载到事件对象，供后续使用
            // event.context.userId = decoded.userId
        } catch (err) {
            throw createError({ statusCode: 401, statusMessage: 'Token invalid or expired', data: { err, token } })
        }
    }
})