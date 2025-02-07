import bcrypt from 'bcryptjs';
import BetterSqlite3 from 'better-sqlite3';
// import { defineEventHandler, createError, readBody } from 'h3';
import jwt from 'jsonwebtoken';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { oldPassword, newPassword } = body;
    const jwtSecret = getKey();
    const authHeader = event.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }
    const token = authHeader.split('Bearer ')[1].trim()

    try {
        // 验证 Token
        const decoded = jwt.verify(token, jwtSecret) as any;
        const username = decoded.username;
        const userDB = BetterSqlite3('./userData/db/user.db');

        // 查找用户
        const user: any = userDB.prepare('SELECT * FROM user WHERE username =?').get(username);
        if (!user) {
            userDB.close();
            throw createError({ statusCode: 404, statusMessage: 'User not found' });
        }

        // 验证旧密码是否正确
        const authRes = await authUser(username, oldPassword);
        if (!authRes) {
            userDB.close();
            throw createError({ statusCode: 401, statusMessage: 'Old password is incorrect' });
        }
        const hashedNewPassword = bcrypt.hashSync(newPassword, 10);

        // 更新密码
        const stmt = userDB.prepare('UPDATE user SET password =? WHERE username =?');
        const result = stmt.run(hashedNewPassword, username);
        if (result.changes === 0) {
            userDB.close();
            throw createError({ statusCode: 500, statusMessage: 'Failed to update password' });
        }

        // 重新生成 JWT
        const newToken = jwt.sign({
            username: decoded.username,
            password: hashedNewPassword,
            userId: decoded.userId,
        }, jwtSecret, { expiresIn: '168h' });

        userDB.close();

        return { token: newToken, expiresIn: Date.now() + 168 * 60 * 60 * 1000 };
    } catch (err) {
        return { statusCode: 401, statusMessage: 'Token invalid or expired', data: { err, token } };
    }
});