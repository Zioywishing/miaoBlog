<!-- todo:bug该修了 -->
<template>
    <div class="miao-collapse-warpper" ref="cwRef" :style="cwStyle">
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
const rC = ref(props.show)
// 引入辅助 refs 来控制 cwStyle 的各个属性
const maxHeight = ref<string | number | undefined>(props.show ? undefined : 0)
const display = ref<string | undefined>(props.show ? undefined : 'none')
const opacity = ref<number | undefined>(props.fade ? (props.show ? undefined : 0) : undefined)
const pointerEvents = ref<string | undefined>(props.show ? undefined : 'none')
const transition = ref<string | undefined>(undefined)

const cwStyle = computed(() => {
    const style: { [key: string]: string | number | undefined } = { ...cwStyleBase.value }
    if (maxHeight.value !== undefined) style.maxHeight = typeof maxHeight.value === 'number' ? `${maxHeight.value}px` : maxHeight.value
    if (display.value !== undefined) style.display = display.value
    if (opacity.value !== undefined) style.opacity = opacity.value
    if (pointerEvents.value !== undefined) style.pointerEvents = pointerEvents.value
    if (transition.value !== undefined) style.transition = transition.value
    return style
})

const cwStyleBase = computed(() => ({
    justifyContent: props.end ? 'flex-end' : 'flex-start',
}))
const cStyle = computed(() => ({}))

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
    maxHeight.value = originHeight
    opacity.value = 1
    transition.value = "all 0.2s ease-in-out, opacity 0.1s ease-out"
    timer.push(setTimeout(() => {
        maxHeight.value = 0
        opacity.value = props.fade ? 0 : 1
        pointerEvents.value = 'none'
        timer.push(setTimeout(() => {
            display.value = 'none'
            rC.value = false
        }, 300))
    }))
}

const handleShow = async () => {
    clearTimer()
    if (rC.value && originHeight !== -1) {
        maxHeight.value = originHeight
        opacity.value = 1
        transition.value = "all .2s ease-in-out, opacity .15s ease-in .07s"

        nextTick(() => {
            calcOriginHeight()
        })
        return;
    }
    rC.value = true
    display.value = undefined
    nextTick(() => {
        maxHeight.value = 0
        opacity.value = props.fade ? 0 : 1
        pointerEvents.value = undefined
        nextTick(() => {
            transition.value = "all .2s ease-in-out, opacity .15s ease-in .07s"
            timer.push(setTimeout(() => {
                calcOriginHeight();
                maxHeight.value = originHeight
                opacity.value = 1
                timer.push(setTimeout(() => {
                    maxHeight.value = undefined
                }, 300))
            }))
        })
    })
}

const calcOriginHeight = () => {
    originHeight = cRef.value!.clientHeight
    console.log(originHeight)
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