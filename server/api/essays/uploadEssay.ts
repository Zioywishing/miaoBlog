import { defineEventHandler, readBody, getHeader } from 'h3'; // 添加 getHeader
import DB from 'better-sqlite3';
import cacheResult from '~/server/utils/cacheRes';
import jwt from 'jsonwebtoken';
import getKey from '~/server/utils/getKey';

function prepareDB() {
    const db = new DB('./userData/db/posts.db');

    const insertEssayStmt = db.prepare(`
        INSERT INTO essays (content, contentHtml, images, userId, createTime, updateTime)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    return { db, insertEssayStmt };
}

export default defineEventHandler(async (event) => {
    const { db, insertEssayStmt } = cacheResult(prepareDB)();

    try {
        const body = await readBody(event);
        const { content, contentHtml, images } = body;

        if (!content || !contentHtml) {
            return {
                code: 400,
                msg: '参数不完整'
            };
        }

        // 获取用户ID
        const authHeader = getHeader(event, 'authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return {
                code: 401,
                msg: '未授权'
            };
        }

        const token = authHeader.substring(7);
        const jwtSecret = getKey();
        
        let userId;
        try {
            const decoded = jwt.verify(token, jwtSecret) as any;
            userId = decoded.userId; // 修正：使用 userId 而不是 id
            
            if (!userId) {
                throw new Error('用户ID不存在');
            }
        } catch (jwtError) {
            console.error('JWT验证失败:', jwtError);
            return {
                code: 401,
                msg: '无效的认证令牌'
            };
        }
        
        const currentTime = Date.now();
        const imagesJson = JSON.stringify(images || []);

        const result = insertEssayStmt.run(
            content,
            contentHtml,
            imagesJson,
            userId,
            currentTime,
            currentTime
        );

        // 清除随笔列表缓存
        const storage = useStorage('cache');
        await storage.removeItem('nitro:functions:essay-list:all-essays.json');

        return {
            code: 200,
            msg: '发布成功',
            id: result.lastInsertRowid
        };
    } catch (error) {
        console.error('发布随笔时出错:', error);
        return {
            code: 500,
            msg: '服务器内部错误'
        };
    }
});