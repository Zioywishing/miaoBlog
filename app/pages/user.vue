<template>
    <div class="user-wrapper">
        <NuxtPage />
    </div>
</template>

<script setup lang="ts">
import useUserStore from '~/stores/useUserStore';
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
onBeforeMount(async () => {
    if (userStore && userStore.isLogin) {
        return router.replace('/user/main')
    } else {
        try {
            if (userStore.token) {
                const response = await $fetch('/api/user/refreshToken', {
                    method: 'POST',
                    body: {
                        token: userStore.token
                    }
                })
                userStore.setToken(response.token)
                userStore.setTokenExpireTime(response.expiresIn)
                userStore.setLoginStatus(true)
                if(route.path === '/user') {
                    router.replace('/user/main')
                }
            }
        } catch (error) {
            console.error(error)
            router.replace('/user/login')
        }
    }
})
</script>

<style lang="scss" scoped>
.user-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: 0 auto;
    min-height: inherit;
    // max-width: 800px;
    padding: 0;
}
</style>