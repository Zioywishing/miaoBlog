export default {
    auth: {
        // 需要进行鉴权的api
        api: new Set([
            '/api/test/testDir',
            '/api/posts/editPost',
            '/api/posts/uploadPost',
            '/api/posts/deletePost',
            '/api/user/updatePassword',
            '/api/system/update',
            '/api/system/updateFromGithub',
            '/api/system/info',
            '/api/system/performance'
        ])
    }
}