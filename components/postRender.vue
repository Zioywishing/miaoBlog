<template>
    <div class="md-render-wrapper markdown-body">
        <!-- todo: 更新场景下的差分更新diff优化 -->
        <component v-for="vnode in VNodeMD" :is="vnode" v-if="VNodeMD.length && 1"></component>
        <div class="md-render-html-fix" v-html="props.data" v-else></div>
    </div>
</template>

<script setup lang="ts">
import type { VNode } from 'vue';
import useCodedisplayMiddleware from '~/hooks/h2v/codemirrorMiddleware';
import useImgDisplayMiddleware from '~/hooks/h2v/imgMiddleware';
import Html2VNode from '~/utils/html2VNode';

const props = defineProps<{
    data: string
}>()

const VNodeMD = shallowRef<VNode[]>([])

const h2v = new Html2VNode()

h2v.use(useCodedisplayMiddleware())
h2v.use(useImgDisplayMiddleware())

const renderHTML = async () => {
    if (!props.data) {
        VNodeMD.value = [h('span', {}, "empty")]
    }
    VNodeMD.value = await h2v.render(props.data!) as VNode[]
}


watch(() => props.data, renderHTML)

await renderHTML()


</script>

<style scoped lang="scss">
// 尽量使渲染前的页面与渲染后的保持一致
.md-render-html-fix {

    :deep(img) {
        border-radius: .25rem;
        margin: 5px 0;
        // margin-block-start: 1em;
        margin-block-end: 1em;
        margin-inline-start: 0px;
        margin-inline-end: 0px;
    }

    :deep(:not(pre)) {
        code {
            font-family: inherit;
            font-size: inherit;
            color: inherit;
            margin: 0;
            border: none;
            white-space: normal;

            background-color: rgb(239, 241, 245);
            padding: 2px 6px;
            border-radius: 4px;
            color: #111;

        }
    }

    :deep(pre:has(> code:only-child)) {
        --spacing: .25rem;
        overflow-x: hidden;
        background-color: rgb(239, 241, 245);
        // padding: calc(var(--spacing) * 1) calc(var(--spacing) * .5) calc(var(--spacing) * 1.5) calc(var(--spacing) * 3);
        border-radius: 10px 10px;
        margin-bottom: .5rem;


        &::before {
            content: ' loading';
            width: 100%;
            height: 25px;
            display: flex;
            background-color: #15aa87;
            border-radius: 10px 10px 0 0;
            color: #fff;
            font-size: small;
            align-items: center;
        }

        code {
            display: block;
            padding: calc(var(--spacing) * 1) calc(var(--spacing) * .5) calc(var(--spacing) * 1.5) calc(var(--spacing) * 3);
        }
    }
}
</style>

<style lang="scss">
.md-render-wrapper {
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