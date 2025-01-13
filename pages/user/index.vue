<template>
    <div>
        <el-button @click="handleLogout">
            logout
        </el-button>
        <nuxt-link to="user/test"> test</nuxt-link>
    </div>
</template>

<script setup lang="ts">
import useUserStore from '~/hooks/pinia/useUserStore';

const router = useRouter()
const userStore = useUserStore()

const handleLogout = () => {
    userStore.logout()
    router.push('user/login')
}

onBeforeMount(() => {
    if (userStore.isLogin === false) {
        return router.push('user/login')
    }
})
</script>

<style scoped></style>