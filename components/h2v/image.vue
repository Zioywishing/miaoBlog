<template>
    <el-image :src="src" :alt="alt" :preview-src-list="previewSrcList">
    </el-image>
</template>

<script setup lang="ts">
const props = defineProps<{
    src: string
    alt?: string
    previewSrcList: string[]
}>()
onMounted(() => {
    props.previewSrcList.push(props.src)
})
onUnmounted(() => {
    props.previewSrcList.splice(props.previewSrcList.indexOf(props.src), 1) 
})
</script>

<style scoped></style>