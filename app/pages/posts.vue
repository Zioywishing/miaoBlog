<template>
    <div class="user-wrapper">
        <miao-collapse :show="showNav">
            <div class="mt-6 mb-4 flex justify-center">
                <div class="relative bg-white/80 backdrop-blur-sm rounded-2xl p-1.5 shadow-lg border border-gray-200/50 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
                    <!-- 滑动背景指示器 -->
                    <div class="absolute inset-1.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-500 ease-out"
                         :class="{
                             'translate-x-0 w-[calc(50%-0.25rem)]': isNotEssay,
                             'translate-x-[calc(100%-0.25rem)] w-[calc(50%-0.25rem)]': !isNotEssay
                         }"
                         :style="{ background: isNotEssay ? 'linear-gradient(135deg, var(--color-spring), #10b981)' : 'linear-gradient(135deg, var(--color-spring), #06b6d4)' }">
                    </div>
                    
                    <!-- 导航链接 -->
                    <div class="relative flex">
                        <nuxt-link to="/posts" 
                                   class="relative z-10 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 flex items-center gap-2 min-w-[100px] justify-center group"
                                   :class="{
                                       'text-white': isNotEssay,
                                       'text-gray-600 hover:text-gray-800': !isNotEssay
                                   }">
                            <svg class="w-4 h-4 transition-transform duration-300 group-hover:scale-110" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
                            </svg>
                            <span>文章</span>
                        </nuxt-link>
                        
                        <nuxt-link to="/posts/essay" 
                                   class="relative z-10 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 flex items-center gap-2 min-w-[100px] justify-center group"
                                   :class="{
                                       'text-white': !isNotEssay,
                                       'text-gray-600 hover:text-gray-800': isNotEssay
                                   }">
                            <svg class="w-4 h-4 transition-transform duration-300 group-hover:scale-110" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                                <path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" />
                            </svg>
                            <span>随笔</span>
                        </nuxt-link>
                    </div>
                </div>
            </div>
        </miao-collapse>
        <!-- <Suspense> -->
        <NuxtPage />
        <!-- </Suspense> -->
    </div>
</template>

<script setup lang="ts">

const route = useRoute()

const isNotEssay = computed(() => route.path !== '/posts/essay')


const showNav = computed(() => {
    // 当路由包含 edit- 时隐藏导航栏
    return !route.path.includes('/posts/post-');
})
</script>

<style lang="scss" scoped>
.user-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: 0 auto;
    max-width: 800px;
    padding: 0;
}
</style>