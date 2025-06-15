// miaoBlog/server/api/posts/deletePost.ts
import DB from 'better-sqlite3';
import cacheResult from '~/server/utils/cacheRes';

function prepareDB() {
    const db = new DB('./userData/db/posts.db');

    const deletePostStmt = db.prepare('DELETE FROM posts WHERE id = ?');
    const deleteContentStmt = db.prepare('DELETE FROM postContent WHERE id = ?');
    const getTagIdStmt = db.prepare('SELECT tag_id FROM posts WHERE id = ?');
    const deleteTagsStmt = db.prepare('DELETE FROM tags WHERE id = ?');

    return { db, deletePostStmt, deleteContentStmt, getTagIdStmt, deleteTagsStmt };
}

export default defineEventHandler(async (event) => {
    const { db, deletePostStmt, deleteContentStmt, getTagIdStmt, deleteTagsStmt } = cacheResult(prepareDB)();

    const body = await readBody(event);
    const { id } = body;

    // 检查是否提供了有效的id
    if (!id || isNaN(Number(id))) {
        db.close();
        return {
            code: 400,
            msg: '无效的id'
        };
    }

    try {
        // 开启事务
        db.transaction(() => {
            // 先从posts表中删除文章记录
            deletePostStmt.run(Number(id));

            // 再从postContent表中删除文章内容记录
            deleteContentStmt.run(Number(id));

            // 查找该文章对应的tag_id
            const tagRow: any = getTagIdStmt.get(Number(id));
            if (tagRow && tagRow.tag_id) {
                // 如果存在tag_id，从tags表中删除对应的标签记录
                deleteTagsStmt.run(tagRow.tag_id);
            }
        })();

        // 清除缓存
        const storage = useStorage('cache');
        await storage.removeItem(`nitro:functions:post-content:${id}.json`);
        await storage.removeItem(`nitro:functions:post-md-content:${id}.json`);
        await storage.removeItem('nitro:functions:post-list:all-posts.json');

        db.close();
        return {
            code: 200,
            msg: '删除成功'
        };
    } catch (error) {
        console.error('删除数据时出错:', error);
        db.close();
        return {
            code: 500,
            msg: '服务器内部错误'
        };
    }
});