// editPost.ts
import DB from 'better-sqlite3';
import cacheResult from '~/server/utils/cacheRes';

function prepareDB() {
    const db = new DB('./userData/db/posts.db');

    const updatePostStmt = db.prepare(`
        UPDATE posts
        SET title = ?, summary = ?, type = ?, url = ?, date = ?, tag_id = ?
        WHERE id = ?
    `);

    const updateContentStmt = db.prepare(`
        UPDATE postContent
        SET content = ?
        WHERE id = ?
    `);

    const updateContentHTMLStmt = db.prepare(`
        UPDATE postContentHTML
        SET content = ?
        WHERE id = ?
    `);

    const updateTagsStmt = db.prepare(`
        UPDATE tags
        SET tag1 = ?, tag2 = ?, tag3 = ?, tag4 = ?, tag5 = ?,
            tag6 = ?, tag7 = ?, tag8 = ?, tag9 = ?, tag10 = ?,
            tag11 = ?, tag12 = ?, tag13 = ?, tag14 = ?, tag15 = ?
        WHERE id = ?
    `);

    const insertTagsStmt = db.prepare(`
        INSERT INTO tags (tag1, tag2, tag3, tag4, tag5, tag6, tag7, tag8, tag9, tag10, tag11, tag12, tag13, tag14, tag15)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return { updatePostStmt, updateContentStmt, updateContentHTMLStmt, updateTagsStmt, insertTagsStmt, db };
}

export default defineEventHandler(async (event) => {
    const { updatePostStmt, updateContentStmt, updateContentHTMLStmt, updateTagsStmt, insertTagsStmt, db } = cacheResult(prepareDB)();

    const body = await readBody(event);
    const { id, title, summary, tags: _tags, type, url, date, content, contentHtml } = body;

    if ([id, title, summary, _tags, type, url, date, content, contentHtml].some(item => item === undefined)) {
        return {
            code: 400,
            msg: '参数错误',
            body
        }
    }

    const tagsArray = Array.isArray(_tags) ? _tags : [_tags];
    const tags = tagsArray.slice(0, 15).concat(new Array(15 - tagsArray.length).fill(null));

    try {
        db.transaction(() => {
            // 检查是否存在tag_id，如果不存在则插入新标签
            const tagRow: any = db.prepare(`SELECT tag_id FROM posts WHERE id = ?`).get(id);
            if (tagRow.tag_id) {
                // 更新现有标签
                updateTagsStmt.run(...tags, tagRow.tag_id);
            } else {
                // 插入新标签并获取tag_id
                const tagResult = insertTagsStmt.run(...tags);
                const tagId = tagResult.lastInsertRowid;
                // 更新posts表中的tag_id
                updatePostStmt.run(title, summary, type, url, date, tagId, id);
            }

            // 更新posts表
            updatePostStmt.run(title, summary, type, url, date, tagRow.tag_id, id);

            // 更新postContent表（MD格式）
            updateContentStmt.run(content, id);
            
            // 更新postContentHTML表（HTML格式）
            updateContentHTMLStmt.run(contentHtml, id);
        })();

        // 清除缓存
        const storage = useStorage('cache');
        await storage.removeItem(`nitro:functions:post-content:${id}.json`);
        await storage.removeItem(`nitro:functions:post-md-content:${id}.json`);
        await storage.removeItem('nitro:functions:post-list:all-posts.json');

        return {
            code: 200,
            msg: '更新成功'
        };
    } catch (error) {
        console.error('更新数据时出错:', error);
        return {
            code: 500,
            msg: '服务器内部错误'
        };
    }
});