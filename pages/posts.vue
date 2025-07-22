<template>
    <div class="user-wrapper">
        <miao-collapse :show="showNav">
            <div class="mt-3 flex justify-between gap-2 items-center select-none">
                <nuxt-link to="/posts" class=" transition-colors"
                    :style="{ color: isNotEssay ? 'var(--color-spring)' : '' }">文章</nuxt-link>
                <span style="transform: translateY(-1px);user-select: none;">/</span>
                <nuxt-link to="/posts/essay" class=" transition-colors"
                    :style="{ color: isNotEssay ? '' : 'var(--color-spring)' }">随笔</nuxt-link>
            </div>
        </miao-collapse>
        <!-- <Suspense> -->
        <NuxtPage />
        <!-- </Suspense> -->
    </div>
</template>

<script setup lang="ts">

const route = useRoute()

const isNotEssay = computed(() => route.path !== '/posts/essay')


const showNav = computed(() => {
    // 当路由包含 edit- 时隐藏导航栏
    return !route.path.includes('/posts/post-');
})
</script>

<style lang="scss" scoped>
.user-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: 0 auto;
    max-width: 800px;
    padding: 0;
}
</style>