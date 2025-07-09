<!-- todo: ssr有问题 -->

<template>
    <el-image :src="src" :alt="alt" :preview-src-list="realPreviewSrcList" class=" rounded-sm">
    </el-image>
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
</script>

<style scoped></style>