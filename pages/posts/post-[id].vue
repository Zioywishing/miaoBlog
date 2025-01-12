<template>
    <div class="md-render">
        <div v-if="isInit" v-html="renderedData"></div>
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

const route = useRoute()

const isInit = ref(false)

const renderedData = ref('')

onMounted(async () => {
    const id = route.params.id

    const _p = $fetch('/api/posts/getPostContent', {
        method: 'POST',
        body: {
            id
        }
    })

    const markdownIt = await useMarkdownit()

    const postsData = await _p

    renderedData.value = markdownIt.render(postsData.data)

    isInit.value = true

})

</script>

<style scoped>
.md-render {
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
</style>