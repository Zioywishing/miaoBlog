<template>
  <!-- <n-config-provider inline-theme-disabled> -->
  <div class="main-wrapper">
    <miao-header></miao-header>
    <miao-content-wrapper>
      <NuxtPage />
    </miao-content-wrapper>
  </div>
  <!-- </n-config-provider> -->
</template>

<script lang="ts" setup>
import miaoHeader from './components/miaoHeader.vue';
import miaoContentWrapper from './components/miaoContentWrapper.vue';
import "/style/default.scss";
import "/style/tailwind.css"

// @ts-ignore
useHead({
  title: '杪 Blog',
  htmlAttrs: {
    lang: 'zh-CN',
  }
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

<!-- <style lang="scss">
@use '/style/default.scss';
</style> -->

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