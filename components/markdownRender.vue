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
                tagName,
                tagAttrs,
                middlewareMap
            }) {
                return h(
                    codeMirror,
                    {
                        // @ts-ignore
                        data: (item.children[0].children as string).replaceAll('&lt;', '<').replaceAll('&gt;', '>'),
                    },
                )
            },
        }
    )
    const res = h2v.rander(renderedData)
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
        margin: 0;
        unicode-bidi: isolate;
        overflow: hidden;
        border-style: inset;
        border-width: 0;
    }
}
</style>