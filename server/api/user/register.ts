import bcrypt from 'bcryptjs';
import BetterSqlite3 from 'better-sqlite3';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { username, password } = body;

    // 检查用户名是否已存在
    const userDB = BetterSqlite3('./userData/db/user.db');
    const existingUser = userDB.prepare('SELECT * FROM user WHERE username = ?').get(username);
    if (existingUser) {
        userDB.close();
        throw createError({ statusCode: 400, statusMessage: 'Username already exists' });
    }

    // 哈希密码
    // const salt = getKey().substring(0, 10);
    // const hashedPassword = bcrypt.hashSync(password, salt);
    const hashedPassword = password

    // 插入新用户
    const createTime = Date.now();
    const lastLoginTime = createTime;
    const stmt = userDB.prepare('INSERT INTO user (username, password, createTime, lastLoginTime) VALUES (?, ?, ?, ?)');
    const result = stmt.run(username, hashedPassword, createTime, lastLoginTime);

    // 生成 JWT
    const userId = result.lastInsertRowid as number;
    const token = createToken(userId);

    userDB.close();

    return { token, expiresIn: Date.now() + 168 * 60 * 60 * 1000 };
});