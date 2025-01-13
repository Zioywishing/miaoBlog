// import bcrypt from 'bcryptjs';
import BetterSqlite3 from 'better-sqlite3';

export default defineEventHandler(async (event) => {
    // const body = await readBody(event);
    const userDB = BetterSqlite3('./userData/db/user.db');

    // 临时使用，若表中已有用户，则拒绝创建新的用户
    const existingUser = userDB.prepare('SELECT * FROM user').get();
    userDB.close();
    if (existingUser) {
        return true
    } else {
        return false
    }
});