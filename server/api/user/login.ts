import bcrypt from 'bcryptjs';
import BetterSqlite3 from 'better-sqlite3';


export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { username, password } = body;

    // 查询用户
    const userDB = BetterSqlite3('./userData/db/user.db');
    const user: any = userDB.prepare('SELECT * FROM user WHERE username = ?').get(username);
    const authRes = await authUser(username, password);
    if(!authRes){
        userDB.close();
        throw createError({ statusCode: 401, statusMessage: 'Username or password is incorrect' });
    }

    // 更新最后登录时间
    userDB.prepare('UPDATE user SET lastLoginTime = ? WHERE id = ?').run(Date.now(), user.id);

    // 生成 JWT
    const token = createToken({ userId: user.id, password: user.password, username: user.username });

    userDB.close();

    return { token , expiresIn: Date.now() + 168 * 60 * 60 * 1000 };
});