import DB from 'better-sqlite3';
import cacheResult from '~~/server/utils/cacheRes';
import jwt from 'jsonwebtoken';
import getKey from '~~/server/utils/getKey';
import { defineEventHandler, readBody, getHeader } from 'h3'; // 添加必要的导入

function prepareDB() {
    const db = new DB('./userData/db/posts.db');

    const updateEssayStmt = db.prepare(`
        UPDATE essays
        SET content = ?, contentHtml = ?, images = ?, updateTime = ?
        WHERE id = ? AND userId = ?
    `);

    const getEssayStmt = db.prepare(`
        SELECT userId FROM essays WHERE id = ?
    `);

    return { db, updateEssayStmt, getEssayStmt };
}

export default defineEventHandler(async (event) => {
    const { db, updateEssayStmt, getEssayStmt } = cacheResult(prepareDB)();

    const body = await readBody(event);
    const { id, content, contentHtml, images } = body;

    if ([id, content, contentHtml].some(field => field === undefined)) {
        return {
            code: 400,
            msg: '参数不完整'
        };
    }

    // 获取用户ID
    const authHeader = event.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
            code: 401,
            msg: '未授权'
        };
    }

    const token = authHeader.substring(7);
    const jwtSecret = getKey();
    
    try {
        const decoded = jwt.verify(token, jwtSecret) as any;
        const userId = decoded.userId; // 修正：使用 userId 而不是 id
        
        // 检查随笔是否存在且属于当前用户
        const essay = getEssayStmt.get(id) as { userId: number };
        if (!essay) {
            return {
                code: 404,
                msg: '随笔不存在'
            };
        }
        
        if (essay.userId !== userId) {
            return {
                code: 403,
                msg: '无权限编辑此随笔'
            };
        }

        const currentTime = Date.now();
        const imagesJson = JSON.stringify(images || []);

        updateEssayStmt.run(
            content,
            contentHtml,
            imagesJson,
            currentTime,
            id,
            userId
        );

        // 清除随笔列表缓存
        const storage = useStorage('cache');
        await storage.removeItem('nitro:functions:essay-list:all-essays.json');

        return {
            code: 200,
            msg: '更新成功'
        };
    } catch (error) {
        console.error('更新随笔时出错:', error);
        return {
            code: 500,
            msg: '服务器内部错误'
        };
    }
});