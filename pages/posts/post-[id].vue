<template>
    <div class="md-wrapper">
        <div class="md" v-if="isInit">
            <div class="md-title">{{ title }}</div>
            <n-divider />
            <div v-html="renderedData"></div>
        </div>
        <div v-else class="md-skeleton-item">
            <n-skeleton text style="height: 40px; width: 60%" />
            <n-skeleton text :repeat="2" />
            <n-skeleton text style="height: 40px; width: 60%" />
            <n-skeleton text :repeat="6" />
        </div>
    </div>
</template>

<script setup lang="ts">
import useMarkdownit from '~/hooks/useMarkdownit';
import usePostStore from '~/hooks/pinia/usePostStore';
import type { postContent } from '~/types/post';

const postStore = usePostStore()

const route = useRoute()

const isInit = ref(false)

const title = ref('')

const renderedData = ref('')

onMounted(async () => {
    const id = route.params.id as string

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
</style>