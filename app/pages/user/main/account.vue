<template>
    <div class="account-main">
      <el-container>
        <el-header>
            <h1>账户设置</h1>
        </el-header>
        <el-main>
            <el-divider content-position="left">
                <h2>修改密码</h2>
            </el-divider>
            <p>请输入原密码和新密码以修改密码</p>
            <el-row style="margin-bottom: 10px;">
                <el-col :span="24">
                    <el-input v-model="oldPassword" placeholder="原密码" type="password" show-password />
                </el-col>
            </el-row>
            <el-row style="margin-bottom: 10px;">
                <el-col :span="24">
                    <el-input v-model="newPassword" placeholder="新密码" type="password" show-password />
                </el-col>
            </el-row>
            <el-row style="margin-bottom: 10px;">
                <el-col :span="24">
                    <el-input v-model="newPasswordVerify" placeholder="再次输入新密码" type="password" show-password />
                </el-col>
            </el-row>
            <el-row style="margin-bottom: 10px;">
                <el-col :span="24">
                    <el-button type="primary" @click="handleChangePassword" :disabled="disableChangingPassword">
                        修改密码
                    </el-button>
                </el-col>
            </el-row>
            <el-divider content-position="left" style="margin: 40px 0;">
                <h2>登出</h2>
            </el-divider>
            <el-row>
                <!-- <el-col :span="4"></el-col> -->
                <el-col :span="20">
                    <el-button @click="handleLogout">
                        登出
                    </el-button>
                </el-col>
            </el-row>
        </el-main>
      </el-container>
    </div>
</template>

<script setup>
import useUserStore from '~/stores/useUserStore';
import { useRouter } from 'vue-router';
import { ref } from 'vue';

const userStore = useUserStore();
const router = useRouter();

const oldPassword = ref('');
const newPassword = ref('');
const newPasswordVerify = ref('');


const disableChangingPassword = computed(() => {
    return !oldPassword.value || !newPassword.value || !newPasswordVerify.value;
});

const handleChangePassword = async () => {
    try {
        if (newPassword.value !== newPasswordVerify.value) {
            ElMessage.error('两次输入的新密码不一致');
            return;
        }
        const response = await $fetch('/api/user/updatePassword', {
            method: 'POST',
            body: {
                oldPassword: oldPassword.value,
                newPassword: newPassword.value,
            },
            headers: {
                Authorization: `Bearer ${userStore.token}`,
            },
        })
        userStore.setToken(response.token);
        userStore.setTokenExpireTime(response.expiresIn);
        ElMessage.success('密码修改成功');
    } catch (error) {
        ElMessage.error('修改密码出错');
        console.error('修改密码出错', error);
    } finally {
    }
};

const handleLogout = () => {
    userStore.logout();
    router.push('/user/login');
};
</script>

<style lang="scss" scoped>
.account-main {
    position: relative;
    padding: 10px 20px;
    max-width: 800px;
    margin: 0px auto;
    h1 {
        font-size: xx-large;
    }
    h2 {
        font-size: larger;
    }
    p {
        color: #595959;
        // font-size: small;
    }
}

.flex-end {
    display: flex;
    justify-content: flex-end;
}
</style>