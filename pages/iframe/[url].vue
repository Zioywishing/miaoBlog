<template>
    <div class="iframe-wrapper">
        <iframe ref="iframeRef" :src="decodeURIComponent(route.params.url as string)" frameborder="0"></iframe>
        <Transition name="fade">
            <div class="loading w-full h-full bg-[#ffffffee] absolute flex justify-center items-center" v-show="isLoading">
                <div>
                    <miao-loading></miao-loading>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">

const route = useRoute();

const iframeRef = ref<HTMLIFrameElement | null>(null);

const isLoading = ref(true);

onMounted(() => {
    iframeRef.value?.addEventListener('load', () => {
        // console.log('iframe loaded');
        isLoading.value = false;
    })
})

// onMounted(() => {
//     console.log(route.params.url);
// })
</script>

<style scoped>
.iframe-wrapper {
    position: relative;
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

.fade-leave-active {
    transition: opacity 0.15s linear;
}

.fade-leave-to {
  opacity: 0;
}
</style>