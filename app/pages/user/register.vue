<template>
    <div class="login-warpper">
        <div class="login-card">
            <div class="login-logo">
                <cat></cat>
            </div>
            <!-- <div>杪Blog后台</div> -->
            <div class="login-form">
                <el-input class="login-form-input" v-model="username" placeholder="用户名" />
                <el-input class="login-form-input" @keyup.enter="handleRegister" v-model="password" placeholder="密码" type="password" show-password />
                <div :class="['login-form-message', `login-form-message-${message.type}`]">
                    <span>{{ message.message }}</span>
                    <nuxt-link to="/user/login">登录账户</nuxt-link>
                </div>
                <div class="login-form-button-warpper">
                    <el-button class="login-form-button" @click="handleRegister">
                        注 册
                    </el-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import useUserStore from '~/stores/useUserStore';
import cat from '~/components/icons/cat.vue';
import useMiaoFetch from '~/composables/useMiaoFetch';

const { user: { register } } = useMiaoFetch()
const router = useRouter()
const userStore = useUserStore()

const username = ref('')
const password = ref('')

let isLogining = false

const message = ref({
    type: 'warning',
    message: ''
})

watch(() => username.value + password.value, () => {
    message.value = {
        type: 'default',
        message: '',
    }
})

const handleRegister = async () => {
    if (isLogining) return
    if (username.value === '' || password.value === '') {
        message.value = {
            type: 'warning',
            message: '用户名或密码不能为空'
        }
        return
    }
    isLogining = true

    message.value = {
        type: 'default',
        message: '注册中...'
    }
    try {
        const res = await register({
            username: username.value,
            password: password.value
        })
        message.value = {
            type: 'default',
            message: '注册成功'
        }
        userStore.setLoginStatus(true)
        userStore.setToken(res.token)
        userStore.setTokenExpireTime(res.expiresIn)
        router.push('/user')
    } catch (e) {
        message.value = {
            type: 'warning',
            message: '注册失败'
        }
    }
}
</script>

<style lang="scss" scoped>
.login-warpper {
    width: 100%;
    margin: 0 auto;
    min-height: calc(100vh - 60px);
    display: flex;
    flex-direction: column;
    justify-content: center;

    .login-card {
        position: relative;
        width: 300px;
        // aspect-ratio: 9/16;
        border-radius: 20px;
        margin: auto;
        box-shadow: rgba(50, 50, 93, 0.25) 0px 30px 60px -12px inset, rgba(0, 0, 0, 0.3) 0px 18px 36px -18px inset;

        .login-logo {
            width: 100px;
            height: 100px;
            // aspect-ratio: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 80px auto 40px;

            svg {
                width: 100%;
                aspect-ratio: 1;
            }
        }

        .login-form {
            width: 180px;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: center;
            gap: 15px;
            margin: 40px auto 80px;

            &-message {
                margin: -10px 0 0px;
                width: 100%;
                text-align: left;
                font-size: 10px;
                user-select: none;
                display: flex;
                justify-content: space-between;

                &-warning {
                    color: #f56c6c;
                }

                &-default {
                    color: #15aa87;
                }

                &>a {
                    color: #15aa87;
                    text-decoration: none;
                }
            }

            &-input {
                padding: 0;
                width: 100%;
                --el-input-focus-border-color: #15aa87;
                --el-input-hover-border-color: #15aa875d;
            }

            &-button-warpper {
                .login-form-button {
                    width: 150px;
                    --el-button-active-border-color: #15aa87;
                    --el-button-hover-border-color: #15aa875d;
                    --el-button-hover-bg-color: #ffffff;
                    --el-button-hover-text-color: #15aa87;
                    --el-button-outline-color: #15aa87a0;
                }
            }
        }
    }
}
</style>