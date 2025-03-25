<template>
    <div class="posts-wrapper">
        <article class="posts-item" v-for="post in posts" :key="post.id">
            <header class="post-title">
                <nuxt-link :to="`/posts/post-${post.id}`">{{ post.title }}</nuxt-link>
            </header>
            <p class="post-summary">{{ post.summary }}...</p>
            <footer class="post-footer">
                <div class="post-date">
                    <time-icon class="post-date-icon" />
                    <span>
                        {{ formatDate(post.date, 'yy-MM-dd HH:mm:ss') }}
                    </span>
                </div>
                <div class="post-tags" v-if="post.tags.length">
                    <bookmark class="post-tags-icon" />
                    <div v-for="tag in post.tags">{{ tag }}</div>
                </div>
            </footer>
        </article>
        <div class="posts-skeleton" v-if="pending && 0">
            <div class="posts-skeleton-item" v-for="_ in range(5)">
                <el-skeleton :rows="3" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import useDefaultStore from '~/hooks/pinia/useDefaultStore';
import timeIcon from '~/components/icons/time.vue'
import bookmark from '~/components/icons/tag.vue'
import type { postItem } from '~/types/post';

const store = useDefaultStore()

// 使用useFetch在服务器端获取数据
const { data, pending } = await useFetch<{ code: number, data: postItem[] }>('/api/posts/getPostList', {
    // 如果缓存中已有数据，优先使用缓存
    key: 'posts-list',
    transform: (response) => {
        if (response && response.data) {
            store.setCache('posts', response.data)
            return response
        }
        return { code: 0, data: [] }
    },
    // 添加以下选项
    lazy: true, // 避免客户端自动重新获取
    server: true, // 仅在服务器端获取数据
})
// 从响应中提取文章列表
const posts = computed(() => data.value?.data || []) as ComputedRef<postItem[]>
</script>

<style lang="scss" scoped>
.posts-wrapper {
    // height: 50vh;
    box-sizing: border-box;
    width: 100%;
    padding: 10px 20px;

    // background-color: #15aa87;
    .posts-item {
        margin: 10px 0px;
        padding-bottom: 20px;

        &:not(:last-child) {
            border-bottom: 1px solid #e8e8e8;
        }

        .post-title {
            font-family: PT Serif, Serif;
            font-size: 28px;
            border-bottom: 0;

            &>a {
                cursor: pointer;
                color: #000;
                transition: all .2s;
                text-decoration: none;

                &:hover {
                    color: #15aa87;
                }
            }
        }

        .post-summary {
            font-size: 14px;
            color: rgba(0, 0, 0, .54);
            font-weight: 200;
        }

        .post-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 10px;
            font-size: 12px;
            color: rgba(0, 0, 0, .54);
            font-weight: 200;

            .post-date {
                display: flex;
                font-size: 12px;
                &-icon {
                    height: 16px;
                    margin-right: 5px;
                }
            }

            .post-tags {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 6px;
                font-size: 12px;
                color: rgba(0, 0, 0, .54);
                font-weight: 200;

                &-icon {
                    height: 10px;
                    transform: rotate(-90deg) translate(-1px, -1px);
                    // margin-right: -3px;
                }

                &>div {
                    cursor: pointer;
                    transition: color .2s linear;

                    &:hover {
                        color: #15aa87;
                    }
                }
            }
        }
    }

    .posts-skeleton {
        &-item {
            padding: 10px 20px;
            // border-bottom: 1px solid #e8e8e8;
        }
    }
}
</style>