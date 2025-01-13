<template>
    <div class="posts-wrapper">
        <article class="posts-item" v-for="post in postsData" :key="post.id">
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
                <div class="post-tags">
                    <bookmark class="post-tags-icon" />
                    <div v-for="tag in post.tags">{{ tag }}</div>
                </div>
            </footer>
        </article>
        <div class="posts-skeleton" v-if="!isInit">
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
const isInit = ref(false)

const postsData = ref<postItem[]>([])

const getData = async () => {
    const cache = store.getCache('posts')
    if (cache) {
        return cache as postItem[]
    }
    const res = await $fetch('/api/posts/getPostList')
    store.setCache('posts', res)
    return res
}

onMounted(async () => {
    // router.push('/posts/temp')
    // await sleep(1000)
    postsData.value = await getData()
    isInit.value = true;
    (async () => {
        const res = await $fetch('/api/test/testDir')
        console.log(res)
    })()
    // console.log(postsData.value)
})

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