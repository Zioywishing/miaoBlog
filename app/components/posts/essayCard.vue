<template>
    <article class="border-b-[#e8e8e8] m-5 mb-10">
        <div class="flex justify-between items-center mb-5">
            <div class="flex items-center gap-1 ">
                <time-icon style="height: 16px; color: #999999;" />
                <span class="text-sm text-[#999999]">{{ formatDate(essay.createTime, 'yyyy-MM-dd HH:mm:ss')
                }}</span>
            </div>
            <div class="flex-1 h-0 border-b-1 border-[#e8e8e8] mx-3"></div>
        </div>
        <main>
            <section class="mb-5 essay-content">
                <div v-html="essay.contentHtml"></div>
            </section>
            <div v-if="essay.images && essay.images.length > 0" ref="imgListRef" class="rounded-b-md overflow-hidden">
                <el-scrollbar ref="scrollbarRef">
                    <div class="flex gap-2 items-center pb-3 w-max">
                        <el-image v-for="(image, index) in essay.images" :key="index" :src="image"
                            :alt="`图片${index + 1}`" loading="lazy" class="h-40 rounded-sm cursor-pointer"
                            :preview-src-list="essay.images" :initial-index="index" fit="contain" hide-on-click-modal
                            style="width: auto; max-width: none; ">

                            <template #progress="{ activeIndex, total }">
                                <div class="flex justify-center items-center p-2 px-4 rounded-full" style="background-color: #606266;">
                                    <span>{{ `第 ${activeIndex + 1} / ${total} 张` }}</span>
                                </div>
                            </template>
                        </el-image>
                    </div>
                </el-scrollbar>
            </div>
        </main>
    </article>
</template>

<script setup lang="ts">
import type { essayItem } from '~/types/essay';
import formatDate from '~/utils/formatDate';
import timeIcon from '~/components/icons/time.vue'
import type { ElScrollbar } from 'element-plus';

const props = defineProps<{
    essay: essayItem
}>()

const imgListRef = ref<HTMLDivElement>();
const scrollbarRef = ref<InstanceType<typeof ElScrollbar>>();

onMounted(() => {
    if (imgListRef.value) {
        // 阻止图片列表的滚轮事件冒泡,避免触发页面滚动
        imgListRef.value.addEventListener('wheel', (e) => {
            e.preventDefault();
            e.stopPropagation();

            // 获取滚动条实例
            const scrollbar = scrollbarRef.value;
            if (!scrollbar) return;

            // 根据滚轮方向调整滚动位置
            let delta = e.deltaX || e.deltaY || e.detail;

            if (!delta) return;

            // delta = (delta > 0 ? 1 : -1) * Math.max(Math.abs(delta), 10);

            // 获取当前滚动位置
            const currentScrollLeft = scrollbar.wrapRef?.scrollLeft || 0;

            // 计算新的滚动位置
            const newScrollLeft = delta + currentScrollLeft;

            // 执行滚动
            scrollbar.setScrollLeft(newScrollLeft);
        });
    }
})
</script>


<style scoped lang="scss">
// .essay-content {
//     :deep(p) {
//         text-indent: 2em;
//     }
// }

:deep(.essay-content) {
    code {
        white-space: pre;
        // box-sizing: border-box;
        // display: inline-block;
        // width: 100%;
        // text-wrap: auto;
        // background-color: #e7e7e7;
        // padding: 5px;
        // padding-left: 10px;
        // border-radius: 5px;
    }

    hr {
        display: block;
        margin: 1em 0;
        padding-top: 1em;
        unicode-bidi: isolate;
        overflow: hidden;
        height: auto;
    }

    /* 恢复标题样式 */
    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
        margin-top: 1em;
        margin-bottom: 0.5em;
        font-weight: bold;
        line-height: 1.25;
        color: #111;
    }

    h1 {
        font-size: 2em;
        border-bottom: 1px solid #eaecef;
        padding-bottom: 0.3em;
    }

    h2 {
        font-size: 1.5em;
        border-bottom: 1px solid #eaecef;
        padding-bottom: 0.3em;
    }

    h3 {
        font-size: 1.25em;
    }

    h4 {
        font-size: 1em;
    }

    h5 {
        font-size: 0.875em;
    }

    h6 {
        font-size: 0.85em;
        color: #6a737d;
    }

    /* 恢复段落样式 */
    p {
        // margin-top: 0;
        margin: 5px 0;
        line-height: 1.6;
    }

    /* 恢复列表样式 */
    ul,
    ol {
        margin-top: 0;
        margin-bottom: 1em;
        padding-left: 2em;
    }

    ul {
        list-style-type: disc;
    }

    ol {
        list-style-type: decimal;
    }

    li {
        margin-bottom: 0.25em;
    }

    li>ul,
    li>ol {
        margin-top: 0.25em;
        margin-bottom: 0;
    }

    /* 恢复链接样式 */
    a {
        color: #0366d6;
        text-decoration: none;
        word-wrap: break-word;

        &:hover {
            text-decoration: underline;
        }
    }

    /* 恢复引用块样式 */
    blockquote {
        margin: 0 0 1em;
        padding: 0 1em;
        color: #6a737d;
        border-left: 0.25em solid #dfe2e5;

        > :first-child {
            margin-top: 0;
        }

        > :last-child {
            margin-bottom: 0;
        }
    }

    /* 恢复表格样式 */
    table {
        display: block;
        width: 100%;
        overflow: auto;
        margin-top: 0;
        margin-bottom: 1em;
        border-spacing: 0;
        border-collapse: collapse;
    }

    th {
        font-weight: 600;
        padding: 6px 13px;
        border: 1px solid #dfe2e5;
    }

    td {
        padding: 6px 13px;
        border: 1px solid #dfe2e5;
    }

    tr {
        background-color: #fff;
        border-top: 1px solid #c6cbd1;

        &:nth-child(2n) {
            background-color: #f6f8fa;
        }
    }

    /* 恢复行内代码样式 */
    // code:not(pre code) {
    //     padding: 0.2em 0.4em;
    //     margin: 0;
    //     font-size: 85%;
    //     background-color: rgba(27, 31, 35, 0.05);
    //     border-radius: 3px;
    //     font-family: SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace;
    // }

    /* 恢复图片样式 */
    img {
        max-width: 100%;
        box-sizing: border-box;
        background-color: #fff;
    }

    /* 恢复预格式化文本样式 */
    pre {
        // padding: 0px 15px;
        white-space: pre-wrap;
        // word-wrap: break-word;
        // overflow-wrap: break-word;
        // background-color: #e7e7e7;
        // padding: 16px;
        // overflow: auto;
        // font-size: 85%;
        // line-height: 1.45;
        // background-color: #f6f8fa;
        // border-radius: 3px;
        // margin-top: 0;
        // margin-bottom: 1em;
        // word-wrap: normal;
    }
}
</style>