<!-- todo: 样式要完全大改 -->

<template>
    <div class="essay-management">
        <div class="essay-header">
            <h2>随笔管理</h2>
            <el-button type="primary" @click="showEssayEditor = true">写随笔</el-button>
        </div>
        
        <!-- 随笔编辑器 -->
        <div v-if="showEssayEditor" class="essay-editor-container">
            <essay-editor 
                @submit="handleEssaySubmit"
                @cancel="showEssayEditor = false"
            />
        </div>
        
        <!-- 随笔列表 -->
        <div class="essay-list">
            <div v-for="essay in essayList" :key="essay.id" class="essay-item">
                <div class="essay-content" v-html="essay.contentHtml"></div>
                <div class="essay-images" v-if="essay.images.length > 0">
                    <img v-for="image in essay.images" :key="image" :src="image" class="essay-thumb" />
                </div>
                <div class="essay-actions">
                    <span class="essay-time">{{ formatDate(essay.createTime, 'YYYY-MM-DD HH:mm:ss') }}</span>
                    <div>
                        <el-button size="small" @click="editEssay(essay)">编辑</el-button>
                        <el-button size="small" type="danger" @click="deleteEssay(essay.id)">删除</el-button>
                    </div>
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

const { essay: { getEssayList, uploadEssay, deleteEssay: deleteEssayAPI } } = useMiaoFetch();

const showEssayEditor = ref(false);
const essayList = ref<essayItem[]>([]);

const loadEssayList = async () => {
    try {
        const response = await getEssayList();
        if (response.code === 200) {
            essayList.value = response.data;
        }
    } catch (error) {
        console.error('加载随笔列表失败:', error);
    }
};

const handleEssaySubmit = async (essayData: any) => {
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
    }
};

const editEssay = (essay: essayItem) => {
    // 实现编辑功能
    console.log('编辑随笔:', essay);
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