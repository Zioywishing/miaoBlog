<template>
    <div class="account-main">
        <el-button @click="handleLogout">登出</el-button>
    </div>
</template>

<script setup>
import useUserStore from '~/hooks/pinia/useUserStore';

const userStore = useUserStore()
const router = useRouter()

const handleLogout = () => {
    userStore.logout()
    router.push('/user/login')
}

</script>

<style lang="scss" scoped>
.account-main {
    padding: 10px 20px;
}
</style>