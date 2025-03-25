<template>
    <div class="user-wrapper">
        <Suspense>
            <NuxtPage />
        </Suspense>
    </div>
</template>

<script setup lang="ts">

</script>

<style lang="scss" scoped>
.user-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: 0 auto;
    max-width: 800px;
    padding: 0;
}
</style>