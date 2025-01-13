import fs from 'fs';
import checkUserData from '~/server/utils/checkUserData';

export default defineEventHandler((event) => {
    checkUserData()
    const res = fs.readdirSync('userData')
    return {
        res
    }
})