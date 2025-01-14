<template>
    <div class="post-editor">
        editor以后再写
        <el-input v-model:model-value="id" placeholder="id" />
        <el-input v-model:model-value="title" placeholder="title" />
        <el-input v-model:model-value="summary" placeholder="summary" />
        <el-input-tag v-model:model-value="tags" placeholder="tags" />
        <el-input type="textarea" v-model:model-value="content" placeholder="content" autosize />
    </div>
</template>

<script setup lang="ts">
import useMiaoFetch from '~/hooks/useMiaoFetch';

// const { post: { updatePost } } = useMiaoFetch()

const id = defineModel<number>('id')
const title = defineModel<string>('title')
const summary = defineModel<string>('summary')
const tags = defineModel<string[]>('tags')
const content = defineModel<string>('content')

</script>

<style scoped>
.post-editor {
    display: flex;
    flex-direction: column;
    gap: 5px;
}
</style>
