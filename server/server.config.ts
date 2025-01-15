export default {
    auth: {
        // 需要进行鉴权的api
        api: new Set([
            '/api/test/testDir',
            '/api/posts/editPost',
            '/api/posts/uploadPost',
            '/api/user/updatePassword',
            '/api/system/update'
        ])
    }
}