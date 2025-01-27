<template>
    <div class="qr-scanner-wrapper">
        <video ref="scannerDisplayRef"></video>
        <canvas ref="testCtx" style="transform: scale(.6);" v-show="true"></canvas>
        <canvas ref="testCtxR" style="transform: scale(.6);" v-show="true"></canvas>
        <canvas ref="testCtxG" style="transform: scale(.6);" v-show="true"></canvas>
        <canvas ref="testCtxB" style="transform: scale(.6);" v-show="true"></canvas>
        <div>{{ res }}</div>
    </div>
</template>

<script setup lang="ts">
import jsQR from 'jsqr'
import { ref, onMounted, onBeforeUnmount } from 'vue';

const emit = defineEmits<{
    onResult: [value: string]
}>()

const scannerDisplayRef = ref<HTMLVideoElement>()
const testCtx = ref<HTMLCanvasElement>()
const testCtxR = ref<HTMLCanvasElement>()
const testCtxG = ref<HTMLCanvasElement>()
const testCtxB = ref<HTMLCanvasElement>()
// const result = reactive<string[]>([])
const res = ref<string>('')

let stream: MediaStream | null = null
let timer: any | undefined = undefined

const unpaddingData = (data: string) => {
    if (data.endsWith('012')) {
        return atob(data.slice(0, data.length - 3))    
    } else if (data.endsWith('01')) {
        return atob(data.slice(0, data.length - 2)) 
    } else {
        return atob(data.slice(0, data.length - 1)) 
    }
}

// const scannerResult = new Set()

const getQRDataFromVideoFrame = (videoFrame: VideoFrame): string | undefined => {
    const canvas = testCtx.value!
    canvas.width = videoFrame.codedWidth
    canvas.height = videoFrame.codedHeight
    // if (!videoFrame.codedWidth) return undefined
    const ctx = canvas.getContext('2d')
    ctx?.drawImage(videoFrame, 0, 0, canvas.width, canvas.height)
    videoFrame.close()
    const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height)
    if (!imageData) return undefined
    const imageDataRGB = {
        r: new ImageData(canvas.width, canvas.height),
        g: new ImageData(canvas.width, canvas.height),
        b: new ImageData(canvas.width, canvas.height),
    }
    for (let i = 0; i < imageData.data.length; i += 4) {
        imageDataRGB.r.data[i] = imageData.data[i]
        imageDataRGB.r.data[i + 1] = imageData.data[i]
        imageDataRGB.r.data[i + 2] = imageData.data[i]
        imageDataRGB.r.data[i + 3] = imageData.data[i + 3]
        imageDataRGB.g.data[i] = imageData.data[i + 1]
        imageDataRGB.g.data[i + 1] = imageData.data[i + 1]
        imageDataRGB.g.data[i + 2] = imageData.data[i + 1]
        imageDataRGB.g.data[i + 3] = imageData.data[i + 3]
        imageDataRGB.b.data[i] = imageData.data[i + 2]
        imageDataRGB.b.data[i + 1] = imageData.data[i + 2]
        imageDataRGB.b.data[i + 2] = imageData.data[i + 2]
        imageDataRGB.b.data[i + 3] = imageData.data[i + 3]
    }
    testCtxR.value!.width = canvas.width
    testCtxR.value!.height = canvas.height
    testCtxG.value!.width = canvas.width
    testCtxG.value!.height = canvas.height
    testCtxB.value!.width = canvas.width
    testCtxB.value!.height = canvas.height
    testCtxR.value!.getContext('2d')?.putImageData(imageDataRGB.r, 0, 0)
    testCtxG.value!.getContext('2d')?.putImageData(imageDataRGB.g, 0, 0)
    testCtxB.value!.getContext('2d')?.putImageData(imageDataRGB.b, 0, 0)
    // const code = jsQR(imageData?.data, imageData?.width, imageData?.height)
    const codeR = jsQR(imageDataRGB.r.data, imageDataRGB.r.width, imageDataRGB.r.height)
    const codeG = jsQR(imageDataRGB.g.data, imageDataRGB.g.width, imageDataRGB.g.height)
    const codeB = jsQR(imageDataRGB.b.data, imageDataRGB.b.width, imageDataRGB.b.height)
    if(!codeR || !codeG || !codeB) return undefined
    const data = unpaddingData(codeR?.data + codeG?.data + codeB?.data)
    return data
}

const handleTrackProcessor = async (track: MediaStreamTrack) => {
    // @ts-ignore
    const trackProcessor = new MediaStreamTrackProcessor(track);

    const reader = trackProcessor.readable.getReader();
    while (true) {
        const result = await reader.read();
        if (result.done) break;
        const frameFromCamera = result.value as VideoFrame;
        const data = getQRDataFromVideoFrame(frameFromCamera)
        if (data) {
           res.value = data 
           console.log(data)
           emit('onResult', data)
        }
    }
}

onMounted(async () => {
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
        })
    } catch (e) {
        stream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
        })
    }
    if (stream) {
        scannerDisplayRef.value!.srcObject = stream
        scannerDisplayRef.value!.play()
        const videoTrack = stream.getVideoTracks()[0]
        // handleVideoTrack(videoTrack)
        handleTrackProcessor(videoTrack)
    }
})

onBeforeUnmount(() => {
    stream?.getTracks().forEach(track => track.stop())
    clearInterval(timer)
})

</script>

<style scoped>
.qr-scanner-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    video {
        height: inherit;
        width: inherit;
        max-height: inherit;
        max-width: inherit;
        object-fit: contain;
    }
}
</style>