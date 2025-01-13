import { defineEventHandler, readBody, createError } from 'h3';
import jwt from 'jsonwebtoken';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { token } = body;

    const jwtSecret = getKey();

    try {
        // 验证旧的 Token
        const decoded = jwt.verify(token, jwtSecret) as any;
        // 生成新的 Token
        const newToken = jwt.sign({
            username: decoded.username,
            password: decoded.password,
            userId: decoded.userId,
        }, jwtSecret, { expiresIn: '168h' });

        return { token: newToken, expiresIn: Date.now() + 168 * 60 * 60 * 1000 };
    } catch (err) {
        throw createError({ statusCode: 401, statusMessage: 'Token invalid or expired', data: { err, token } });
    }
});