// import { defineEventHandler, readBody, createError } from 'h3';
import bcrypt from 'bcryptjs';
import BetterSqlite3 from 'better-sqlite3';

// 暂未实现

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { oldPassword, newPassword } = body;
    const userId = event.context.user.id;

    // 查询用户
    const userDB = new BetterSqlite3('./userData/db/user.db');
    const user: any = userDB.prepare('SELECT * FROM user WHERE id = ?').get(userId);
    if (!user || !bcrypt.compareSync(oldPassword, user.password)) {
        userDB.close();
        throw createError({ statusCode: 401, statusMessage: 'Invalid old password' });
    }

    // 哈希新密码
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPassword, salt);

    // 更新密码
    userDB.prepare('UPDATE user SET password = ? WHERE id = ?').run(hashedPassword, userId);

    // 生成新的 JWT
    const token = createToken({ userId, password: user.password, username: user.username });

    userDB.close();

    return { token , expiresIn: Date.now() + 168 * 60 * 60 * 1000 };
});