<template>
    <div class="essay-editor">
        <div class="editor-header">
            <h3>{{ isEdit ? '编辑随笔' : '写随笔' }}</h3>
        </div>
        
        <div class="editor-content">
            <!-- 文字输入区域 -->
            <div class="text-area">
                <textarea 
                    v-model="content" 
                    placeholder="分享你的想法..."
                    class="content-textarea"
                    :disabled="disabled"
                    @paste="handlePaste"
                ></textarea>
            </div>
            
            <!-- 图片上传区域 -->
            <div class="image-area">
                <div class="image-upload-zone flex items-center justify-center flex-col" 
                     @click="handleSelectImages"
                     @drop="handleDrop"
                     @dragover.prevent
                     @dragenter.prevent
                     v-if="images.length === 0">
                    <div class="upload-icon">
                        <image-icon class="w-8 h-8 text-gray-400" />
                    </div>
                    <p class="upload-text">点击或拖拽上传图片</p>
                </div>
                
                <!-- 已上传的图片预览 -->
                <div class="uploaded-images" v-if="images.length > 0">
                    <div class="image-preview" v-for="(image, index) in images" :key="index">
                        <img :src="image" :alt="`图片${index + 1}`" />
                        <div class="image-actions">
                            <button @click="removeImage(index)" class="remove-btn">×</button>
                        </div>
                    </div>
                    <div class="add-more-btn" @click="handleSelectImages" v-if="images.length < 9">
                        <add-icon class="w-6 h-6 text-gray-400" />
                    </div>
                </div>
            </div>
        </div>
        
        <div class="editor-footer">
            <div class="editor-actions">
                <el-button @click="handleCancel" :disabled="disabled">取消</el-button>
                <el-button type="primary" @click="handleSubmit" :loading="submitting" :disabled="disabled">发布</el-button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import ImageIcon from '~/components/icons/image.vue';
import AddIcon from '~/components/icons/add.vue';
import compressImg from '~/utils/compressImg';
import useMarkdownit from '~/composables/useMarkdownit';
import { FilePicker } from '~/utils/filePicker';
import type { essayItem } from '~/types/essay';

const props = defineProps<{
    disabled?: boolean;
    isEdit?: boolean;
    initialContent?: string;
    initialImages?: string[];
    essay?: essayItem;
}>();

const emit = defineEmits(['submit', 'cancel']);

const content = ref(props.initialContent || '');
const images = ref<string[]>(props.initialImages || []);
const submitting = ref(false);

const mdit = ref<any>();

const contentHtml = computed(() => {
    return mdit.value?.render(content.value) ?? "";
});

const handleSelectImages = async () => {
    try {
        const files = await new FilePicker().pick({
            accept: 'image/*',
            multiple: true,
        });
        
        for (const file of files) {
            if (images.value.length >= 9) break;
            await uploadImage(file);
        }
    } catch (error) {
        console.log('用户取消了文件选择');
    }
};

const handleDrop = async (event: DragEvent) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer?.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    for (const file of imageFiles) {
        if (images.value.length >= 9) break;
        await uploadImage(file);
    }
};

const uploadImage = async (file: File) => {
    const loadingMessage = ElMessage({
        message: '图片上传中...',
        type: 'info',
        duration: 0,
    });
    
    try {
        const compressedFile = new File([await compressImg(file, { quality: .35 })], file.name, { type: "image/jpeg" });
        
        const formData = new FormData();
        formData.append('file', compressedFile);
        formData.append('expire', `${3600 * 1000 * 24 * 365 * 50 + Date.now()}`);
        
        const response = await $fetch('/api/tools/imgBed/upload', {
            method: 'POST',
            body: formData,
        });
        
        if (response.code === 200 && 'hash' in response) {
            const imageUrl = `/api/tools/imgBed/download/${response.hash}/${file.name}`;
            images.value.push(imageUrl);
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
    
    if (imageFile && images.value.length < 9) {
        event.preventDefault();
        await uploadImage(imageFile);
    }
};

const removeImage = (index: number) => {
    images.value.splice(index, 1);
};

const handleSubmit = async () => {
    if (!content.value.trim()) {
        ElMessage.warning('请输入内容');
        return;
    }
    
    submitting.value = true;
    try {
        emit('submit', {
            content: content.value,
            contentHtml: contentHtml.value,
            images: images.value
        });
    } finally {
        submitting.value = false;
    }
};

const handleCancel = () => {
    emit('cancel');
};

onBeforeMount(() => {
    if (props.essay) {
        content.value = props.essay.content;
        images.value = props.essay.images;
    }
});

onMounted(async () => {
    mdit.value = await useMarkdownit();
});
</script>

<style lang="scss" scoped>
.essay-editor {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.editor-header {
    padding: 20px;
    border-bottom: 1px solid #f0f0f0;
    
    h3 {
        margin: 0;
        color: #333;
    }
}

.editor-content {
    padding: 20px;
}

.text-area {
    margin-bottom: 20px;
}

.content-textarea {
    width: 100%;
    min-height: 120px;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    resize: vertical;
    font-size: 14px;
    line-height: 1.5;
    outline: none;
    
    &:focus {
        border-color: var(--color-spring);
    }
    
    &::placeholder {
        color: #999;
    }
}

.image-area {
    .image-upload-zone {
        border: 2px dashed #ddd;
        border-radius: 4px;
        padding: 40px;
        text-align: center;
        cursor: pointer;
        transition: border-color 0.3s ease;
        
        &:hover {
            border-color: var(--color-spring);
        }
        
        .upload-icon {
            margin-bottom: 10px;
        }
        
        .upload-text {
            color: #666;
            margin: 0;
        }
    }
    
    .uploaded-images {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 10px;
        
        .image-preview {
            position: relative;
            aspect-ratio: 1;
            border-radius: 4px;
            overflow: hidden;
            
            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .image-actions {
                position: absolute;
                top: 5px;
                right: 5px;
                
                .remove-btn {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: rgba(0, 0, 0, 0.6);
                    color: white;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    
                    &:hover {
                        background: rgba(0, 0, 0, 0.8);
                    }
                }
            }
        }
        
        .add-more-btn {
            aspect-ratio: 1;
            border: 2px dashed #ddd;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: border-color 0.3s ease;
            
            &:hover {
                border-color: var(--color-spring);
            }
        }
    }
}

.editor-footer {
    padding: 20px;
    border-top: 1px solid #f0f0f0;
    
    .editor-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
    }
}
</style>