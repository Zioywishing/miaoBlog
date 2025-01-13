import serverConfig from "../server.config"
// import { verify } from 'jsonwebtoken'
import jwt from 'jsonwebtoken'
import getKey from "../utils/getKey"

const pathNeedAuth = serverConfig.auth.api

export default defineEventHandler((event) => {
    const key = getKey()
    const path = getRequestURL(event).pathname
    if (pathNeedAuth.has(path)) {
        const authHeader = event.node.req.headers.authorization
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
        }
        const token = authHeader.split('Bearer ')[1].trim()
        try {
            const decoded = jwt.verify(token, key)
            // 将用户ID挂载到事件对象，供后续使用
            // event.context.userId = decoded.userId
        } catch (err) {
            throw createError({ statusCode: 401, statusMessage: 'Token invalid or expired' })
        }
    }
})