<template>
  <div class="miao-divider">
    <div class="left-line miao-divider-line"></div>
    <div class="miao-divider-text">
      <slot></slot>
    </div>
    <div class="right-line miao-divider-line"></div>
  </div>
</template>
<script lang="ts" setup>
</script>
<style scoped lang="scss">
.miao-divider {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 10px 0;
}

.miao-divider-line {
  height: 1px;
  background-color: #e8e8e8;
}

.left-line {
  flex: 1;
}

.right-line {
  flex: 32;
}

.miao-divider-text {
  margin: 0 10px;
}
</style>