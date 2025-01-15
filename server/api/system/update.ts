import fs from 'fs';
import { exec } from 'child_process';

export default defineEventHandler(async (event) => {
    const data = await readFormData(event)
    const file = data.get('file') as File
    const buffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(buffer)
    fs.writeFileSync('./userData/test.txt', uint8Array, {
        flag: 'w',
    })
    setTimeout(() => {
        exec('nohup sh ./update.sh > update.nohup.log 2>&1 &')
    }, 500)
    return {
        status: 200,
    }
})