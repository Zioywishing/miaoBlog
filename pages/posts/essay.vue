<template>
    <div class="w-full">
        <div v-if="status === 'pending' && !data">
            <div v-for="_ in range(3)" :key="_">
                <el-skeleton :rows="3" />
            </div>
        </div>
        <div v-else>
            <essay-card v-for="essay in essays" :key="essay.id" :essay="essay">
            </essay-card>
        </div>
    </div>
</template>

<script setup lang="ts">
import range from '~/utils/range';
import type { essayItem } from '~/types/essay';
import essayCard from '~/components/posts/essayCard.vue';

const { status, data } = await useLazyFetch<{ code: number, data: essayItem[] }>('/api/essays/getEssayList', {
    key: 'essays-list',
});

const essays = computed(() => data.value?.data || []) as ComputedRef<essayItem[]>;

</script>