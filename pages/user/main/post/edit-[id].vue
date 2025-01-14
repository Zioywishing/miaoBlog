<!-- 若route.params.id为new则为新建而非修改 -->
<template>
    <div class="post-editor-wrapper">
        <editor v-model:title="title" v-model:summary="summary" v-model:tags="tags" v-model:content="content" />
        <el-row>
            <el-col :span="24">
                <div class="flex-end">
                    <el-text v-if="message" :type="message.type">{{ message.message }}</el-text>
                    <el-button @click="handleSubmit" style="margin-left: 10px;">
                        upload
                    </el-button>
                </div>
            </el-col>
        </el-row>
    </div>
</template>

<script setup lang="ts">
import editor from '~/components/user/postEditor.vue';
import useDefaultStore from '~/hooks/pinia/useDefaultStore';
import useFetch from '~/hooks/useMiaoFetch';
import type { postItem } from '~/types/post';

type resType = {
    data: string
} & postItem


const { post: { getPost, updatePost, uploadPost } } = useFetch()

const route = useRoute()

const id = ref<number>(-1)
const title = ref<string>('')
const summary = ref<string>('')
const tags = ref<string[]>([])
const content = ref<string>('')

const message = ref<{ type: "" | "success" | "warning" | "info" | "primary" | "danger", message: string }>()

const handleSubmit = () => {
    if (id.value === -1) {
        handleUpload()
    } else {
        handleUpdate()
    }
}

const handleUpload = async () => {
    try {
        const response = await uploadPost({
            title: title.value,
            summary: summary.value,
            tags: tags.value,
            url: '',
            content: content.value,
            type: 'markdown',
            date: Date.now()
        })
        if (response.code !== 200) {
            throw ('response')
        }
        // @ts-ignore
        id.value = response.id
        console.log(id.value)
        message.value = {
            type: 'success',
            message: '上传成功'
        }
        const store = useDefaultStore()
        store.deleteCache('posts')
    } catch (error) {
        console.error(error)
        message.value = {
            type: 'danger',
            message: '上传出错'
        }
    }
}

const handleUpdate = async () => {
    try {
        const response = await updatePost({
            id: id.value,
            title: title.value,
            summary: summary.value,
            tags: tags.value,
            url: '',
            content: content.value,
            type: 'markdown',
            date: Date.now()
        })
        if (response.code !== 200) {
            throw ('response')
        }
        message.value = {
            type: 'success',
            message: '上传成功'
        }
        const store = useDefaultStore()
        store.deleteCache('posts')
    } catch (error) {
        console.error(error)
        message.value = {
            type: 'danger',
            message: '上传出错'
        }
    }
}

onMounted(async () => {
    console.log('route', route.params.id, route.params.id === 'new')
    if (route.params.id !== 'new') {
        id.value = parseInt(route.params.id as string)
        const res = await getPost(id.value) as any as resType
        console.log(res)
        id.value = res.id
        title.value = res.title
        summary.value = res.summary
        tags.value = []
        content.value = res.data
    }
})
</script>

<style scoped>
.post-editor-wrapper {
    /* box-sizing: border-box; */
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 20px;
}

.flex-end {
    display: flex;
    justify-content: flex-end;
}
</style>