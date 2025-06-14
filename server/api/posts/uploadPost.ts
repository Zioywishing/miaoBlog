import DB from 'better-sqlite3';
import cacheResult from '~/server/utils/cacheRes';

function prepareDB() {
    const db = new DB('./userData/db/posts.db');

    const insertPostStmt = db.prepare(`
        INSERT INTO posts (title, summary, type, url, date, tag_id)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertContentStmt = db.prepare(`
        INSERT INTO postContent (id, content)
        VALUES (?, ?)
    `);

    const insertTagsStmt = db.prepare(`
        INSERT INTO tags (tag1, tag2, tag3, tag4, tag5, tag6, tag7, tag8, tag9, tag10, tag11, tag12, tag13, tag14, tag15)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertContentHTMLStmt = db.prepare(`
        INSERT INTO postContentHTML (id, content)
        VALUES (?, ?)
    `);

    return { db, insertPostStmt, insertContentStmt, insertTagsStmt, insertContentHTMLStmt };
}

export default defineEventHandler(async (event) => {
    const { db, insertPostStmt, insertContentStmt, insertTagsStmt, insertContentHTMLStmt } = cacheResult(prepareDB)();

    const body = await readBody(event);
    const { title, summary, content, type, url, date, tags: _tags, contentHtml } = body;

    if ([title, summary, content, contentHtml, type, url, date, _tags].some(field => field === undefined)) {
        return {
            code: 400,
            msg: '参数不完整'
        };
    }

    // 确保_tags是一个数组
    const tagsArray = Array.isArray(_tags) ? _tags : [_tags];
    // 填充或截取前15个标签
    const tags = tagsArray.slice(0, 15).concat(new Array(15 - tagsArray.length).fill(null));

    try {
        const postId = db.transaction(() => {
            // 插入tags数据并获取其ID
            const tagsResult = insertTagsStmt.run(...tags);
            const tagId = tagsResult.lastInsertRowid;

            // 插入posts数据
            const postResult = insertPostStmt.run(title, summary, type, url, date, tagId);
            const postId = postResult.lastInsertRowid;

            // 插入content数据
            insertContentStmt.run(postId, content);

            // 插入HTML内容
            insertContentHTMLStmt.run(postId, contentHtml);

            return postId;
        })();

        return {
            code: 200,
            msg: '插入成功',
            id: postId
        };
    } catch (error) {
        console.error('插入数据时出错:', error);
        return {
            code: 500,
            msg: '服务器内部错误'
        };
    }
});