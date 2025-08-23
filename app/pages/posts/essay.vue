<template>
    <div class="w-full">
        <div v-if="!data" class="px-5 my-10">
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
import useDefaultStore from '~/stores/useDefaultStore';

const store = useDefaultStore()


// const { status, data } = await useLazyFetch<{ code: number, data: essayItem[] }>('/api/essays/getEssayList', {
//     // key: 'essays-list',
// });

const { status: _status, data } = await useLazyFetch<{ code: number, data: essayItem[] }>('/api/essays/getEssayList', {
    default() {
        if (import.meta.server) {
            return undefined
        }
        return store.getCache("/api/essays/getEssayList")
    },
})

if (import.meta.client) {
    const unwatchData = watch(data, (newData) => {
        if (newData) {
            store.setCache("/api/essays/getEssayList", newData)
            // nextTick(() => {
            //     unwatchData()
            // })
        }
    }, {
        immediate: true,
    })
}

const essays = computed(() => data.value?.data || []) as ComputedRef<essayItem[]>;

</script>