// import { defineEventHandler, readBody, createError } from 'h3';
import bcrypt from 'bcryptjs';
import BetterSqlite3 from 'better-sqlite3';


export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { username, password } = body;

    // 查询用户
    const userDB = BetterSqlite3('./userData/db/user.db');
    const user: any = userDB.prepare('SELECT * FROM user WHERE username = ?').get(username);
    if (!user || password !== user.password) {
        userDB.close();
        throw createError({ statusCode: 401, statusMessage: 'Invalid username or password' });
    }

    // 更新最后登录时间
    userDB.prepare('UPDATE user SET lastLoginTime = ? WHERE id = ?').run(Date.now(), user.id);

    // 生成 JWT
    const token = createToken(user.id);

    userDB.close();

    return { token , expiresIn: Date.now() + 168 * 60 * 60 * 1000 };
});