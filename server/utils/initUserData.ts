import mkfileIfNotExist from "./mkfileIfNotExist"
import db from 'better-sqlite3'

let checked = false

/**
 * 检查并完善userData的目录结构，若不存在密钥则生成随机的密钥，初始化数据库
 * @returns {void}
 */
function checkUserData() {
    if (checked) return
    checked = true
    // console.log('check userData')
    const dirList = [
        './userData/',
        './userData/db/',
    ]
    dirList.forEach(mkdirIfNotExist)

    mkfileIfNotExist('./userData/key.txt', new Array(2048).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''))

    createDB()

}

function createDB() {
    const userDB = new db('./userData/db/user.db');
    const postsDB = new db('./userData/db/posts.db');

    userDB.exec(`
        CREATE TABLE IF NOT EXISTS user (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            createTime INTEGER NOT NULL,
            lastLoginTime INTEGER NOT NULL
        );
    `);

    postsDB.exec(`
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            date INTEGER NOT NULL,
            summary TEXT NOT NULL,
            type TEXT NOT NULL,
            url TEXT NOT NULL,
            tag_id INTEGER NOT NULL,
            FOREIGN KEY(tag_id) REFERENCES tags(id)
        );
    `);

    postsDB.exec(`
        CREATE TABLE IF NOT EXISTS postContent (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT NOT NULL
        );
    `);

    postsDB.exec(`
        CREATE TABLE IF NOT EXISTS tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tag1 TEXT,
            tag2 TEXT,
            tag3 TEXT,
            tag4 TEXT,
            tag5 TEXT,
            tag6 TEXT,
            tag7 TEXT,
            tag8 TEXT,
            tag9 TEXT,
            tag10 TEXT,
            tag11 TEXT,
            tag12 TEXT,
            tag13 TEXT,
            tag14 TEXT,
            tag15 TEXT
        );
    `);

    postsDB.close();
    userDB.close();
}

export default checkUserData