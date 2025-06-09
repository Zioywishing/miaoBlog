import fs from 'fs';
import { exec } from 'child_process';

export default defineEventHandler(async (event) => {
    let releaseInfo: any
    try {
        const { url } = await readBody(event)
        releaseInfo = await fetch(url).then(res => res.json())
        const buffer = await fetch(releaseInfo.assets.filter((_: { name: string; }) => _.name === "output.tar.gz")[0].browser_download_url)
            .then(res => res.arrayBuffer())
        setTimeout(() => {
            const uint8Array = new Uint8Array(buffer)
            fs.writeFileSync('./output.tar.gz', uint8Array, {
                flag: 'w',
            })
            setTimeout(() => {
                exec('nohup sh ./update.sh > update.nohup.log 2>&1 &')
            }, 500)
        }, 500)
        return {
            status: 200,
            releaseInfo
        }
    } catch (error) {
        console.error(error)
        return {
            status: 500,
            data: error,
            releaseInfo
        }
    }
})