<template>
    <div class="md-wrapper">
        <div class="md" v-if="postData">
            <div class="md-title">{{ postData.title }}</div>
            <div class="md-divider"></div>
            <markdown-render :data="postData.content"></markdown-render>
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
const id = route.params.id as string

// 使用useFetch来获取文章内容，支持SSR
const { data: fetchedPost } = await useFetch('/api/posts/getPostContent', {
    method: 'POST',
    body: {
        id
    },
    transform: async (response: postContent) => {
        // 缓存数据
        postStore.setPostCache(id, response)
        
        // 渲染Markdown
        const markdownIt = await useMarkdownit()
        
        return {
            title: response.title,
            content: response.data,
            rendered: markdownIt.render(response.data)
        }
    },
    // 使用缓存
    async onRequest({ options }) {
        const cache = postStore.getPostCache(id)
        if (cache) {
            return { 
                title: cache.title, 
                content: cache.data,
                rendered: (await useMarkdownit()).render(cache.data)
            }
        }
    }
})

// 响应式数据
const postData = computed(() => fetchedPost.value)
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