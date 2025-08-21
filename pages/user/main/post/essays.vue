<!-- todo: 样式要完全大改 -->

<template>
    <div class="essay-management">
        <div class="essay-header">
            <h2>随笔管理</h2>
            <el-button type="primary" @click="showEssayEditor = true">写随笔</el-button>
        </div>

        <!-- 随笔编辑器 -->
        <div v-if="showEssayEditor" class="essay-editor-container">
            <essay-editor @submit="handleEssaySubmit" @cancel="showEssayEditor = false" :disabled="isSubmittingNewEssay" />
        </div>

        <!-- 随笔列表 -->
        <div class="essay-list">
            <div v-for="essay in essayList" :key="essay.id" class="essay-item">
                <div v-if="!essay.editing">
                    <div class="essay-content" v-html="essay.contentHtml"></div>
                    <div class="essay-images" v-if="essay.images.length > 0">
                        <img v-for="image in essay.images" :key="image" :src="image" class="essay-thumb" loading="lazy" />
                    </div>
                    <div class="essay-actions">
                        <span class="essay-time">{{ formatDate(essay.createTime, 'yyyy-MM-dd HH:mm:ss') }}</span>
                        <div>
                            <el-button size="small" @click="editEssay(essay)">编辑</el-button>
                            <el-button size="small" type="danger" @click="deleteEssay(essay.id)">删除</el-button>
                        </div>
                    </div>
                </div>
                <div v-else>
                    <essay-editor :essay="essay" @submit="(args) => handleEssayEditSubmit(essay)(args)"
                        @cancel="essay.editing = false" :disabled="essay.submitting" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import EssayEditor from '~/components/user/essayEditor.vue';
import useMiaoFetch from '~/hooks/useMiaoFetch';
import formatDate from '~/utils/formatDate';
import type { essayItem } from '~/types/essay';
type essayItemWithEditing = essayItem & { editing?: boolean; submitting?: boolean };

const { essay: { getEssayList, uploadEssay, updateEssay, deleteEssay: deleteEssayAPI } } = useMiaoFetch();

const showEssayEditor = ref(false);
const isSubmittingNewEssay = ref(false);
const essayList = ref<(essayItemWithEditing)[]>([]);

const loadEssayList = async () => {
    try {
        const response = await getEssayList();
        if (response.code === 200) {
            essayList.value = ((response as any).data as essayItem[]).map(essay => ({
                ...essay,
                editing: false,
                submitting: false
            }));
        }
    } catch (error) {
        console.error('加载随笔列表失败:', error);
    }
};

const handleEssaySubmit = async (essayData: any) => {
    isSubmittingNewEssay.value = true;
    try {
        const response = await uploadEssay(essayData);
        if (response.code === 200) {
            ElMessage.success('随笔发布成功');
            showEssayEditor.value = false;
            await loadEssayList();
        } else {
            ElMessage.error('随笔发布失败');
        }
    } catch (error) {
        console.error('发布随笔失败:', error);
        ElMessage.error('随笔发布失败');
    } finally {
        isSubmittingNewEssay.value = false;
    }
};

const handleEssayEditSubmit = (essay: essayItemWithEditing) => async (updatedEssay: { content: string; contentHtml: string; images: string[] }) => {
    essay.submitting = true;
    try {
        const response = await updateEssay({
            id: essay.id,  // 假设 essay 是当前编辑的 essayItem
            content: updatedEssay.content,
            contentHtml: updatedEssay.contentHtml,
            images: updatedEssay.images
        });
        if (response.code === 200) {
            ElMessage.success('随笔更新成功');
            essay.editing = false;
            Object.assign(essay, updatedEssay);
            await loadEssayList();
        } else {
            ElMessage.error('随笔更新失败');
        }
    } catch (error) {
        console.error('更新随笔失败:', error);
        ElMessage.error('随笔更新失败');
    } finally {
        essay.submitting = false;
    }
};

const editEssay = (essay: essayItemWithEditing) => {
    // 实现编辑功能
    essay.editing = true;
};

const deleteEssay = async (id: number) => {
    try {
        await ElMessageBox.confirm('确定要删除这条随笔吗？', '确认删除', {
            type: 'warning'
        });

        const response = await deleteEssayAPI(id);
        if (response.code === 200) {
            ElMessage.success('删除成功');
            await loadEssayList();
        } else {
            ElMessage.error('删除失败');
        }
    } catch (error) {
        console.log('取消删除');
    }
};

onMounted(() => {
    loadEssayList();
});
</script>

<style lang="scss" scoped>
.essay-management {
    .essay-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        h2 {
            margin: 0;
        }
    }

    .essay-editor-container {
        margin-bottom: 30px;
    }

    .essay-list {
        .essay-item {
            background: white;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 15px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

            .essay-content {
                margin-bottom: 15px;
                line-height: 1.6;
            }

            .essay-images {
                display: flex;
                gap: 10px;
                margin-bottom: 15px;

                .essay-thumb {
                    width: 60px;
                    height: 60px;
                    object-fit: cover;
                    border-radius: 4px;
                }
            }

            .essay-actions {
                display: flex;
                justify-content: space-between;
                align-items: center;

                .essay-time {
                    color: #999;
                    font-size: 14px;
                }
            }
        }
    }
}
</style>