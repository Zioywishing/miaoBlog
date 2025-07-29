import useMiaoSSE from "~/server/utils/hooks/useMiaoSSE"
import SSESocketRoom from "~/server/utils/class/SSESocketRoom"

function generateRoomId() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

export default defineEventHandler(async (event) => {
    const sse = useMiaoSSE(event);
    const query = getQuery(event);
    const menberid = query.menberid as string;
    let roomid = (query.roomid as string) ?? generateRoomId();

    if (!menberid) {
        throw createError({ statusCode: 400, statusMessage: 'Missing menberid' });
    }

    const member = SSESocketRoom.join({
        roomId: roomid,
        sse,
        menberId: menberid
    });

    sse.write({
        roomid,
        menberid
    });

    await member.exitPromise

    return {
        code: 200,
        roomid,
        menberid
    };
});