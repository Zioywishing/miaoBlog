import fs from 'fs';

export default defineEventHandler((event) => {
    const res = fs.readdirSync('./')
    return {
        res
    }
})