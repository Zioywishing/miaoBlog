<template>
    <div class="iframe-warpper">
        <iframe src="/iframe-source/genshin-gacha/index.html" frameborder="0"></iframe>
    </div>
</template>

<script setup lang="ts">

</script>

<style scoped>
.iframe-warpper {
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