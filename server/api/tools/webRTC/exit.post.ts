import SSESocketRoom from "~/server/utils/class/SSESocketRoom"

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { roomid, menberid } = body;

    if (!roomid || !menberid) {
        throw createError({ statusCode: 400, statusMessage: 'Missing roomid or menberid' });
    }

    SSESocketRoom.exit({
        roomId: roomid,
        menberId: menberid
    });

    return {
        code: 200,
        msg: 'Exited successfully'
    };
});