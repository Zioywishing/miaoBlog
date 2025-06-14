<template>
    <div class="md-wrapper">
        <div v-if="status === 'pending'" class="h-[70vh] flex justify-center items-center w-full">
            <miao-loading></miao-loading>
        </div>
        <div v-else class="md">
            <div class="md-title">{{ (postData as any).title }}</div>
            <div class="md-divider"></div>
            <markdown-render v-if="postData?.data" :data="postData?.data ?? ''"></markdown-render>
        </div>
    </div>
</template>

<script setup lang="ts">
import markdownRender from '~/components/markdownRender.vue'

const route = useRoute()
const id = route.params.id as string

const { status, data: postData } = await useLazyFetch<{ data: string, title: string }>("/api/posts/getPostContent", {
    method: 'POST',
    body: {
        id: id
    },
    server: true,
    key: `post-content-${id}`,
})!

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