import { sign } from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'

const getKey = cacheRes(() => fs.readFileSync(path.join(process.cwd(), 'userData/key.txt'), 'utf-8') as string)

export default getKey