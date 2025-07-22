import { defineEventHandler } from 'h3';
import DB from 'better-sqlite3';

// 使用缓存函数获取随笔列表
const getEssaysList = defineCachedFunction(
    async () => {
        const postsDB = new DB('./userData/db/posts.db');
        const userDB = new DB('./userData/db/user.db');

        try {
            // 先从posts.db获取随笔数据
            const essays = postsDB.prepare(`
                SELECT * FROM essays ORDER BY createTime DESC
            `).all();

            // 获取所有用户信息
            const users = userDB.prepare(`SELECT id, username FROM user`).all();
            const userMap = new Map(users.map((u: any) => [u.id, u.username]));

            // 处理图片JSON字段并关联用户名
            const processedEssays = essays.map((essay: any) => {
                let images = [];
                try {
                    images = JSON.parse(essay.images || '[]');
                } catch (e) {
                    images = [];
                }
                
                return {
                    id: essay.id,
                    content: essay.content,
                    contentHtml: essay.contentHtml,
                    images,
                    userId: essay.userId,
                    username: userMap.get(essay.userId) || '未知用户',
                    createTime: essay.createTime,
                    updateTime: essay.updateTime
                };
            });

            return processedEssays;
        } finally {
            postsDB.close();
            userDB.close();
        }
    },
    {
        maxAge: 1000 * 60 * 5, // 5分钟缓存
        name: 'essay-list',
        getKey: () => 'all-essays'
    }
);

export default defineEventHandler(async (event) => {
    try {
        const essays = await getEssaysList();
        return {
            code: 200,
            data: essays
        };
    } catch (error) {
        console.error('获取随笔列表时出错:', error);
        return {
            code: 500,
            msg: '服务器内部错误'
        };
    }
});