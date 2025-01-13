import serverConfig from "../server.config"

const pathNeedAuth = serverConfig.auth.api

export default defineEventHandler((event) => {
    // console.log('New request: ' + getRequestURL(event))
    const path = getRequestURL(event).pathname
    if(pathNeedAuth.has(path)){
        // console.log('Auth needed')
        return true
    }
})