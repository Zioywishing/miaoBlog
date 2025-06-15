// @ts-ignore
import DB from 'better-sqlite3';
import { postItem } from "~/types/post";

const emptyPost = {
  id: 0,
  title: '',
  tags: [] as string[],
  date: 0,
  summary: '',
  type: 'markdown',
  url: '',
  data: '',
}

// 使用缓存函数获取文章内容
const getPost = defineCachedFunction(
  async (id: number) => {
    const db = new DB('./userData/db/posts.db');
    const rawPost: any = db.prepare(`
      SELECT 
        p.*,
        t.tag1, t.tag2, t.tag3, t.tag4, t.tag5, 
        t.tag6, t.tag7, t.tag8, t.tag9, t.tag10,
        t.tag11, t.tag12, t.tag13, t.tag14, t.tag15
      FROM posts p
      LEFT JOIN tags t ON p.tag_id = t.id
      WHERE p.id = ?
    `).get(Number(id));
    
    if (!rawPost) {
      db.close();
      return null;
    }
    
    // 将所有非空标签收集到一个数组中
    const tags: string[] = [];
    for (let i = 1; i <= 15; i++) {
      const tag = rawPost[`tag${i}`];
      if (tag) tags.push(tag);
    }
    
    // 构建符合 postItem 类型的对象
    const post = {
      id: rawPost.id,
      title: rawPost.title,
      date: rawPost.date,
      summary: rawPost.summary,
      type: rawPost.type,
      url: rawPost.url,
      tag_id: rawPost.tag_id,
      tags: tags
    } as postItem;
    
    const contentHTML: any = db.prepare('SELECT content FROM postContentHTML WHERE id = ?').get(Number(id));
    db.close();
    
    if (!contentHTML) {
      return { post, content: null };
    }
    
    return { post, content: contentHTML.content };
  },
  {
    maxAge: 60 * 60 * 24, // 24小时
    name: 'post-content',
    getKey: (id: number) => String(id)
  }
);

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const id = body.id;
  if (!id || isNaN(Number(id))) {
    return {
      code: 400,
      msg: '无效的id',
      ...emptyPost
    };
  }

  const result = await getPost(Number(id));
  
  if (!result) {
    return {
      code: 404,
      msg: '文章不存在',
      ...emptyPost
    };
  }

  if (!result.content) {
    return {
      code: 404,
      msg: '文章内容不存在',
      ...emptyPost
    };
  }

  return {
    code: 200,
    data: result.content as string,
    ...result.post
  };
})