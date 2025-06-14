<template>
    <div class="post-index">
        <div class="post-index-title">
            文章列表
        </div>
        <div class="post-index-list">
            <el-card class="post-index-list-create" @click="handleNewPost">
                <create class="post-index-list-create-icon"></create>
                <div class="post-index-list-create-text">新文章</div>
            </el-card>
            <el-card class="post-index-list-card" v-for="post in postList" :key="post.id">
                <template #header>
                    <div class="post-index-list-card-header">
                        <el-text line-clamp="2">{{ post.title }}</el-text>
                        <el-button @click="handleClickEditBtn(post.id)">
                            编辑
                        </el-button>
                    </div>
                </template>
                <div class="post-index-list-card-content">
                    <div class="post-index-list-card-content-summary">
                        <el-text line-clamp="2">
                            {{ post.summary }}
                        </el-text>
                    </div>
                    <el-text line-clamp="1">
                        <el-tag size="small" class="post-index-list-card-content-tag" v-for="tag in post.tags"
                            :key="tag" style="user-select: none;">
                            {{ tag }}
                        </el-tag>
                    </el-text>
                </div>
                <template #footer>
                    <div class="post-index-list-card-footer">
                        {{ formatDate(post.date, 'yyyy-MM-dd HH:mm:ss') }}
                    </div>
                </template>
            </el-card>

            <el-card v-if="isLoading" v-for="_ in 6">
                <el-skeleton :rows="5" />
            </el-card>
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

<style lang="scss" scoped>
.post-index {
    box-sizing: border-box;
    padding: 10px;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;

    &-title {
        width: 100%;
        text-align: center;
        padding: 0 0 10px 0;
        font-size: 2rem;
        font-weight: bold;
        margin-bottom: 1rem;
        letter-spacing: 4px;
        text-decoration: none;
        font-family: PT Serif, Serif;
        border-bottom: 1px solid #ccc;
        margin: 10px 0 20px;
    }

    &-list {
        width: 100%;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1rem;

        &-create {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            cursor: pointer;

            &-text {
                letter-spacing: 2px;
                transform: translateX(-2px);
                user-select: none;
            }
        }

        &-card {
            &-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            &-content {
                &-tags {
                    display: flex;
                    height: 25px;
                    max-width: calc(100% - 0px);
                    user-select: none;
                }

                &-tag:not(:first-child) {
                    margin: 0 5px;
                }
            }

            &-footer {
                font-size: smaller;
                color: #686868;
            }
        }

        // .post-item {
        //     box-sizing: border-box;
        //     overflow: hidden;
        //     padding-bottom: 5px;

        //     // padding: 10px;
        //     &-header {
        //         display: flex;
        //         flex-direction: column;
        //         justify-content: space-between;

        //         &-title {
        //             width: 100%;
        //             box-sizing: border-box;
        //             text-align: center;
        //             letter-spacing: 4px;
        //             text-decoration: none;
        //             font-size: large;
        //             background-color: #15aa87;
        //             color: #fff;
        //             padding: 3px 0 5px;
        //             // font-family: PT Serif, Serif;
        //         }
        //     }

        //     &-content {
        //         max-height: 45px;
        //         overflow: hidden;
        //         text-overflow: ellipsis;
        //         text-indent: 2em;
        //         color: #363636;
        //     }

        //     &-footer {
        //         display: flex;
        //         justify-content: space-between;
        //         align-items: center;
        //         margin-top: 5px;

        //         &-info {
        //             padding: 0 5px;

        //             &>div {
        //                 font-size: 10px;
        //             }
        //         }

        //         &-btn {
        //             height: 25px;
        //             margin-right: 10px;
        //         }
        //     }
        // }
    }
}

@media screen and (max-width: 768px) {
    .post-index {
        &-list {
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        }
    }
}
</style>