<template>
    <div class="md-wrapper">
        <div v-if="status === 'pending' && !postData" class="h-[70vh] flex justify-center items-center w-full">
            <miao-loading></miao-loading>
        </div>
        <div v-else class="md">
            <div class="md-title">{{ postData?.title ?? "未知文章" }}</div>
            <div class="md-divider"></div>
            <markdown-render v-if="postData" :data="postData.data"></markdown-render>
        </div>
    </div>
</template>

<script setup lang="ts">
import markdownRender from '~/components/markdownRender.vue'

const route = useRoute()
const id = route.params.id as string

const { status, data: postData } = await useLazyFetch("/api/posts/getPostContent", {
    method: 'POST',
    body: {
        id: id
    },
    server: true,
    key: `post-content-${id}`,
})

if (import.meta.server) {
    function extractFirstImage(html: string): { url: string; alt: string } | null {
        const imgRegex = /<img[^>]+>/i;
        const imgTagMatch = html.match(imgRegex);

        if (!imgTagMatch) {
            return null;
        }

        const imgTag = imgTagMatch[0];
        const srcRegex = /src="([^"]+)"/i;
        const altRegex = /alt="([^"]*)"/i;

        const srcMatch = imgTag.match(srcRegex);
        const altMatch = imgTag.match(altRegex);

        const src = srcMatch ? srcMatch[1] : '';
        const alt = altMatch ? altMatch[1] : '';

        return src ? { url: src, alt } : null;
    }
    const imgData = extractFirstImage(postData.value!.data as string)
    useServerSeoMeta({
        // robots: 'index, follow',
        description: postData.value!.summary ?? 'Error',
        ogDescription: postData.value!.summary ?? 'Error',
        ...(imgData ? {
            ogImage: imgData,
        } : {}),
        keywords: postData.value!.tags && postData.value!.tags.join(","),
    })
}

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