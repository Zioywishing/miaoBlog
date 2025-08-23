import useMiaoSSE from "~~/server/utils/hooks/useMiaoSSE"

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

export default defineEventHandler(async (event) => {
    const sse = useMiaoSSE(event)
    const query = getQuery(event)
    const id = Number(query.id)
    const likes = Number(query.likes)
    const likeCountBefore = await getPraiseCount(id)
    sse.write({
        likeCountBefore,
    })
    for (let i = 0; i < likes; i++) {
        await praise(id)
        sse.write({
            process: i + 1,
            percent: Math.round((i + 1) / likes * 100)
        })
        await sleep(100)
    }
    const likeCountAfter = await getPraiseCount(id)
    sse.write({
        likeCountAfter,
    })
    return {
        code: 200,
        msg: 'success',
        id, likes
    }
})

/**
 * Description 刷赞函数，运行一次刷1个赞
 * @param {number} id  作品id
 * @returns {number} 刷赞成功次数
 */
const praise = async (id: number): Promise<number> => {
    const sid = generateRandomSid();
    let success_count = 0;

    try {
        const response = await fetch(`https://shiqu.zhilehuo.com/api/soundRecord/praise?soundRecordId=${id}&paraSid=${sid}`, {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "zh-CN,zh;q=0.9",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "cookie": `sid=${sid}`,
                "Referer": `https://shiqu.zhilehuo.com/page/record/soundRecordDetail.html?source=share&id=${id}&code=011CrS000ZlKxS1qQH300N6Ia90CrS0E&state=sq2019`,
                "Referrer-Policy": "unsafe-url"
            },
            "body": null,
            "method": "GET"
        });
        const result = await response.json();
        if (result.code === 0) {
            success_count += 1;
        }
        // if (success_count > 0) {
        //     console.log(`帮忙点赞${success_count}次`);
        // }
        return success_count;
    } catch (e) {
        console.error(e);
        return -1;
    }
};

/**
 * Description 获取对应作品赞数
 * @param {number} id  作品id
 * @returns {number}
 */
const getPraiseCount = async (id: number): Promise<number> => {
    try {
        const response = await fetch(`https://shiqu.zhilehuo.com/api/soundRecord/getSoundRecordDetail?id=${id}&from=share&startDate=&endDate=&sg=`, {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "zh-CN,zh;q=0.9",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "cookie": `sid=${generateRandomSid()}`,
                "Referer": `https://shiqu.zhilehuo.com/page/record/soundRecordDetail.html?source=share&id=${id}`,
                "Referrer-Policy": "unsafe-url"
            },
            "body": null,
            "method": "GET"
        });
        const result = await response.json();
        return result.data.praiseCount;
    } catch (e) {
        console.error(e);
        return -1;
    }
};

/**
 * Description 伪造sid
 * @returns {string}
 */
const generateRandomSid = () => {
    const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    const separator = "-";
    const length = 28;

    let result = "";
    for (let i = 0; i < length; i++) {
        if (i === length / 2) {
            result += separator;
        } else {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters.charAt(randomIndex);
        }
    }

    return result;
};
