<template>
    <div class="miao-collapse-warpper" ref="cwRef" :style="cwStyle">
        <div class="miao-collapse" ref="cRef" :style="cStyle">
            <slot></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    show: {
        type: Boolean,
        default: true,
    }
})
const cwRef = ref<HTMLDivElement>()
const cRef = ref<HTMLDivElement>()
const cwStyle = ref<{ [key: string]: string | number }>({
    maxHeight: '99999vh',
})
const cStyle = ref<{ [key: string]: string | number }>({})

let originHeight = -1

let timer: any[] = []

const clearTimer = () => {
    timer.forEach((item) => {
        clearTimeout(item)
    })
    timer = []
}

const handleHide = () => {
    clearTimer()
    cwStyle.value = {
        maxHeight: 0,
        opacity: 0,
    }
    timer.push(setTimeout(() => {
        cwStyle.value = {
            maxHeight: 0,
            display: 'none',
            opacity: 0,
        }
    }, 300))
}

const handleShow = () => {
    clearTimer()
    cwStyle.value = {
        maxHeight: 0,
        opacity: 0,
    }
    timer.push(setTimeout(() => {
        cwStyle.value = {
            maxHeight: `${originHeight}px`,
            opacity: 1,
        }
    }))
}

watch(() => props.show, (newVal) => {
    if (cwRef.value && cRef.value) {
        if (newVal) {
            handleShow()
        } else {
            handleHide()
        }
    }
})

onMounted(() => {
    originHeight = cwRef.value!.clientHeight
    cwStyle.value = {
        maxHeight: `${originHeight}px`,
    }
})
</script>

<style lang="scss" scoped>
.miao-collapse-warpper {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: end;
    opacity: 1;
    transition: all 0.3s ease-in-out, opacity 0.2s ease-in-out;

    .miao-collapse {
        position: relative;
    }
}
</style>