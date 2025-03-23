<!-- todo: 对于这个代码，未来要用组件进行渲染 -->

<template>
    <div class="md-render-wrapper markdown-body">
        <!-- <div v-html="renderedData" :key="_key"></div> -->
        <VNodeArr></VNodeArr>
    </div>
</template>

<script setup lang="ts">
import useMarkdownit from '~/hooks/useMarkdownit';
import Html2VNode from '~/utils/html2VNode';
import codeMirror from './codeMirror.vue';

const props = defineProps<{
    data: string
}>()

const _key = ref(Math.random())

const markdownIt = await useMarkdownit()

const VNodeArr = computed(() => {
    if (!props.data) {
        return () => []
    }
    const renderedData = markdownIt.render(props.data)
    const h2v = new Html2VNode()
    h2v.use(
        {
            filter(tagName) {
                return tagName === 'code'
            },
            rander({
                item,
                // tagName,
                tagAttrs,
                // middlewareMap
            }) {
                // console.log({
                //     tagName,
                //     tagAttrs,
                // })
                const codeType = tagAttrs?.class?.slice(1, -1)?.split('-')?.[1] ?? ''
                // console.log({
                //     codeType,
                // })
                // @ts-ignore
                const inline = (item.children[0].children.trim() as string).includes('\n') ? false : true
                console.log({
                    inline,
                    c: item.children
                })
                return h(
                    codeMirror,
                    {
                        // @ts-ignore
                        data: item.children[0].children.trim(),
                        type: codeType,
                        inline,
                    },
                )
            },
        }
    )
    const res = h2v.render(renderedData)
    return {
        setup: () => {
            return () => res
        },
    }
})

// watch(() => renderedData.value, () => {
//     _key.value = Math.random()
// })

</script>

<style lang="scss">
.md-render-wrapper {
    code {
        box-sizing: border-box;
        display: inline-block;
        width: 100%;
        text-wrap: auto;
        background-color: #e7e7e7;
        padding: 5px;
        padding-left: 10px;
        border-radius: 5px;
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
    h1, h2, h3, h4, h5, h6 {
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
        margin-top: 0;
        margin-bottom: 1em;
        line-height: 1.6;
    }

    /* 恢复列表样式 */
    ul, ol {
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
    
    li > ul, li > ol {
        margin-top: 0.25em;
        margin-bottom: 0;
    }

    /* 恢复链接样式 */
    a {
        color: #0366d6;
        text-decoration: none;
        
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
    code:not(pre code) {
        padding: 0.2em 0.4em;
        margin: 0;
        font-size: 85%;
        background-color: rgba(27, 31, 35, 0.05);
        border-radius: 3px;
        font-family: SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace;
    }

    /* 恢复图片样式 */
    img {
        max-width: 100%;
        box-sizing: border-box;
        background-color: #fff;
    }

    /* 恢复预格式化文本样式 */
    pre {
        padding: 16px;
        overflow: auto;
        font-size: 85%;
        line-height: 1.45;
        background-color: #f6f8fa;
        border-radius: 3px;
        margin-top: 0;
        margin-bottom: 1em;
        word-wrap: normal;
    }
}
</style>