<template>
    <div>
        its the page which is used to test the api
        <div>
            <el-button @click="uploadTest">
                uploadPostTest
            </el-button>
            <el-button @click="editTest">
                editPostTest
            </el-button>
            <el-button @click="testLogin">
                testLogin
            </el-button>
            <el-button @click="testRegister">
                testRegister
            </el-button>
            <el-button @click="testRefreshToken">
                testRefreshToken
            </el-button>
            <el-button @click="testAuth">
                testAuth
            </el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import useUserStore from '~/hooks/pinia/useUserStore';
import useMiaoFetch, { testAuth } from '~/hooks/useMiaoFetch';

const { post: { uploadPost, updatePost } } = useMiaoFetch()

const userStore = useUserStore()

const uploadTest = () => {
    uploadPost({
        title: `测试上传`,
        summary: `测试摘要测试摘要测试摘要测试摘要测试摘要测试摘要测试摘要测试摘要测试摘要测试摘要测试摘要`,
        type: 'markdown',
        tags: ['test', 'test1'],
        url: '',
        date: parseInt(new Date().getTime().toFixed()),
        content: '测试上传测试上传测试上传测试上传测试上传测试上传测试上传测试上传测试上传测试上传测试上传测试上传测试上传测试上传测试上传'
    })
}

const editTest = () => {
    updatePost({
        id: 1,
        title: `测试上传`,
        summary: `测试摘要测试摘要测试摘要测试摘要测试摘要测试摘要测试摘要测试摘要测试摘要测试摘要测试摘要`,
        type: 'markdown',
        tags: ['test', 'test1'],
        url: '',
        date: parseInt(new Date().getTime().toFixed()),
        content: '测试上传测试上传测试上传测试上传测试上传测试上传测试上传测试上传测试上传测试上传测试上传测试上传测试上传测试上传测试上传'
    })
}

const testLogin = async () => {
    const response = await $fetch('/api/user/login', {
        method: 'POST',
        body: {
            username: 'admin',
            password: 'admin'
        }
    })
    const token = response.token
    userStore.setToken(token)
}

const testRegister = () => {
    $fetch('/api/user/register', {
        method: 'POST',
        body: {
            username: 'admin',
            password: 'admin'
        }
    })
}

const testRefreshToken = async () => {
    const response = await $fetch('/api/user/refreshToken', {
        method: 'POST',
        body: {
            token: userStore.token
        }
    })
    const token = response.token
    userStore.setToken(token)
}

onMounted(() => {
    // testAuth()
})

</script>

<style lang="scss" scoped></style>