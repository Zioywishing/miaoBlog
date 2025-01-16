<template>
    <div :class="['user-main', showSidebar ? '' : 'hide-sidebar']">
        <div class="user-sidebar">
            <!-- <el-button @click="handleHideSidebar">hide</el-button> -->
            <div class="sidebar-item" @click="handleHideSidebar" style="justify-content: center;">
                <div class="sidebar-item-icon" style="transform: translateX(3px);">
                    <component class="sidebar-item-icon-noFill" :is="chevronDown"
                        :style="{ transform: showSidebar ? '' : 'rotate(-90deg)' }"></component>
                </div>
                <div class="sidebar-item-title">
                    <!-- {{ '隐藏' }} -->
                </div>
            </div>
            <NuxtLink v-for="item in menuItem" class="sidebar-item" :to="item.to">
                <div class="sidebar-item-icon">
                    <component :class="item.iconFill ? 'sidebar-item-icon-noFill' : ''" :is="item.icon"></component>
                </div>
                <div class="sidebar-item-title">
                    {{ item.title }}
                </div>
            </NuxtLink>
        </div>
        <div class="user-content">
            <el-scrollbar>
                <router-view></router-view>
            </el-scrollbar>
        </div>
        <div class="user-bottom-bar">
            <NuxtLink v-for="item in menuItem" class="bottom-item" :to="item.to">
                <div class="bottom-item-icon">
                    <component :class="item.iconFill ? 'bottom-item-icon-noFill' : ''" :is="item.icon"></component>
                </div>
                <div class="bottom-item-title">
                    {{ item.title }}
                </div>
            </NuxtLink>
        </div>
    </div>
</template>

<script setup lang="ts">
import useUserStore from '~/hooks/pinia/useUserStore';
import Cat from '~/components/icons/cat.vue'
import chevronDown from '~/components/icons/chevronDown.vue';
import Documents from '~/components/icons/documents.vue';
import Home from '~/components/icons/home.vue';
import Cloud from '~/components/icons/cloud.vue';

const router = useRouter()
const userStore = useUserStore()

const menuItem = shallowReactive([
    {
        title: '主页',
        icon: Home,
        iconFill: true,
        to: '/user/main'
    }, {
        title: '文章',
        icon: Documents,
        iconFill: true,
        to: '/user/main/post'
    }, {
        title: '账户',
        icon: Cat,
        to: '/user/main/account'
    }, {
        title: '服务',
        icon: Cloud,
        iconFill: true,
        to: '/user/main/server'
    }, 
    // {
    //     title: '测试',
    //     icon: Cat,
    //     to: '/user/main/test'
    // },
])

const showSidebar = ref(true)

const handleHideSidebar = () => {
    showSidebar.value = !showSidebar.value
}

const handleLogout = () => {
    userStore.logout()
    router.push('user/login')
}

onBeforeMount(() => {
    if (userStore.isLogin === false) {
        return router.replace('/user/login')
    }
})
</script>

<style lang="scss" scoped>
.user-main {
    width: 100%;
    height: calc(100vh - 60px);
    max-height: calc(100vh - 60px);
    display: grid;
    grid-template: 1fr 40px / 100px 1fr;
    transition: grid-template .2s ease;

    .user-content {
        grid-column: 1 / -1;
        grid-row: 1 / -1;
        max-height: calc(100vh - 60px);
    }

    .user-sidebar {
        grid-column: 1;
        grid-row: 1 / -1;
        border-right: 1px solid #ccc;
        padding: 10px 0px;
        display: flex;
        flex-direction: column;
        // gap: 10px;
        // align-items: start;

        .sidebar-item {
            box-sizing: border-box;
            display: flex;
            align-items: center;
            height: 40px;
            width: 100%;
            // justify-content: center;
            text-decoration: none;
            padding: 5px 0px;
            transition: all .2s ease;
            user-select: none;
            cursor: pointer;
            overflow: hidden;

            &:hover {
                background-color: #e0e0e054;
            }

            &-icon {
                min-width: 40px;
                height: 30px;
                display: flex;
                justify-content: center;
                align-items: center;
                color: black;

                svg {
                    width: 20px;
                    aspect-ratio: 1;
                    transition: all .2s ease;
                }
            }

            &-title {
                margin-left: 6px;
                text-wrap: nowrap;
                letter-spacing: 2px;
                color: black;
                font-family: PT Serif, Serif;
                transition: all .2s ease;
            }
        }
    }

    .user-bottom-bar {
        grid-column: 1 / -1;
        grid-row: 2;
        display: flex;
        justify-content: space-around;
        align-items: center;

        .bottom-item {
            height: 30px;
            aspect-ratio: 1;
            color: #000;
            transition: all .2s ease;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-decoration: none;

            &-icon {
                width: 30px;
                height: 30px;
                display: flex;
                justify-content: center;
                align-items: center;
                color: #000;

                svg {
                    width: 20px;
                    aspect-ratio: 1;
                    transition: all .2s ease;
                }
            }

            &-title {
                text-wrap: nowrap;
                letter-spacing: 2px;
                color: #000;
                font-family: PT Serif, Serif;
                transition: all .2s ease;
                font-size: 7px;
                margin-top: 3px;
                transform: translateX(1px);
            }

            // &:hover {
            //     scale: 1.05;
            // }
        }
    }
}



.hide-sidebar {
    grid-template: 1fr 40px / 40px 1fr;

    // .sidebar-item-title {
    //     // display: none;
    // }
}

@media screen and (max-width: 768px) {
    .user-main {
        .user-sidebar {
            display: none;
        }

        .user-content {
            grid-row: 1;
            max-height: calc(100vh - 100px);
        }
    }
}

@media screen and (min-width: 768px) {
    .user-main {
        .user-bottom-bar {
            display: none;
        }

        .user-content {
            grid-column: 2;
            grid-row: 1 / -1;
        }
    }
}
</style>

<style lang="scss">
.user-main {
    .user-sidebar {
        .sidebar-item {
            .sidebar-item-icon {
                svg {
                    path {
                        fill: black;
                        transition: all .2s ease;
                    }
                }

                .sidebar-item-icon-noFill {
                    path {
                        fill: none;
                    }
                }
            }

        }

        .router-link-exact-active {
            .sidebar-item-icon {
                svg {
                    path {
                        fill: #15aa87;
                    }
                }

                .sidebar-item-icon-noFill {
                    path {
                        fill: none;
                        stroke: #15aa87;
                    }
                }
            }

            .sidebar-item-title {
                color: #15aa87 !important;
            }
        }
    }

    .user-bottom-bar {
        .bottom-item {
            .bottom-item-icon {
                svg {
                    path {
                        fill: black;
                        transition: all .2s ease;
                    }
                }

                .bottom-item-icon-noFill {
                    path {
                        fill: none;
                    }
                }
            }

        }

        .router-link-exact-active {
            .bottom-item-icon {
                svg {
                    path {
                        fill: #15aa87;
                    }
                }

                .bottom-item-icon-noFill {
                    path {
                        fill: none;
                        stroke: #15aa87;
                    }
                }
            }

            .bottom-item-title {
                color: #15aa87 !important;
            }
        }
    }
}
</style>