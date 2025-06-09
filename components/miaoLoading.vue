<template>
    <div class="loading-wrapper" :class="{ 'h-custom': customHeight }" :style="customHeight ? `height: ${height}px` : ''">
        <div class="loading">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps({
    // 是否自定义高度
    customHeight: {
        type: Boolean,
        default: false
    },
    // 自定义高度值
    height: {
        type: Number,
        default: 160
    }
});
</script>

<style scoped>
.loading-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.loading-wrapper.h-custom {
    height: auto;
}

.h-full {
    height: calc(100vh - 60px);
}

.loading,
.loading>div {
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
</style> 