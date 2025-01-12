<template>
    <div class="iframe-wrapper">
        <iframe :src="decodeURIComponent(route.params.url as string)" frameborder="0"></iframe>
    </div>
</template>

<script setup lang="ts">

const route = useRoute();

// onMounted(() => {
//     console.log(route.params.url);
// })
</script>

<style scoped>
.iframe-wrapper {
    width: 100%;
    min-height: inherit;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
}
iframe {
    flex: 1;
    width: 100%;
    /* height: 100%; */
    padding: 0;
    margin: 0;
}
</style>