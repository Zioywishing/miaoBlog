<!-- 若route.params.id为new则为新建而非修改 -->
<template>
    <div class="post-editor-wrapper">
        <div class="post-editor-header">
            <div class="post-editor-header-back" @click="handleBack">
                <chevronDown></chevronDown>
                返回
            </div>
        </div>
        <editor v-model:title="title" v-model:summary="summary" v-model:tags="tags" v-model:content="content"
            :disabled="disableEdit" />
        <el-row>
            <el-col :span="24">
                <div class="flex-end">
                    <el-text v-if="message" :type="message.type" style="user-select: none;">{{ message.message
                        }}</el-text>
                    <el-button @click="handleClickDelete" style="margin-left: 10px;" v-if="!isNewPost" type="danger">
                        删除文章
                    </el-button>
                    <el-button @click="handleSubmit" style="margin-left: 10px;" type="primary">
                        {{ isNewPost ? "上传文章" : "更新文章" }}
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
import chevronDown from "~/components/icons/chevronDown.vue";
// import type { Action } from 'element-plus/es/components/index.mjs';

type resType = {
    data: string
} & postItem


const { post: { getPost, updatePost, uploadPost, deletePost } } = useFetch()

const route = useRoute()
const router = useRouter()

const isNewPost = ref(route.params.id === 'new')

const id = ref<number>(-1)
const title = ref<string>('')
const summary = ref<string>('')
const tags = ref<string[]>([])
const content = ref<string>('')

// 等待加载完成才允许编辑
const disableEdit = ref(true)

const message = ref<{ type: "" | "success" | "warning" | "info" | "primary" | "danger", message: string }>()

const handleSubmit = () => {
    if (id.value === -1) {
        handleUpload()
    } else {
        handleUpdate()
    }
}

const handleClickDelete = async () => {
    try {
        await ElMessageBox.confirm(
            '是否确定删除本篇文章？',
            '警告',
            {
                confirmButtonText: '删除',
                cancelButtonText: '取消',
                type: 'warning',
            }
        )
        await ElMessageBox.confirm(
            '再次确认删除本篇文章',
            '警告',
            {
                confirmButtonText: '删除',
                cancelButtonText: '取消',
                type: 'warning',
            }
        )
        try {
            const response = await deletePost(id.value)
            if (response.code !== 200) {
                throw (response.code)
            }
            ElMessage({
                type: 'success',
                message: '删除文章完成',
            })
            const store = useDefaultStore()
            store.deleteCache('posts')
            router.back()
        } catch(e) {
            console.error(e)
            ElMessage({
                type: 'error',
                message: '删除失败',
            })
        }
    } catch {
    }
}

const handleUpload = async () => {
    try {
        message.value = {
            type: 'info',
            message: '上传中'
        }
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
        // console.log(id.value)
        message.value = {
            type: 'success',
            message: '上传成功'
        }
        const store = useDefaultStore()
        store.deleteCache('posts')
        isNewPost.value = false
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
        message.value = {
            type: 'info',
            message: '上传中'
        }
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

const handleBack = () => {
    router.back()
}

watch(content, (_) => {
    message.value = {
        type: "info",
        message: '更新未同步'
    }
})

onMounted(async () => {
    if (route.params.id !== 'new') {
        message.value = {
            type: 'info',
            message: '初始化中'
        }
        id.value = parseInt(route.params.id as string)
        const res = await getPost(id.value) as any as resType
        id.value = res.id
        title.value = res.title
        summary.value = res.summary
        tags.value = []
        content.value = res.data
        disableEdit.value = false


        message.value = {
            type: 'info',
            message: ''
        }
    } else {
        disableEdit.value = false
    }
})
</script>

<style lang="scss" scoped>
.post-editor-wrapper {
    /* box-sizing: border-box; */
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 20px;
}

.post-editor-header {

    &-back {
        width: fit-content;
        display: flex;
        justify-content: space-between;
        align-items: center;
        user-select: none;

        svg {
            width: 18px;
            transform: rotate(90deg) translateX(1px);
            margin-right: 3px;
        }

        &:hover {
            cursor: pointer;
        }
    }
}

.flex-end {
    display: flex;
    justify-content: flex-end;
}
</style>