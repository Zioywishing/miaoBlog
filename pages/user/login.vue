<template>
    <div class="login-warpper">
        <div class="login-card">
            <div class="login-logo">
                <cat></cat>
            </div>
            <!-- <div>杪Blog后台</div> -->
            <div class="login-form">
                <el-input class="login-form-input" v-model="username" placeholder="用户名" />
                <el-input class="login-form-input" @keyup.enter="handleLogin" v-model="password" placeholder="密码" type="password" show-password />
                <div :class="['login-form-message', `login-form-message-${message.type}`]">
                    <span>{{ message.message }}</span>
                    <nuxt-link to="/user/register">注册账户</nuxt-link>
                </div>
                <div class="login-form-button-warpper">
                    <el-button class="login-form-button" @click="handleLogin">
                        登 录
                    </el-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import useUserStore from '~/hooks/pinia/useUserStore';
import cat from '~/components/icons/cat.vue';
import useMiaoFetch from '~/hooks/useMiaoFetch';

const { user: { login } } = useMiaoFetch()
const router = useRouter()
const userStore = useUserStore()

const username = ref('')
const password = ref('')
// username.value = '539943419'
// password.value = 'zjh030628'
// onMounted(() => handleLogin())

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

const handleLogin = async () => {
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
        message: '登录中...'
    }
    try {
        const res = await login({
            username: username.value,
            password: password.value
        })
        isLogining = false
        message.value = {
            type: 'default',
            message: '登录成功'
        }
        userStore.setLoginStatus(true)
        userStore.setToken(res.token)
        userStore.setTokenExpireTime(res.expiresIn)
        router.push('/user/main')
    } catch (e) {
        isLogining = false
        // @ts-ignore
        const code = e.statusCode ?? undefined
        console.log(code, code === 401)
        if (code === 401) {
            message.value = {
                type: 'warning',
                message: '用户名或密码错误'
            }
        } else {
            message.value = {
                type: 'warning',
                message: '登录失败'
            }
        }
    }
}

onBeforeMount(() => {
    if (userStore.isLogin === true) {
        return router.push('/user/main')
    }
})
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

                & > a {
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

    // &::before {
    //     content: '';
    //     display: block;
    //     width: 20vw;
    //     aspect-ratio: 1;
    //     border-radius: 50%;
    //     background-color: aqua;
    //     position: absolute;
    //     top: 0;
    //     left: 40%;
    // }

    // &::after {
    //     content: '';
    //     display: block;
    //     width: 20vw;
    //     aspect-ratio: 1;
    //     border-radius: 50%;
    //     background-color: rgb(35, 191, 79);
    //     position: absolute;
    //     bottom: 0;
    //     left: 40%;
    // }
}
</style>


<style>
/* .login-form-input .el-input__wrapper {
    transition: box-shadow .3s ease;
}
.login-form-input .el-input__wrapper.is-focus {
    box-shadow: 0 0 0 1px #15aa87 !important;
} */
</style>