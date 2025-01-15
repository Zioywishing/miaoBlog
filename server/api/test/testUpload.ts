import fs from 'fs';

export default defineEventHandler(async (event) => {
    const data = await readFormData(event)
    const file = data.get('file') as File
    const buffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(buffer)
    fs.writeFileSync('./userData/test.txt', uint8Array, {
        flag: 'w',
    })
    return {
        status: 200,
    }
})