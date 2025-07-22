<template>
    <div class="box-border p-3 h-full flex flex-col items-center">
        <!-- <div
            class="w-full text-center pb-2.5 text-4xl font-bold mb-4 tracking-wider no-underline border-b border-gray-300 my-3 mx-0 font-serif">
            文章列表
        </div> -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
            <!-- 新文章卡片 -->
            <div class="bg-white rounded-md shadow-md hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center justify-center p-4"
                @click="handleNewPost">
                <create class="w-10 h-10"></create>
                <div class="mt-2 select-none tracking-wider">新文章</div>
            </div>

            <!-- 文章列表卡片 -->
            <div v-for="post in postList" :key="post.id"
                class="bg-white rounded-md shadow-md overflow-hidden flex flex-col hover:shadow-lg border-[1px] border-gray-100 transition-all">
                <!-- 卡片头部 -->
                <div class="flex justify-between items-center p-4 border-b-gray-200 border-b-[1px]">
                    <el-text size="large" line-clamp="2">{{ post.title }}</el-text>
                    <el-button @click="handleClickEditBtn(post.id)">
                        编辑
                    </el-button>
                </div>

                <!-- 卡片内容 -->
                <div class="p-4 flex-1">
                    <div class="post-index-list-card-content-summary">
                        <el-text line-clamp="2">
                            {{ post.summary }}
                        </el-text>
                    </div>
                    <div class="flex flex-wrap gap-2">
                        <el-tag size="small" class="post-index-list-card-content-tag" v-for="tag in post.tags"
                            :key="tag" style="user-select: none;">
                            {{ tag }}
                        </el-tag>
                    </div>
                </div>

                <!-- 卡片底部 -->
                <div class="p-3 text-xs text-gray-500 border-t-gray-200 border-t-[1px]">
                    {{ formatDate(post.date, 'yyyy-MM-dd HH:mm:ss') }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { postItem } from '~/types/post';
import create from '~/components/icons/create.vue';
// import getPostList from '~/utils/getPost';

const router = useRouter()

// const postList = ref<postItem[]>([]);

const handleClickEditBtn = (id: number) => {
    router.push(`/user/main/post/edit-${id}`)
}

const handleNewPost = () => {
    router.push('/user/main/post/edit-new')
}

const { status, data: postListData } = await useLazyFetch('/api/posts/getPostList', {
    server: true,
})

const postList = computed(() => (postListData?.value?.data ?? []) as postItem[])

const isLoading = computed(() => status.value === 'pending')
</script>

<style scoped>
/* 所有样式已经使用 Tailwind 类内联到 HTML 中 */
</style>