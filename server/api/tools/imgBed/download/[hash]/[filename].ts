import { defineEventHandler, getRouterParam, sendRedirect } from 'h3';

export default defineEventHandler(async (event) => {
    const hash = getRouterParam(event, 'hash');
    // Ignore filename
    return sendRedirect(event, `/api/tools/imgBed/download/${hash}/`, 302);
});