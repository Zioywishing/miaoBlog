import { defineEventHandler } from 'h3';
import DB from 'better-sqlite3';

// 使用缓存函数获取文章列表
const getPostsList = defineCachedFunction(
    async () => {
        const db = new DB('./userData/db/posts.db');

        // 获取所有标签
        const tagsMap = new Map<number, string[]>();
        const tagsRows = db.prepare('SELECT id, tag1, tag2, tag3, tag4, tag5, tag6, tag7, tag8, tag9, tag10, tag11, tag12, tag13, tag14, tag15 FROM tags').all();
        tagsRows.forEach((row: any) => {
            const tags = [];
            for (let i = 1; i <= 15; i++) {
                const tag = row[`tag${i}`];
                if (tag) {
                    tags.push(tag);
                }
            }
            tagsMap.set(row.id, tags);
        });

        // 获取所有文章
        const posts = db.prepare('SELECT id, title, summary, type, tag_id, url, date FROM posts').all();

        // 替换tag_id为标签数组
        posts.forEach((post: any) => {
            post.tags = tagsMap.get(post.tag_id) || [];
        });

        db.close();
        
        return posts.reverse();
    },
    {
        maxAge: 60 * 60 * 24, // 24小时
        name: 'post-list',
        getKey: () => 'all-posts'
    }
);

export default defineEventHandler(async () => {
    const posts = await getPostsList();

    return {
        code: 200,
        data: posts
    };
});