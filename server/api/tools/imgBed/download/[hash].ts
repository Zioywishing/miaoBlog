// @ts-ignore
import DB from 'better-sqlite3';
import { defineEventHandler, getRouterParam } from 'h3';
import fs from 'fs';
import { sendStream } from 'h3';

export default defineEventHandler(async (event) => {
    try {
        const hash = getRouterParam(event, 'hash');
        if (!hash) {
            return { code: 400, msg: 'Invalid hash parameter' };
        }
        const db = new DB('./userData/db/imgBed.db');
        // 从数据库中查询文件信息
        const fileInfo = db.prepare(`
            SELECT name, expire FROM imgBed WHERE hash =?
        `).get(hash) as { name: string, expire: number };
        db.close();

        if (!fileInfo) {
            return { code: 404, msg: 'File not found' };
        }

        const fileName = fileInfo.name;
        const filePath = `./userData/imgBed/${hash}`;
        // 检查文件是否存在
        if (!fs.existsSync(filePath)) {
            return { code: 404, msg: 'File not found on disk' };
        }
        const fileStream = fs.createReadStream(filePath);
        
        setResponseHeader(event, 'Content-Disposition', `inline; filename="${fileName}"`);
        setResponseHeader(event, 'Cache-Control', 'max-age=5184000');
        // 发送文件流
        return sendStream(event, fileStream);
    } catch (error) {
        console.error(error);
        return { code: 500, msg: 'Internal Server Error' };
    }
});