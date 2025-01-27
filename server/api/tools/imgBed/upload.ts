// @ts-ignore
import DB from 'better-sqlite3';
import { defineEventHandler, readBody } from 'h3';
import crypto from 'crypto';
import fs from 'fs';

export default defineEventHandler(async (event) => {
    try {
        const data = await readFormData(event)
        const file = data.get('file') as File
        const expire = data.get('expire') as string
        console.log({
            file: file.name,
            expire,
        })
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        // 计算文件的 MD5 哈希值
        const hash = crypto.createHash('md5').update(fileBuffer).digest('hex');
        const fileName = file.name;
        const filePath = `./userData/imgBed/${hash}`;
        // 将文件写入磁盘
        await fs.promises.writeFile(filePath, fileBuffer);
        // 获取文件大小
        const fileSize = fileBuffer.length;

        const db = new DB('./userData/db/imgBed.db');
        // 插入数据到数据库
        db.prepare(`
            INSERT INTO imgBed (name, hash, size, expire)
            VALUES (?,?,?,?)
        `).run([fileName, hash, fileSize, expire]);
        db.close();

        return { code: 200, hash, fileName, fileSize, expire: Number(expire) + Date.now() };
    } catch (error) {
        console.error(error);
        return { code: 500, msg: 'Internal Server Error' };
    }
});