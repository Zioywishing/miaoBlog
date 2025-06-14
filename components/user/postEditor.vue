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
            <el-col :span="16">
                <div class="flex justify-baseline items-center gap-1 h-full border-1 border-gray-300 rounded-sm">
                    <div
                        class="pl-2.5 pr-2.5 bg-[#f5f7fa] text-[#909399] text-[0.8rem] h-full items-center flex border-r-gray-300 border-r-1">
                        插入</div>
                    <div title="插入图片" class="flex justify-center items-center h-6 w-6" @click="handleInsertImage">
                        <Image
                            class="w-5 h-5 hover:cursor-pointer transition-all duration-150 hover:w-5.5 hover:h-5.5 text-gray-500" />
                    </div>
                </div>
            </el-col>
            <el-col :span="8">
                <div
                    class="switch-button overflow-hidden z-10 border-0 border-gray-300 rounded-bl-sm rounded-tr-sm flex select-none justify-end gap-1">
                    <div class="switch-button-item" :class="{ 'switch-button-item-active': isEditing }"
                        @click="isEditing = !isEditing">
                        编辑
                    </div>
                    <div class="switch-button-item" :class="{ 'switch-button-item-active': isPreviewing }"
                        @click="isPreviewing = !isPreviewing">
                        预览
                    </div>
                </div>
            </el-col>
        </el-row>
        <div class="flex gap-1">
            <el-scrollbar max-height="calc(80vh + 6px)" style="flex: 1;" v-if="isEditing">
                <textarea ref="textareaRef" v-model="content" placeholder="在此输入Markdown内容..." :disabled="disabled"
                    class="markdown-textarea w-full min-h-[300px] p-3 resize-none border-1 border-gray-300 rounded-sm outline-none font-mono text-base "
                    @input="resizeTextarea" @keydown.tab.prevent="handleTab" @paste="handlePaste"></textarea>
            </el-scrollbar>
            <el-scrollbar max-height="80vh" style="flex: 1;" v-if="isPreviewing">
                <div class="border-1 border-gray-300 rounded-sm p-2 pb-[300px]">
                    <markdown-render :data="content ?? ''" :disable-skeleton="true" />
                </div>
            </el-scrollbar>
        </div>
    </div>
</template>

<script setup lang="ts">
import Image from '~/components/icons/image.vue'

const _props = defineProps<{
    disabled?: boolean
}>()

const title = defineModel<string>('title')
const summary = defineModel<string>('summary')
const tags = defineModel<string[]>('tags')
const content = defineModel<string>('content')

const emit = defineEmits(['save'])

const isEditing = ref(true)
const isPreviewing = ref(false)

const textareaRef = ref<HTMLTextAreaElement | null>(null)

const resizeTextarea = () => {
    const textarea = textareaRef.value;
    if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    }
};

watch(content, () => {
    nextTick(resizeTextarea);
});

watch(isEditing, (newValue) => {
    if (newValue) {
        nextTick(resizeTextarea)
    }
})

// 处理Tab键，用于插入缩进而不是切换焦点
const handleTab = (e: KeyboardEvent) => {
    // 插入2个空格作为缩进
    const textarea = e.target as HTMLTextAreaElement
    const start = textarea.selectionStart
    const end = textarea.selectionEnd

    // 获取光标位置前后的内容
    const textBeforeCursor = textarea.value.substring(0, start)
    const textAfterCursor = textarea.value.substring(end, textarea.value.length)

    // 插入两个空格
    if (content.value !== undefined) {
        content.value = textBeforeCursor + '  ' + textAfterCursor

        // 重新设置光标位置
        nextTick(() => {
            textarea.selectionStart = textarea.selectionEnd = start + 2
        })
    }
}

// 监听Ctrl+S快捷键
onMounted(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault() // 阻止浏览器默认保存行为
            emit('save')
        }
    }
    window.addEventListener('keydown', handleKeyDown)

    onUnmounted(() => {
        window.removeEventListener('keydown', handleKeyDown)
    })
})

const insertTextAtCursor = (textToInsert: string) => {
    const textarea = textareaRef.value;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = content.value || '';

    content.value = currentText.substring(0, start) + textToInsert + currentText.substring(end);

    nextTick(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + textToInsert.length;
        resizeTextarea();
    });
};

const uploadImage = async (file: File) => {
    const loadingMessage = ElMessage({
        message: '图片上传中...',
        type: 'info',
        duration: 0,
    });

    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('expire', `${3600 * 1000 * 24 * 365 * 50 + Date.now()}`);

        const response = await $fetch('/api/tools/imgBed/upload', {
            method: 'POST',
            body: formData,
        });

        if (response.code === 200 && 'hash' in response) {
            const imageUrl = `/api/tools/imgBed/download/${response.hash}`;
            const imageMarkdown = `\n![${file.name}](${imageUrl})\n`;
            insertTextAtCursor(imageMarkdown);
            ElMessage.success('图片上传成功');
        } else {
            ElMessage.error('图片上传失败');
        }
    } catch (error) {
        console.error('图片上传操作失败:', error);
        ElMessage.error('图片上传失败');
    } finally {
        loadingMessage.close();
    }
};

const handlePaste = async (event: ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    const imageFile = Array.from(items)
        .find(item => item.type.startsWith('image/'))
        ?.getAsFile();

    if (imageFile) {
        event.preventDefault();
        await uploadImage(imageFile);
    }
};

const handleInsertImage = async () => {
    try {
        const files = await new FilePicker().pick({
            accept: 'image/*',
            multiple: false,
        });

        if (files.length > 0) {
            await uploadImage(files[0]);
        }
    } catch (error) {
        // 用户取消文件选择时，FilePicker会抛出异常，这里静默处理
        console.log('用户取消了文件选择。');
    }
};
</script>

<style lang="scss" scoped>
.post-editor {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.markdown-textarea {
    line-height: 1.6;
    tab-size: 2;
    font-family: Consolas, Monaco, 'Andale Mono', monospace;
    // 确保textarea的box-sizing是border-box，这样padding和border不会影响scrollHeight的计算
    box-sizing: border-box;
    overflow-y: hidden; // 隐藏多余的滚动条
}

.switch-button {
    &-item {
        width: 50%;
        height: 100%;
        background-color: #fff;
        cursor: pointer;
        transition: all .15s ease;
        padding: 0 5px;
        display: flex;
        justify-content: center;
        align-items: center;
        max-width: 100px;
        border-radius: 3px;

        &:hover {
            background-color: #f0f0f0;
        }

        &-active {
            color: #fff;
            background-color: #15aa87;

            &:hover {
                background-color: #129072;
            }
        }
    }
}
</style>
