<template>
    <div class="iframe-wrapper">
        <iframe ref="iframeRef" frameborder="0" :src="decodeURIComponent(route.params.url as string)"></iframe>
        <Transition name="fade">
            <div class="loading w-full h-full bg-[#ffffff] absolute flex justify-center items-center"
                v-show="isLoading">
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

let checkTimer: any

const checkIsLoaded = () => {
    iframeRef.value?.contentDocument ? (_ => isLoading.value = false)() : iframeRef.value!.addEventListener('load', () => {
        isLoading.value = false;
    })
    clearInterval(checkTimer)
}

onMounted(() => {
    checkIsLoaded()
    isLoading.value && (checkTimer = setInterval(checkIsLoaded, 1000))
})
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