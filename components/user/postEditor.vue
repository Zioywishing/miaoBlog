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
                <el-input-tag v-model:model-value="tags" placeholder="添加标签" :disabled="disabled" />
            </el-col>
        </el-row>
        <el-row>
            <el-col>
                <el-input v-model:model-value="summary" placeholder="summary" :disabled="disabled">
                    <template #prepend>摘要</template>
                </el-input>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="16"></el-col>
            <el-col :span="8">
                <div
                    class="switch-button overflow-hidden  z-10 border-0 border-gray-300 rounded-bl-sm rounded-tr-sm flex select-none">
                    <div class="switch-button-item" :class="{ 'switch-button-item-active': isEditing }"
                        @click="isEditing = true">
                        编辑
                    </div>
                    <div class="switch-button-item" :class="{ 'switch-button-item-active': !isEditing }"
                        @click="isEditing = false">
                        预览
                    </div>
                </div>
            </el-col>
        </el-row>
        <el-row>
            <el-col>
                <el-input v-if="isEditing" type="textarea" v-model:model-value="content" placeholder="content"
                    :autosize="{ minRows: 15 }" :disabled="disabled" />
                <el-scrollbar>
                    <div class=" border-1 border-gray-300 rounded-sm p-2" v-if="!isEditing">
                        <markdown-render :data="content ?? ''" :disable-skeleton="true" />
                    </div>
                </el-scrollbar>
            </el-col>
        </el-row>
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

const isEditing = ref(true)

</script>

<style scoped>
.post-editor {
    display: flex;
    flex-direction: column;
    gap: 5px;
}
</style>

<style lang="scss" scoped>
.switch-button {

    &-item {
        width: 50%;
        height: 100%;
        background-color: #fff;
        cursor: pointer;
        transition: all .15s ease;
        padding: 0 5px;

        &:hover {
            background-color: #f0f0f0;
        }

        &-active {
            color: #0077ff;
            background-color: #d3e7ff;

            &:hover {
                background-color: #c3e0ff;
            }
        }
    }
}
</style>
