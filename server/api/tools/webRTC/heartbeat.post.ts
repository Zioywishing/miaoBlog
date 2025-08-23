import SSESocketRoom from "~~/server/utils/class/SSESocketRoom"

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { roomid, menberid } = body;

    if (!roomid || !menberid) {
        throw createError({ statusCode: 400, statusMessage: 'Missing roomid or menberid' });
    }

    const member = SSESocketRoom.getMenber({
        roomId: roomid,
        menberId: menberid
    })

    if (member) {
        member.refreshTimer();
        return {
            code: 200,
            msg: 'Heartbeat received'
        };
    }

    throw createError({ statusCode: 404, statusMessage: 'Member not found in room' });
});