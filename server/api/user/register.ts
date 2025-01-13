import bcrypt from 'bcryptjs';
import BetterSqlite3 from 'better-sqlite3';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { username, password } = body;
    const userDB = BetterSqlite3('./userData/db/user.db');

    // 临时使用，若表中已有用户，则拒绝创建新的用户
    const existingUser = userDB.prepare('SELECT * FROM user').get();
    if (existingUser) {
        userDB.close();
        throw createError({ statusCode: 400, statusMessage: 'User already exists' });
    }

    // // 检查用户名是否已存在
    // const existingUser = userDB.prepare('SELECT * FROM user WHERE username = ?').get(username);
    // if (existingUser) {
    //     userDB.close();
    //     throw createError({ statusCode: 400, statusMessage: 'Username already exists' });
    // }

    // 哈希密码，暂未实现，未来实现
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
    const token = createToken({ userId, password: hashedPassword, username });

    userDB.close();

    return { token, expiresIn: Date.now() + 168 * 60 * 60 * 1000 };
});