import bcrypt from 'bcryptjs';
import BetterSqlite3 from 'better-sqlite3';

export default async function authUser(
    username: string,
    password: string
) {
    const userDB = BetterSqlite3('./userData/db/user.db');
    const user: any = userDB.prepare('SELECT * FROM user WHERE username = ?').get(username);
    const bPasswd = bcrypt.compareSync(password, user.password) || password === user.password;
    if (!user || !bPasswd) {
        userDB.close();
        return false;   
    }
    return true;
}