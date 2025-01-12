<template>
    <main id="miao-main">
        <n-scrollbar>
            <div class="miao-main-slot-warpper">
                <slot></slot>
            </div>
        </n-scrollbar>
    </main>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
#miao-main {
    position: relative;
    height: calc(100vh - 60px);
    max-height: calc(100vh - 60px);
    width: 100%;
    margin: 0;
    padding: 0;
    box-sizing: border-box;

    .miao-main-slot-warpper {
        position: relative;
        min-height: calc(100vh - 60px);
    }
}
</style>
