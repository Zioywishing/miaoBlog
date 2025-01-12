<template>
    <section id="miao-header-warpper">
        <header id="miao-header">
            <div class="miao-header-title">
                <a href="https://nj.miaospring.top:3001/" target="_blank" title="喵"><span
                        style="color: #15aa87; margin-right: 1px;">杪</span>Blog</a>
            </div>
            <div class="header-right-warp">
                <ul class="miao-header-nav">
                    <li v-for="(item) in navList" :key="item.path"
                        :class="['miao-header-nav-item', isActive(item) ? 'miao-header-nav-item-active' : '']">
                        <NuxtLink :to="item.path">{{
                            item.title }}</NuxtLink>
                    </li>
                </ul>
            </div>
        </header>
    </section>
</template>

<script setup lang="ts">

const route = useRoute()

type NavItem = {
    title: string,
    path: string,
    otherPath?: string[]
}


const navList: NavItem[] = [
    {
        title: '首页',
        path: '/'
    },
    {
        title: '文章',
        path: '/posts',
        otherPath: ['/post']
    },
    // {
    //     title: '测试',
    //     path: '/test',
    //     otherPath: ['/testRouter']
    // },
]

const isActive = (navItem: NavItem) => {
    const currentFirstPath = `/${route.path.split('/')[1]}`
    if (currentFirstPath === navItem.path) {
        return true
    }
    if (navItem.otherPath && navItem.otherPath.length > 0) {
        return navItem.otherPath.includes(currentFirstPath)
    }
    return false
}

onMounted(() => {
    // console.log(route)
})
</script>

<style lang="scss" scoped>
// @use '/style/miaoStyle.scss';


#miao-header-warpper {
    position: relative;
    background-color: #fff;
    user-select: none;
    z-index: 70582140;

    #miao-header {
        box-sizing: border-box;
        height: 60px;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        box-shadow: 0 5px 20px rgba(0, 0, 0, .03), 0 6px 6px rgba(0, 0, 0, .05);
        transition: box-shadow .3s linear;
        padding: 10px 32px;

        &:hover {
            box-shadow: 0 5px 20px rgba(0, 0, 0, .08), 0 6px 6px rgba(0, 0, 0, .1);
        }

        .miao-header-title {
            font-size: 30px;
            margin: 0;
            letter-spacing: 2px;
            text-transform: uppercase;

            &>a {
                color: #000;
                // font-weight: 600;
                letter-spacing: 4px;
                text-decoration: none;
                font-family: PT Serif, Serif;
            }
        }

        .header-right-warp {
            flex: 1;
            height: 100%;
            margin-left: auto;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: flex-end;

            .miao-header-nav {
                display: flex;
                flex-direction: row;
                align-items: center;
                list-style: none;
                padding: 0;
                margin: 0;

                &-item {
                    &:not(:first-child) {
                        margin-left: 20px;
                    }

                    &>a {
                        font-size: 20px;
                        font-family: PT Serif, Serif;
                        text-decoration: none;
                        color: #000;
                        transition: color .15s linear;
                    }
                }

                &-item-active {
                    &>a {
                        color: #15aa87;
                    }
                }
            }
        }
    }
}
</style>

<!-- <style lang="scss">
.miao-header-nav {
    &-item {
        &>a {
            .router-link-active {
                color: #cf1111;
            }
        }
    }
}
</style> -->