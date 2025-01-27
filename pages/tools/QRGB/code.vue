<template>
    <div style="display: flex;flex-direction: column;align-items: center;">
        <miaoQRGBCode :value="testData"/>
        <div>{{ testData }}</div>
        <input type="text" v-model="testData">
        <!-- <miaoQRCode :value="testData"/> -->
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import miaoQRGBCode from '~/components/tools/miaoQRGBCode.vue';
// import miaoQRCode from '../components/miaoQRCode.vue';

const testData = ref(new Array(3).fill(0).map(_ => `${Math.random()}`).join(''))

</script>

<style scoped>

</style>