<template>
    <div class="essay-wrapper">
        <div class="essay-skeleton" v-if="status === 'pending' && !data">
            <div class="essay-skeleton-item" v-for="_ in range(3)" :key="_">
                <el-skeleton :rows="3" />
            </div>
        </div>
        <div v-else class="essay-list">
            <article v-for="essay in essays" :key="essay.id" class="essay-item">
                <div class="essay-content">
                    <div class="essay-text" v-html="essay.contentHtml"></div>
                    <div class="essay-images" v-if="essay.images && essay.images.length > 0">
                        <div class="image-grid" :class="getImageGridClass(essay.images.length)">
                            <img 
                                v-for="(image, index) in essay.images" 
                                :key="index" 
                                :src="image" 
                                :alt="`图片${index + 1}`"
                                class="essay-image"
                                @click="previewImage(image, essay.images)"
                            />
                        </div>
                    </div>
                </div>
                <div class="essay-footer">
                    <div class="essay-time">
                        <time class="time-icon"></time>
                        <span>{{ formatDate(essay.createTime, 'YYYY-MM-DD HH:mm:ss') }}</span>
                    </div>
                </div>
            </article>
        </div>
    </div>
</template>

<script setup lang="ts">
import range from '~/utils/range';
import formatDate  from '~/utils/formatDate';
import type { essayItem } from '~/types/essay';
import useMiaoFetch from '~/hooks/useMiaoFetch';

const { essay: { getEssayList } } = useMiaoFetch();

const { status, data } = await useLazyFetch<{ code: number, data: essayItem[] }>('/api/essays/getEssayList', {
    key: 'essays-list',
});

const essays = computed(() => data.value?.data || []) as ComputedRef<essayItem[]>;

const getImageGridClass = (count: number) => {
    if (count === 1) return 'grid-1';
    if (count === 2) return 'grid-2';
    if (count === 3) return 'grid-3';
    if (count === 4) return 'grid-4';
    return 'grid-many';
};

const previewImage = (currentImage: string, allImages: string[]) => {
    // 实现图片预览功能
    console.log('预览图片:', currentImage);
};
</script>

<style lang="scss" scoped>
.essay-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0 auto;
    max-width: 600px;
    padding: 20px;
}

.essay-skeleton {
    width: 100%;
    
    &-item {
        margin-bottom: 20px;
        padding: 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
}

.essay-list {
    width: 100%;
}

.essay-item {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
    padding: 20px;
    transition: box-shadow 0.3s ease;
    
    &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
}

.essay-content {
    margin-bottom: 15px;
}

.essay-text {
    line-height: 1.6;
    color: #333;
    margin-bottom: 15px;
    word-wrap: break-word;
}

.essay-images {
    .image-grid {
        display: grid;
        gap: 8px;
        
        &.grid-1 {
            grid-template-columns: 1fr;
            max-width: 300px;
        }
        
        &.grid-2 {
            grid-template-columns: 1fr 1fr;
        }
        
        &.grid-3 {
            grid-template-columns: 1fr 1fr 1fr;
        }
        
        &.grid-4 {
            grid-template-columns: 1fr 1fr;
        }
        
        &.grid-many {
            grid-template-columns: repeat(3, 1fr);
        }
    }
}

.essay-image {
    width: 100%;
    height: 120px;
    object-fit: cover;
    border-radius: 4px;
    cursor: pointer;
    transition: transform 0.2s ease;
    
    &:hover {
        transform: scale(1.02);
    }
}

.essay-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 15px;
    border-top: 1px solid #f0f0f0;
}

.essay-time {
    display: flex;
    align-items: center;
    color: #999;
    font-size: 14px;
    
    .time-icon {
        width: 16px;
        height: 16px;
        margin-right: 5px;
        background: url('~/components/icons/time.vue') no-repeat center;
        background-size: contain;
    }
}
</style>