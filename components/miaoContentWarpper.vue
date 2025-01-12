<template>
    <main id="miao-main">
        <n-scrollbar>
            <slot></slot>
        </n-scrollbar>
    </main>
</template>

<script setup lang="ts">

</script>

<style lang="scss" scoped>
#miao-main {
    position: relative;
    height: calc(100vh - 60px);
    max-height: calc(100vh - 60px);
    width: 100%;
    max-width: 1200px;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}
</style>