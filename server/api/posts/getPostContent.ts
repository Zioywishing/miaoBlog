// @ts-ignore
import testData from "~/public/testData/test.md"
import DB from 'better-sqlite3';

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const id = body.id;
  if (!id || isNaN(Number(id))) {
    return {
      code: 400,
      msg: '无效的id'
    };
  }

  const db = new DB('./userData/db/posts.db');
  const post: any = db.prepare('SELECT * FROM posts WHERE id = ?').get(Number(id));
  const content: any = db.prepare('SELECT content FROM postContent WHERE id = ?').get(Number(id));
  db.close();

  if (!post) {
    return {
      code: 404,
      msg: '文章不存在'
    };
  }

  if (!content) {
    return {
      code: 404,
      msg: '文章内容不存在'
    };
  }

  return {
    code: 200,
    data: content.content,
    title: post.title
  };
})