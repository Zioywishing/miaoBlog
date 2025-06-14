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
            :disabled="disableEdit" @save="handleSubmit" :content_mdit_rendered="content_mdit_rendered" />
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
import { debounce } from 'lodash-es';
import useMarkdownit from '~/hooks/useMarkdownit';
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

const mdit = ref<any>()

const content_mdit_rendered = computed(() => {
    return mdit.value?.render(content.value) ?? ""
})

const last_upload_content = ref<string>('')

// 等待加载完成才允许编辑
const disableEdit = ref(true)

const message = ref<{ type: "" | "success" | "warning" | "info" | "primary" | "danger", message: string }>()

// 使用lodash-es的debounce实现防抖保存
const handleSubmit = debounce(async () => {
    if (id.value === -1) {
        await handleUpload()
    } else {
        await handleUpdate()
    }
}, 500, {
    leading: true,
})

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
        } catch (e) {
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

        // 显示上传中提示
        const loadingMessage = ElMessage({
            type: 'info',
            message: '文章上传中...',
            duration: 0
        })

        const response = await uploadPost({
            title: title.value,
            summary: summary.value,
            tags: tags.value,
            url: '',
            content: content_mdit_rendered.value,
            type: 'markdown',
            date: Date.now()
        })

        // 关闭上传中的提示
        loadingMessage.close()

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
        ElMessage.success('文章保存成功')
        last_upload_content.value = content.value
        const store = useDefaultStore()
        store.deleteCache('posts')
        isNewPost.value = false
    } catch (error) {
        console.error(error)
        message.value = {
            type: 'danger',
            message: '上传出错'
        }
        ElMessage.error('文章上传失败')
    }
}

const handleUpdate = async () => {
    try {
        message.value = {
            type: 'info',
            message: '上传中'
        }

        // 显示保存中提示
        const loadingMessage = ElMessage({
            type: 'info',
            message: '文章保存中...',
            duration: 0
        })

        const response = await updatePost({
            id: id.value,
            title: title.value,
            summary: summary.value,
            tags: tags.value,
            url: '',
            content: content_mdit_rendered.value,
            type: 'markdown',
            date: Date.now()
        })

        // 关闭保存中的提示
        loadingMessage.close()

        if (response.code !== 200) {
            throw ('response')
        }
        message.value = {
            type: 'success',
            message: '上传成功'
        }
        ElMessage.success('文章保存成功')
        last_upload_content.value = content.value
        const store = useDefaultStore()
        store.deleteCache('posts')
    } catch (error) {
        console.error(error)
        message.value = {
            type: 'danger',
            message: '上传出错'
        }
        ElMessage.error('文章保存失败')
    }
}

const handleBack = () => {
    router.back()
}

watch(content, (_) => {
    if (last_upload_content.value !== content.value) {
        message.value = {
            type: "info",
            message: '更新未同步'
        }
    } else {
        message.value = {
            type: 'info',
            message: ''
        }
    }
})

onMounted(async () => {
    if (route.params.id !== 'new') {
        message.value = {
            type: 'info',
            message: '初始化中'
        }
        id.value = parseInt(route.params.id as string)
        let res: resType;
        [mdit.value, res] = await Promise.all([useMarkdownit(), getPost(id.value)]) as [any, any]
        id.value = res.id
        title.value = res.title
        summary.value = res.summary
        tags.value = []
        content.value = res.data
        last_upload_content.value = content.value
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