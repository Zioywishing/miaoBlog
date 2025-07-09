<template>
    <div class="relative inline-block">
        <img 
            :src="src" 
            :alt="alt" 
            class="rounded-sm cursor-pointer"
            @click="handleClick"
        >
        <Teleport to="body" v-if="shouldRenderPreview">
            <transition name="fade">
                <div 
                    v-if="showPreview" 
                    class="fixed inset-0 bg-black/30 z-50 flex items-center justify-center"
                    @click="showPreview = false"
                >
                    <div class="relative max-w-5xl w-full px-4">
                        <img 
                            :src="currentImage" 
                            alt="预览图片" 
                            class="max-h-[80vh] mx-auto rounded-sm"
                        >
                        <button 
                            v-if="previewList.length > 1"
                            @click.prevent="prevImage"
                            class="absolute left-0 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-r-md focus:outline-none"
                        >
                            <i class="fa fa-chevron-left"></i>
                        </button>
                        <button 
                            v-if="previewList.length > 1"
                            @click.prevent="nextImage"
                            class="absolute right-0 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-l-md focus:outline-none"
                        >
                            <i class="fa fa-chevron-right"></i>
                        </button>
                        <button 
                            @click="showPreview = false"
                            class="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full focus:outline-none"
                        >
                            <i class="fa fa-times"></i>
                        </button>
                    </div>
                </div>
            </transition>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    src: string
    alt?: string
    previewSrcList: string[]
}>()

const mounted = ref(false)

// 有点蠢
const realPreviewSrcList = computed(() => {
    if(import.meta.server) return []
    if (!mounted.value) return []
    const list = [...props.previewSrcList]
    const index = list.indexOf(props.src)
    const _head = list.slice(0, index)
    list.splice(0, index)
    list.push(..._head)
    return list
})

onMounted(() => {
    mounted.value = true
    props.previewSrcList.push(props.src)
})
onUnmounted(() => {
    props.previewSrcList.splice(props.previewSrcList.indexOf(props.src), 1)
})

// 新增：图片预览逻辑
const showPreview = ref(false)
const currentImage = ref(props.src)
const previewList = computed(() => realPreviewSrcList.value)

// 仅在客户端渲染预览组件
const shouldRenderPreview = computed(() => !import.meta.server && mounted.value)

const handleClick = () => {
    currentImage.value = props.src
    showPreview.value = true
}

const prevImage = () => {
    const currentIndex = previewList.value.indexOf(currentImage.value)
    const prevIndex = (currentIndex - 1 + previewList.value.length) % previewList.value.length
    currentImage.value = previewList.value[prevIndex]
}

const nextImage = () => {
    const currentIndex = previewList.value.indexOf(currentImage.value)
    const nextIndex = (currentIndex + 1) % previewList.value.length
    currentImage.value = previewList.value[nextIndex]
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>    