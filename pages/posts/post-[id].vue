<template>
    <div class="md-wrapper">
        <div class="md" v-if="isInit">
            <div class="md-title">{{ title }}</div>
            <div class="md-divider"></div>
            <markdown-render :data="content"></markdown-render>
        </div>
        <div v-else class="md-skeleton-item">
            <el-skeleton :rows="12" />
        </div>
    </div>
</template>

<script setup lang="ts">
import useMarkdownit from '~/hooks/useMarkdownit';
import usePostStore from '~/hooks/pinia/usePostStore';
import markdownRender from '~/components/markdownRender.vue';
import type { postContent } from '~/types/post';

const postStore = usePostStore()

const route = useRoute()

const isInit = ref(false)

const title = ref('')

const content = ref('')

const renderedData = ref('')

const id = route.params.id as string

onMounted(async () => {

    const _p = new Promise<postContent>(async (resolve, reject) => {
        try {
            const cache = postStore.getPostCache(id)
            if (cache) {
                resolve(cache)
                return
            }
            const res = await $fetch('/api/posts/getPostContent', {
                method: 'POST',
                body: {
                    id
                }
            }) as postContent
            postStore.setPostCache(id, res)
            resolve(res)
        } catch (error) {
            reject(error)
        }
    })

    const markdownIt = await useMarkdownit()

    const postsData = await _p

    content.value = postsData.data

    renderedData.value = markdownIt.render(postsData.data)

    title.value = postsData.title

    isInit.value = true

})

</script>

<style scoped>
.md-wrapper {
    width: 100%;
    padding: 10px 20px 30px;

    box-sizing: border-box;
}

.md-skeleton-item {
    display: flex;
    flex-direction: column;
    gap: 30px;
    padding-top: 30px;
}

.md {
    font-family: fangsong;
}

.md-title {
    display: flex;
    justify-content: center;
    font-size: 42px;
    margin-bottom: -10px;
}

.md-divider {
    width: 100%;
    height: 1px;
    background-color: #e8e8e8;
    margin: 30px 0;
}
</style>