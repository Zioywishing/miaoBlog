import mkfileIfNotExist from "./mkfileIfNotExist"
import DB from 'better-sqlite3'
import fs from 'fs'

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
        './userData/imgBed/',
    ]
    dirList.forEach(mkdirIfNotExist)

    mkfileIfNotExist('./userData/key.txt', new Array(2048).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''))

    createDB()

}

function createDB() {
    createUserDB();
    createPostsDB();
    createImgBedDB();
}


const createUserDB = () => {
    const userDB = new DB('./userData/db/user.db');
    userDB.exec(`
        CREATE TABLE IF NOT EXISTS user (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            createTime INTEGER NOT NULL,
            lastLoginTime INTEGER NOT NULL
        );
    `);
    userDB.close();
}

const createPostsDB = () => {
    const postsDB = new DB('./userData/db/posts.db');
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
        CREATE TABLE IF NOT EXISTS postContentHTML (
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
    
    // 添加随笔表
    postsDB.exec(`
        CREATE TABLE IF NOT EXISTS essays (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT NOT NULL,
            contentHtml TEXT NOT NULL,
            images TEXT, -- JSON格式存储图片URL数组
            userId INTEGER NOT NULL,
            createTime INTEGER NOT NULL,
            updateTime INTEGER NOT NULL
        );
    `);
    
    postsDB.close();
}

const createImgBedDB = () => {
    const imgBedDB = new DB('./userData/db/imgBed.db');
    imgBedDB.exec(`
        CREATE TABLE IF NOT EXISTS imgBed (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            hash TEXT NOT NULL,
            size INTEGER NOT NULL,
            expire INTEGER NOT NULL
        );
    `);
    imgBedDB.close();
    setInterval(cleanExpiredFiles_imgBed, 1000 * 30 * 60 );
    // cleanExpiredFiles_imgBed()
}

const cleanExpiredFiles_imgBed = async () => {
    try {
        const db = new DB('./userData/db/imgBed.db');
        const currentTime = Date.now();
        // 从数据库中查询过期文件的哈希
        const expiredFiles = db.prepare(`
            SELECT hash FROM imgBed WHERE expire <?
        `).all(currentTime) as {
            hash: string;
        }[];
        db.close();

        for (const file of expiredFiles) {
            const hash = file.hash;
            const filePath = `./userData/imgBed/${hash}`;
            // 检查文件是否存在
            if (fs.existsSync(filePath)) {
                // 删除文件
                fs.unlinkSync(filePath);
            }
        }

        // 从数据库中删除过期文件的记录
        const db2 = new DB('./userData/db/imgBed.db');
        db2.prepare(`
            DELETE FROM imgBed WHERE expire <?
        `).run(currentTime);
        db2.close();
    } catch (error) {
        console.error('Error cleaning expired files:', error);
    }
};

export default checkUserData