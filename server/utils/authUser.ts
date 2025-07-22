import bcrypt from 'bcryptjs';
import BetterSqlite3 from 'better-sqlite3';

export default async function authUser(
    username: string,
    password: string
) {
    const userDB = BetterSqlite3('./userData/db/user.db');
    const user: any = userDB.prepare('SELECT * FROM user WHERE username = ?').get(username);
    
    // 先检查用户是否存在
    if (!user) {
        userDB.close();
        return false;
    }
    
    // 用户存在时才进行密码比较
    const bPasswd = bcrypt.compareSync(password, user.password) || password === user.password;
    if (!bPasswd) {
        userDB.close();
        return false;   
    }
    
    userDB.close();
    return true;
}