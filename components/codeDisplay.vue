<template>
    <div :class="wrapperClass" class="mb-2">
        <div class="cm-header" v-if="!inline" :style="headerStyle">
            <div class="cm-header-title">
                <span>{{ props.type ?? 'Code' }}</span>
            </div>
            <div class="cm-header-controls">
                <div class="cm-header-controls-copy" :class="{ 'cm-header-controls-copy-hide': !show }"
                    @click="copyCode">
                    复制
                </div>
                <div class="cm-switch-show-hide" @click="show = !show">
                    {{ show ? '收起' : '展开' }}
                </div>
            </div>
        </div>
        <miao-collapse v-if="!inline" :show="show" :fade="false" style="overflow: hidden;">
            <el-scrollbar class="bg-[#eff1f5] rounded-b-[10px]">
                <div class="bg-[#eff1f5] pr-0.5 pb-1.5 w-fit">
                    <div ref="codeContainer" class="rounded-b-[10px] bg-[#e7e7e7]" v-html="highlightedCode"></div>
                </div>
                <!-- <div v-if="!inline" class="bg-[#eff1f5] rounded-b-[10px] w-full h-3"></div> -->
            </el-scrollbar>
        </miao-collapse>
        <div v-else ref="codeContainer" class="rounded-b-[10px] bg-[#e7e7e7]" v-html="highlightedCode"></div>
    </div>
</template>

<script setup lang="ts">
import { codeToHtml } from 'shiki'

const props = defineProps<{
    data: string,
    type?: string,
    inline?: boolean,
}>()

const show = ref(true)
const codeContainer = ref<HTMLElement>()
const highlightedCode = ref('')
// const isLoading = ref(true)

const wrapperClass = computed(() => {
    return ['cm-rander-wrapper', props.inline === true ? 'cm-rander-wrapper-inline' : '']
})

const headerStyle = computed(() => ({
    borderRadius: show.value ? "10px 10px 0 0" : "10px 0 10px 0"
}))

// const rows = computed(() => {
//     if (!props.data) {
//         return 5
//     }
//     const lines = props.data.split('\n')
//     return lines.length - 2 > 0 ? lines.length - 2 : 1
// })

const highlightCode = async () => {
    // isLoading.value = false
    highlightedCode.value = `<pre style="background-color: #eff1f5;color: #4c4f69;"><code>${escapeHtml(props.data)}</code></pre>`

    try {
        // 根据文件类型确定语言
        let lang = props.type || 'text'

        // console.log(lang)

        // 语言映射转换
        const langMap: Record<string, string> = {
            'js': 'javascript',
            'jsx': 'jsx',
            'ts': 'typescript',
            'tsx': 'tsx',
            'css': 'css',
            'scss': 'scss',
            'html': 'html',
            'py': 'python',
            'go': 'go',
            'json': 'json',
            'md': 'markdown',
            'yaml': 'yaml',
            'vue': 'vue',
            'xml': 'xml'
        }

        if (langMap[lang]) {
            lang = langMap[lang]
        }

        // 使用 codeToHtml 直接高亮代码
        highlightedCode.value = await codeToHtml(props.data, {
            lang,
            theme: "catppuccin-latte"
            // theme: 'github-dark'
        })
    } catch (error) {
        // console.error('代码高亮失败:', error)
        // 降级处理：如果高亮失败，直接使用pre和code标签
        highlightedCode.value = `<pre style="background-color: #eff1f5;color: #4c4f69;"><code>${escapeHtml(props.data)}</code></pre>`
    } finally {
        // isLoading.value = false
    }
}

// HTML转义函数
const escapeHtml = (str: string) => {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
}

const copyCode = () => {
    navigator.clipboard.writeText(props.data)
    ElMessage.success('复制成功')
}

onMounted(async () => {
    await highlightCode()
})

watch(() => props.data, async () => {
    await highlightCode()
})

</script>

<style lang="scss">
.cm-rander-wrapper {
    &-inline {
        display: inline-block;

        .cm-header {
            display: none !important;
        }
    }

    // .el-scrollbar__bar {
    //     transform: translateY(5px);
    //     z-index: 10;
    // }

    .cm-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 10px;
        height: 25px;
        background-color: #15aa87;
        color: #fff;
        user-select: none;
        transition:all .25s ease;

        .cm-header-controls {
            display: flex;
            align-items: center;
            gap: 10px;

            .cm-header-controls-copy {
                cursor: pointer;
                color: #fff;
                fill: #fff;
                transition: all 0.2s ease;
                opacity: 1;
            }

            .cm-header-controls-copy-hide {
                pointer-events: none;
                opacity: 0;
            }

            .cm-switch-show-hide {
                cursor: pointer;
                color: #fff;
                fill: #fff;
            }
        }
    }
}
</style>