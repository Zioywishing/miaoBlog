<template>
    <div class="post-editor">
        <!-- editor以后再写 -->
        <el-row :gutter="10">
            <el-col :span="12">
                <el-input v-model:model-value="title" placeholder="title" :disabled="disabled">
                    <template #prepend>标题</template>
                </el-input>
            </el-col>
            <el-col :span="12">
                <el-input-tag v-model:model-value="tags" placeholder="添加标签" :disabled="disabled"/>
            </el-col>
        </el-row>
        <el-row>
            <el-col>
                <el-input v-model:model-value="summary" placeholder="summary" :disabled="disabled">
                    <template #prepend>摘要</template>
                </el-input>
            </el-col>
        </el-row>
        <el-input type="textarea" v-model:model-value="content" placeholder="content" :autosize="{ minRows: 15 }" :disabled="disabled"/>
    </div>
</template>

<script setup lang="ts">

const props = defineProps<{
    disabled?: boolean
}>()

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
