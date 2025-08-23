import SSESocketRoom from "~~/server/utils/class/SSESocketRoom"

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { roomid, menberid, data } = body;

    if (!roomid || !menberid || !data) {
        throw createError({ statusCode: 400, statusMessage: 'Missing roomid, menberid or data' });
    }

    SSESocketRoom.broadcast({
        roomId: roomid,
        menberId: menberid,
        data
    });

    return {
        code: 200,
        msg: 'Broadcast successful'
    };
});