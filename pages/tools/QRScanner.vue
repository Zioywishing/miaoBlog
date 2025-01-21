<template>
    <div class="qr-scanner-wrapper">
        <miaoQRScanner></miaoQRScanner>
     </div>
</template>

<script setup lang="ts">
import miaoQRScanner from '~/components/miaoQRScanner.vue';
</script>

<style scoped>
.qr-scanner-wrapper {
    width: 100%;
    height: calc(100vh - 60px);
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>