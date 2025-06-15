<template>
    <div class="flex justify-center items-center min-h-[inherit]">
        <miaoLoading />
    </div>
</template>

<script setup lang="ts">
import useUserStore from '~/hooks/pinia/useUserStore';

if (import.meta.client) {
    const timer = setTimeout(() => {
        const userStore = useUserStore()
        const router = useRouter()
        const route = useRoute()
        route.path === '/user' && userStore.isLogin ? router.replace('/user/main') : router.replace('/user/login')
    }, 2000)

    onUnmounted(() => {
        clearTimeout(timer)
    })
}

</script>

<style scoped>
/* 样式已移至miaoLoading组件中 */
</style>