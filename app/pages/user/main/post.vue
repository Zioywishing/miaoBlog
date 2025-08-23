<template>
    <div class="post-main">
        <miao-collapse :show="showNav">
            <div class="post-nav">
                <nuxt-link to="/user/main/post" class="nav-item" :class="{ active: $route.path === '/user/main/post' }">
                    文章管理
                </nuxt-link>
                <nuxt-link to="/user/main/post/essays" class="nav-item" :class="{ active: $route.path === '/user/main/post/essays' }">
                    随笔管理
                </nuxt-link>
            </div>
        </miao-collapse>
        <div class="post-content">
            <NuxtPage />
        </div>
    </div>
</template>

<script setup lang="ts">
const route = useRoute();
const showNav = computed(() => {
    // 当路由包含 edit- 时隐藏导航栏
    return !route.path.includes('/user/main/post/edit-');
})
</script>

<style lang="scss" scoped>
.post-main {
    padding: 20px;
}

.post-nav {
    display: flex;
    margin-bottom: 20px;

    .nav-item {
        padding: 10px 20px;
        cursor: pointer;
        position: relative;
        transition: all 0.3s ease;
        text-decoration: none;
        color: inherit;

        &:hover {
            color: var(--color-spring);
        }

        &.active {
            color: var(--color-spring);
            
            &::after {
                content: '';
                position: absolute;
                bottom: -2px;
                left: 10%;
                width: 80%;
                height: 2px;
                background-color: var(--color-spring);
            }
        }
    }
}
</style>