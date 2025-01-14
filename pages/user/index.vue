<template>
    <div class="loading-wrapper">
        <div class="loading">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </div>
    </div>
</template>

<script setup lang="ts">
import useUserStore from '~/hooks/pinia/useUserStore';

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

onBeforeMount(() => {
    if (userStore.isLogin === false) {
        return router.replace('/user/login')
    } else {
        return router.replace('/user/main')
    }
})
</script>

<style scoped>
.loading-wrapper {
    height: calc(100vh - 60px);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.loading,
.loading>div {
    /* scale: 1.5; */
    position: relative;
    box-sizing: border-box;
}

.loading {
    display: block;
    font-size: 0;
    color: #15aa87;
}

.loading>div {
    display: inline-block;
    float: none;
    background-color: currentColor;
    border: 0 solid currentColor;
}

.loading {
    width: 8px;
    height: 8px;
}

.loading>div {
    position: absolute;
    width: 12px;
    height: 12px;
    border-radius: 100%;
    transform: translate(-50%, -50%);
    animation: ball-fussion-ball1 1s 0s ease infinite;
}

.loading>div:nth-child(1) {
    top: 0;
    left: 50%;
    z-index: 1;
}

.loading>div:nth-child(2) {
    top: 50%;
    left: 100%;
    z-index: 2;
    animation-name: ball-fussion-ball2;
}

.loading>div:nth-child(3) {
    top: 100%;
    left: 50%;
    z-index: 1;
    animation-name: ball-fussion-ball3;
}

.loading>div:nth-child(4) {
    top: 50%;
    left: 0;
    z-index: 2;
    animation-name: ball-fussion-ball4;
}

@keyframes ball-fussion-ball2 {
    0% {
        opacity: 0.35;
    }

    50% {
        top: 200%;
        left: 200%;
        opacity: 1;
    }

    100% {
        top: 100%;
        left: 50%;
        z-index: 1;
        opacity: 0.35;
    }
}

@keyframes ball-fussion-ball1 {
    0% {
        opacity: 0.35;
    }

    50% {
        top: -100%;
        left: 200%;
        opacity: 1;
    }

    100% {
        top: 50%;
        left: 100%;
        z-index: 2;
        opacity: 0.35;
    }
}

@keyframes ball-fussion-ball3 {
    0% {
        opacity: 0.35;
    }

    50% {
        top: 200%;
        left: -100%;
        opacity: 1;
    }

    100% {
        top: 50%;
        left: 0;
        z-index: 2;
        opacity: 0.35;
    }
}

@keyframes ball-fussion-ball4 {
    0% {
        opacity: 0.35;
    }

    50% {
        top: -100%;
        left: -100%;
        opacity: 1;
    }

    100% {
        top: 0;
        left: 50%;
        z-index: 1;
        opacity: 0.35;
    }
}

/* 作者：德育处主任
链接：https://juejin.cn/post/7037036742985121800
来源：稀土掘金
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。 */
</style>