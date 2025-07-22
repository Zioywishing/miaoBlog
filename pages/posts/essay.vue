<template>
    <div class="w-full">
        <div v-if="status === 'pending' && !data">
            <div v-for="_ in range(3)" :key="_">
                <el-skeleton :rows="3" />
            </div>
        </div>
        <div v-else>
            <article v-for="essay in essays" :key="essay.id" class=" not-last:border-b-1 border-b-[#e8e8e8] m-5">
                <div class="flex justify-between">
                    <div>
                        <span class="text-sm text-[#999999]">{{ formatDate(essay.createTime, 'yyyy-MM-dd HH:mm:ss')
                            }}</span>
                    </div>
                </div>
                <div>
                    <section class="mb-2 essay-content">
                        <div v-html="essay.contentHtml"></div>
                    </section>
                    <div v-if="essay.images && essay.images.length > 0">
                        <div >
                            <img v-for="(image, index) in essay.images" :key="index" :src="image"
                                :alt="`图片${index + 1}`" />
                        </div>
                    </div>
                </div>
            </article>
        </div>
    </div>
</template>

<script setup lang="ts">
import range from '~/utils/range';
import formatDate from '~/utils/formatDate';
import type { essayItem } from '~/types/essay';
import useMiaoFetch from '~/hooks/useMiaoFetch';

const { essay: { getEssayList } } = useMiaoFetch();

const { status, data } = await useLazyFetch<{ code: number, data: essayItem[] }>('/api/essays/getEssayList', {
    key: 'essays-list',
});

const essays = computed(() => data.value?.data || []) as ComputedRef<essayItem[]>;

console.log(essays.value);

</script>

<style scoped lang="scss">
.essay-content {
    :deep(p) {
        text-indent: 2em;
    }
}
</style>