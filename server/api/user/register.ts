import bcrypt from 'bcryptjs';
import BetterSqlite3 from 'better-sqlite3';

export default defineEventHandler(async (event) => {
    throw createError({ statusCode: 403, statusMessage: 'Registration is temporarily disabled' });
});