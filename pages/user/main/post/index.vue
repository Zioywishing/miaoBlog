<template>
    <div class="post-index">
        <div class="post-index-title">
            文章列表
        </div>
        <div class="post-index-list">
            <div class="post-index-list-item">
                上传文章
            </div>
            <div v-for="post in postList" :key="post.id" class="post-item post-index-list-item">
                <div class="post-item-header">
                    <div class="post-item-header-title">
                        {{ post.title }}
                    </div>
                    <!-- <div class="post-item-header-date">
                        {{ formatDate(post.date, 'yy-MM-dd HH:mm:ss') }}
                    </div> -->
                </div>
                <div class="post-item-content">
                    <span>
                        {{ post.summary }}
                    </span>
                </div>
                <div class="post-item-footer">
                    <div class="post-item-footer-info">
                        <div class="post-item-footer-info-date">
                            {{ formatDate(post.date, 'yy-MM-dd HH:mm:ss') }}
                        </div>
                        <div class="post-item-footer-info-tags">
                            <span v-for="tag in post.tags" :key="tag">{{ tag }}</span>
                        </div>
                    </div>
                    <el-button class="post-item-footer-btn" @click="handleClickEditBtn(post.id)">
                        编辑
                    </el-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { postItem } from '~/types/post';
import getPostList from '~/utils/getPost';

const router = useRouter()

const postList = ref<postItem[]>([]);

const handleClickEditBtn = (id: number) => {
    router.push(`/user/main/post/edit-${id}`)
}

onMounted(async () => {
    postList.value = await getPostList();
})
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
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1rem;

        &-item {
            // height: 100px;
            border-radius: 5px;
            border: 1px solid #ccc;
        }

        .post-item {
            box-sizing: border-box;
            overflow: hidden;
            padding-bottom: 5px;

            // padding: 10px;
            &-header {
                display: flex;
                flex-direction: column;
                justify-content: space-between;

                &-title {
                    width: 100%;
                    box-sizing: border-box;
                    text-align: center;
                    letter-spacing: 4px;
                    text-decoration: none;
                    font-size: large;
                    background-color: #15aa87;
                    color: #fff;
                    padding: 3px 0 5px;
                    // font-family: PT Serif, Serif;
                }
            }

            &-content {
                max-height: 45px;
                overflow: hidden;
                text-overflow: ellipsis;
                text-indent: 2em;
                color: #363636;
            }

            &-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 5px;

                &-info {
                    padding: 0 5px;

                    &>div {
                        font-size: 10px;
                    }
                }

                &-btn {
                    height: 25px;
                    margin-right: 10px;
                }
            }
        }
    }
}
</style>