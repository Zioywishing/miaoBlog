<template>
    <div class="flex justify-center items-center min-h-[inherit]">
        <miaoLoading />
    </div>
</template>

<script setup lang="ts">
import useUserStore from '~/hooks/pinia/useUserStore';
// const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// definePageMeta({
//     middleware: [
//         function (to, from) {
//             // if (userStore.isLogin === false) {
//             //     return navigateTo('user/login')
//             // }
//             console.log(to, from)
//         }
//     ]
// })

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
                // // if(route.)
                // console.log(route)
                router.replace('/user/main')
            } else {
                router.replace('/user/login')
            }
        } catch (error) {
            console.error(error)
            router.replace('/user/login')
        }
    }
})
</script>

<style scoped>
/* 样式已移至miaoLoading组件中 */
</style>