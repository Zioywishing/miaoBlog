import bcrypt from "bcryptjs";
import BetterSqlite3 from "better-sqlite3";

let skipTestExistUser = false;

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { username, password } = body;

  const userDB = BetterSqlite3("./userData/db/user.db");

  if (!skipTestExistUser) {
    // 检查是否有任何用户
    const existingUser = userDB.prepare("SELECT * FROM user LIMIT 1").get();

    if (!existingUser) {
      // 如果没有用户，注册新用户
      const hashedPassword = bcrypt.hashSync(password, 10);
      const createTime = Date.now();
      const lastLoginTime = createTime;
      const stmt = userDB.prepare(
        "INSERT INTO user (username, password, createTime, lastLoginTime) VALUES (?, ?, ?, ?)"
      );
      const result = stmt.run(
        username,
        hashedPassword,
        createTime,
        lastLoginTime
      );
      const userId = result.lastInsertRowid as number;

      // 生成 token
      const token = createToken({ userId, password: hashedPassword, username });
      userDB.close();
      return { token, expiresIn: Date.now() + 168 * 60 * 60 * 1000 };
    } else {
      skipTestExistUser = true;
    }
  }

  // 现有登陆逻辑
  const user: any = userDB
    .prepare("SELECT * FROM user WHERE username = ?")
    .get(username);
  const authRes = await authUser(username, password);
  if (!authRes) {
    userDB.close();
    throw createError({
      statusCode: 401,
      statusMessage: "Username or password is incorrect",
    });
  }

  // 更新最后登录时间
  userDB
    .prepare("UPDATE user SET lastLoginTime = ? WHERE id = ?")
    .run(Date.now(), user.id);

  // 生成 JWT
  const token = createToken({
    userId: user.id,
    password: user.password,
    username: user.username,
  });

  userDB.close();

  return { token, expiresIn: Date.now() + 168 * 60 * 60 * 1000 };
});
