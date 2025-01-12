import type { postItem } from "~/types/post";

function generateFakeData(length: number) {
    const data: postItem[] = [];
    for (let i = 0; i < length; i++) {
        data.push({
            id: i,
            title: `测试标题`,
            summary: `测试摘要测试摘要测试摘要测试摘要测试摘要测试摘要测试摘要测试摘要测试摘要测试摘要测试摘要`,
            type: 'markdown',
            tags: ['test', 'test1'],
            url: '',
            date: parseInt(new Date().getTime().toFixed()),
        });
    }
    return data;
}

export default defineEventHandler((event) => {
    const data = generateFakeData(50)
    return data
})