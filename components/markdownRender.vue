<!-- todo: 对于这个代码，未来要用组件进行渲染 -->

<template>
    <div class="md-render-wrapper markdown-body">
        <div v-html="renderedData" :key="_key"></div>
    </div>
</template>

<script setup lang="ts">
import useMarkdownit from '~/hooks/useMarkdownit';

const props = defineProps<{
    data: string
}>()

const _key = ref(Math.random())

const markdownIt = await useMarkdownit()

const renderedData = computed(() => {
    return markdownIt.render(props.data)
})

watch(() => renderedData.value, () => {
    _key.value = Math.random()
})

</script>

<style>
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
}
</style>