<template>
    <div>
        its the page which is used to test the api
        <div>
            <el-button v-for="item in Object.entries(testFunctionList)" @click="item[1]">
                {{ item[0] }}
            </el-button>
            <div>
                测试更新
                <el-upload :auto-upload="false" v-model="fileList" action="/api/system/update" ref="uploadRef" :headers="headers">
                    <template #trigger>
                        <el-button type="primary">select file</el-button>
                    </template>
                    <el-button class="ml-3" type="success" @click="submitUpload">
                        upload to server
                    </el-button>
                </el-upload>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import useUserStore from '~/hooks/pinia/useUserStore';
import useMiaoFetch, { testAuth } from '~/hooks/useMiaoFetch';
import type { UploadProps, UploadUserFile } from 'element-plus'

const { post: { uploadPost, updatePost } } = useMiaoFetch()

const fileList = ref<UploadUserFile[]>([])
const userStore = useUserStore()

const uploadRef = ref()

const headers = computed(() => {
    return {
        Authorization: `Bearer ${userStore.token}`
    }
})

const submitUpload = () => {
  uploadRef.value!.submit()
}

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

const testToolShiquLikeApi = async () => {
    const id = 29729408
    const likes = 3
    const sse = new EventSource(`/api/tools/shiqu/like?id=${id}&likes=${likes}`);
    sse.onopen = function (event) {
        console.log('Connection opened');
    };
    sse.onmessage = function (event) {
        console.log('Received message:', event.data);
    };
    sse.onerror = function (event) {
        console.error('Error occurred:', event);
        sse.close()
    };
}



const testFunctionList = {
    uploadTest,
    editTest,
    testLogin,
    testRegister,
    testRefreshToken,
    testToolShiquLikeApi
}

onMounted(() => {
    // testAuth()
})

</script>

<style lang="scss" scoped></style>