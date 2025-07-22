<!-- todo:bug该修了 -->
<template>
    <div class="miao-collapse-warpper" ref="cwRef" :style="{ ...cwStyle, ...cwStyleBase }">
        <div class="miao-collapse" ref="cRef" :style="cStyle" v-if="rC">
            <slot></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { nextTick } from 'vue'
const props = defineProps({
    show: {
        type: Boolean,
        default: true,
    },
    fade: {
        type: Boolean,
        default: true,
    },
    end: {
        type: Boolean,
        default: true,
    },
    // todo: duration
    // duration: {
    //     type: Number,
    //     default: 300,
    // },
})
const cwRef = ref<HTMLDivElement>()
const cRef = ref<HTMLDivElement>()
const rC = ref(true)
const cwStyle = ref<{ [key: string]: string | number }>(props.show ? {} : {
    maxHeight: 0,
    display: 'none',
    opacity: props.fade ? 0 : 1,
    pointerEvents: 'none',
})

const cwStyleBase = shallowRef({
    justifyContent: props.end ? 'flex-end' : 'flex-start',
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
    calcOriginHeight();
    cwStyle.value = {
        maxHeight: `${originHeight}px`,
        opacity: 1,
        transition: "all 0.2s ease-in-out, opacity 0.1s ease-out",
    }
    timer.push(setTimeout(() => {
        cwStyle.value = {
            maxHeight: 0,
            opacity: props.fade ? 0 : 1,
            transition: "all 0.2s ease-in-out, opacity 0.1s ease-out",
            pointerEvents: 'none',
        }
        timer.push(setTimeout(() => {
            cwStyle.value = {
                maxHeight: 0,
                display: 'none',
                opacity: props.fade ? 0 : 1,
                pointerEvents: 'none',
            }
            rC.value = false
        }, 300))
    }))
}

const handleShow = async () => {
    clearTimer()
    if (rC.value && originHeight !== -1) {
        cwStyle.value = {
            maxHeight: `${originHeight}px`,
            opacity: 1,
            transition: "all .2s ease-in-out, opacity .15s ease-in .07s"
        }
        nextTick(() => {
            calcOriginHeight()
        })
        return;
    }
    rC.value = true
    nextTick(() => {
        cwStyle.value = {
            maxHeight: 0,
            opacity: props.fade ? 0 : 1,
            pointerEvents: 'none',
        }
        nextTick(() => {
            calcOriginHeight();
            cwStyle.value = {
                maxHeight: 0,
                opacity: props.fade ? 0 : 1,
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
                    nextTick(() => {
                        calcOriginHeight()
                    })
                }, 300))
            }))
        })
    })
}

const calcOriginHeight = () => {
    originHeight = cRef.value!.clientHeight
}

watch(() => props.show, (newVal) => {
    // if (cwRef.value && cRef.value) {
    if (newVal) {
        handleShow()
    } else {
        handleHide()
    }
    // }
})

onMounted(() => {
    props.show &&
        calcOriginHeight()
})
</script>

<style lang="scss" scoped>
.miao-collapse-warpper {
    position: relative;
    display: flex;
    flex-direction: column;
    // justify-content: end;
    opacity: 1;
    // transition: all 0.3s ease-in-out, opacity 0.15s linear;

    .miao-collapse {
        position: relative;
    }
}
</style>