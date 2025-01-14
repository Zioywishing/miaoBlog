<template>
    <div>
        edit: id-{{ route.params.id }}
        <editor v-model:id="id" v-model:title="title" v-model:summary="summary" v-model:tags="tags"
            v-model:content="content"></editor>
        <el-button @click = handleUpdate>
            upload
        </el-button>
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


const { post: { getPost, updatePost } } = useFetch()

const route = useRoute()

const id = ref<number>(-1)
const title = ref<string>('title')
const summary = ref<string>('summary')
const tags = ref<string[]>([])
const content = ref<string>('content')

const handleUpdate = () => {
    updatePost({
        id: id.value,
        title: title.value,
        summary: summary.value,
        tags: tags.value,
        url: '',
        content: content.value,
        type: 'markdown',
        date: Date.now()
    })
    const store = useDefaultStore()
    store.deleteCache('posts')
}

onBeforeMount(async () => {

    id.value = parseInt(route.params.id as string)
    const res = await getPost(id.value) as any as resType
    console.log(res)
    id.value = res.id
    title.value = res.title
    summary.value = res.summary
    tags.value = []
    content.value = res.data
})
</script>

<style scoped></style>