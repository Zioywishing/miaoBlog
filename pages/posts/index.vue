<template>
    <div class="posts-wrapper">
        <article class="posts-item" v-for="post in postsData" :key="post.id">
            <header class="post-title">
                <a href="">{{ post.title }}</a>
            </header>
            <p class="post-summary">{{ post.summary }}...</p>
            <footer class="post-footer">
                <div class="post-date">{{ post.date }}</div>
                <div class="post-tags">
                    <div v-for="tag in post.tags">{{ tag }}</div>
                </div>
            </footer>
        </article>
        <div class="posts-skeleton" v-if="!isInit">
            <div class="posts-skeleton-item" v-for="_ in range(5)">
                <n-skeleton text style="height: 40px; width: 60%" />
                <n-skeleton text :repeat="2" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { postItem } from '~/types/post';


// const router = useRouter()
const isInit = ref(false)

const postsData = ref<postItem[]>([])

onMounted(async () => {
    // router.push('/posts/temp')
    await sleep(1000)
    postsData.value = await $fetch('/api/posts/getPosts')
    isInit.value = true
    console.log(postsData.value)
})

</script>

<style lang="scss" scoped>
.posts-wrapper {
    // height: 50vh;
    width: 100%;
    padding-top: 10px;
    // background-color: #15aa87;
    .posts-item {
        margin: 10px 20px;
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
                font-size: 12px;
            }

            .post-tags {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 10px;
                font-size: 12px;
                color: rgba(0, 0, 0, .54);
                font-weight: 200;

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
        }
    }
}
</style>