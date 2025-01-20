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
const cwStyle = ref<{ [key: string]: string | number }>({})
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
    calcOriginHeight();
    cwStyle.value = {
        maxHeight: `${originHeight}px`,
        opacity: 1,
        transition: "all 0.2s ease-in-out, opacity 0.1s ease-out",
    }
    timer.push(setTimeout(() => {
        cwStyle.value = {
            maxHeight: 0,
            opacity: 0,
            transition: "all 0.2s ease-in-out, opacity 0.1s ease-out",
            pointerEvents: 'none',
        }
        timer.push(setTimeout(() => {
            cwStyle.value = {
                maxHeight: 0,
                display: 'none',
                opacity: 0,
                pointerEvents: 'none',
            }
        }, 300))
    }))
}

const handleShow = () => {
    clearTimer()
    cwStyle.value = {
        maxHeight: 0,
        opacity: 0,
        pointerEvents: 'none',
    }
    timer.push(setTimeout(() => {
        calcOriginHeight();
        cwStyle.value = {
            maxHeight: 0,
            opacity: 0,
            transition: "all .2s ease-in-out, opacity .15s ease-in .07s",
            pointerEvents: 'none',
        }
        timer.push(setTimeout(() => {
            cwStyle.value = {
                maxHeight: `${originHeight}px`,
                opacity: 1,
                transition: "all .2s ease-in-out, opacity .15s ease-in .07s"
            }
            timer.push(setTimeout(() => {
                cwStyle.value = {
                    opacity: 1,
                }
                nextTick(() => {
                    calcOriginHeight()
                })
            }, 300))
        }))
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

const calcOriginHeight = () => {
    originHeight = cRef.value!.clientHeight
}

onMounted(() => {
    calcOriginHeight()
})
</script>

<style lang="scss" scoped>
.miao-collapse-warpper {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: end;
    opacity: 1;
    // transition: all 0.3s ease-in-out, opacity 0.15s linear;

    .miao-collapse {
        position: relative;
    }
}
</style>