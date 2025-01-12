<template>
  <div class="main-warpper">
    <miao-header></miao-header>
    <miao-content-warpper>
      <NuxtPage />
    </miao-content-warpper>
  </div>
</template>

<script lang="ts" setup>
import miaoHeader from './components/miaoHeader.vue';
import miaoContentWarpper from './components/miaoContentWarpper.vue';

</script>

<style lang="scss" scoped>
.main-warpper {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>

<style lang="scss">
@use '/style/default.scss';
</style>