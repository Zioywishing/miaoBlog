<template>
  <div class="main-wrapper">
    <miao-header></miao-header>
    <miao-content-wrapper>
      <NuxtPage />
    </miao-content-wrapper>
  </div>
</template>

<script lang="ts" setup>
import miaoHeader from './components/miaoHeader.vue';
import miaoContentWrapper from './components/miaoContentWrapper.vue';

// @ts-ignore
useHead({
  title: '杪 Blog',
  meta: [
    { name: 'description', content: '杪儿的博客' }
  ],
})

</script>

<style lang="scss" scoped>
.main-wrapper {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>

<style lang="scss">
@use '/style/default.scss';
</style>

<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.15s ease;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}
</style>