<template>
    <article class=" not-last:border-b-1 border-b-[#e8e8e8] m-5">
        <div class="flex justify-between">
            <div class="flex items-center gap-0.5">
                <time-icon style="height: 16px; color: #999999;" />
                <span class="text-sm text-[#999999]">{{ formatDate(essay.createTime, 'yyyy-MM-dd HH:mm:ss')
                    }}</span>
            </div>
        </div>
        <div>
            <section class="mb-2 essay-content">
                <div v-html="essay.contentHtml"></div>
            </section>
            <div v-if="essay.images && essay.images.length > 0" ref="imgListRef">
                <el-scrollbar ref="scrollbarRef">
                    <div class="flex gap-2 items-center pb-3">
                        <img v-for="(image, index) in essay.images" :key="index" :src="image" :alt="`图片${index + 1}`"
                            loading="lazy" class="h-20 rounded-sm" />
                    </div>
                </el-scrollbar>
            </div>
        </div>
    </article>
</template>

<script setup lang="ts">
import type { essayItem } from '~/types/essay';
import formatDate from '~/utils/formatDate';
import timeIcon from '~/components/icons/time.vue'
import type { ElScrollbar } from 'element-plus';

const props = defineProps<{
    essay: essayItem
}>()

const imgListRef = ref<HTMLDivElement>();
const scrollbarRef = ref<InstanceType<typeof ElScrollbar>>();

onMounted(() => {
    if (imgListRef.value) {
        // 阻止图片列表的滚轮事件冒泡,避免触发页面滚动
        imgListRef.value.addEventListener('wheel', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // 获取滚动条实例
            const scrollbar = scrollbarRef.value;
            if (!scrollbar) return;
            
            // 根据滚轮方向调整滚动位置
            const delta = e.deltaY || e.detail;
            
            // 获取当前滚动位置
            const currentScrollLeft = scrollbar.wrapRef?.scrollLeft || 0;
            
            // 计算新的滚动位置
            const newScrollLeft = delta + currentScrollLeft;
            
            // 执行滚动
            scrollbar.setScrollLeft(newScrollLeft);
        });
    }
})
</script>


<style scoped lang="scss">
.essay-content {
    :deep(p) {
        text-indent: 2em;
    }
}
</style>