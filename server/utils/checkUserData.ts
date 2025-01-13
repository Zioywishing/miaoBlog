import mkfileIfNotExist from "./mkfileIfNotExist"

let checked = false

/**
 * 检查并完善userData的目录结构，若不存在密钥则生成随机的密钥
 * @returns {void}
 */
const checkUserData = () => {
    if (checked) return
    checked = true
    // console.log('check userData')
    const dirList = [
        './userData/',
        './userData/db/',
        './userData/md/',
    ]
    dirList.forEach(mkdirIfNotExist)
    mkfileIfNotExist('./userData/key.txt', new Array(2048).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''))
}

export default checkUserData