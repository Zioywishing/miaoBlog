<template>
    <div class="qr-scanner-wrapper">
        <video ref="scannerDisplayRef"></video>
        <div>res: {{ res }}</div>
        <canvas ref="testCtx" style="transform: scale(.6);" v-show="true"></canvas>
        <canvas ref="testCtxR" style="transform: scale(.6);" v-show="true"></canvas>
        <canvas ref="testCtxG" style="transform: scale(.6);" v-show="true"></canvas>
        <canvas ref="testCtxB" style="transform: scale(.6);" v-show="true"></canvas>
    </div>
</template>

<script setup lang="ts">
import jsQR from 'jsqr'
import { ref, onMounted, onBeforeUnmount } from 'vue';

const emit = defineEmits<{
    onResult: [value: Uint8Array]
}>()

const scannerDisplayRef = ref<HTMLVideoElement>()
const testCtx = ref<HTMLCanvasElement>()
const testCtxR = ref<HTMLCanvasElement>()
const testCtxG = ref<HTMLCanvasElement>()
const testCtxB = ref<HTMLCanvasElement>()
const res = ref<string>('')

let stream: MediaStream | null = null
let timer: any | undefined = undefined

const u8iEndWith = (data: Uint8Array, target: number[]) => {
    for (let i = 0; i < target.length; i++) {
        if (data[data.length - 1 - i] !== target[target.length - 1 - i]) return false
    }
    return true
}

const unpaddingData = (data: Uint8Array): Uint8Array => {
    return data.slice(0, data.length - data[data.length - 1])
}

class Binarization {
    constructor(options?: {
        threshold?: number
        min?: number,
        max?: number
    }) {
        options === undefined || (options = {})
        this.threshold = options?.threshold ?? 150
        this.min = options?.min ?? 0
        this.max = options?.max ?? 255
    }
    private threshold: number
    private min: number
    private max: number
    private cache = new Map<number, number>()
    public binarization = (value: number) => {
        if (this.cache.has(value)) return this.cache.get(value)!
        const res = value >= this.threshold? this.max : this.min
        this.cache.set(value, res)
        return res
    }
}
// const scannerResult = new Set()

const getQRDataFromVideoFrame = (videoFrame: VideoFrame): Uint8Array | undefined => {
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
    const binarization = new Binarization().binarization
    for (let i = 0; i < imageData.data.length; i += 4) {
        const rgba = {
            r: binarization(imageData.data[i]),
            g: binarization(imageData.data[i + 1]),
            b: binarization(imageData.data[i + 2]),
            a: imageData.data[i + 3]
        }
        imageDataRGB.r.data[i] = rgba.r
        imageDataRGB.r.data[i + 1] = rgba.r
        imageDataRGB.r.data[i + 2] = rgba.r
        imageDataRGB.r.data[i + 3] = rgba.a
        imageDataRGB.g.data[i] = rgba.g
        imageDataRGB.g.data[i + 1] = rgba.g
        imageDataRGB.g.data[i + 2] = rgba.g
        imageDataRGB.g.data[i + 3] = rgba.a
        imageDataRGB.b.data[i] = rgba.b
        imageDataRGB.b.data[i + 1] = rgba.b
        imageDataRGB.b.data[i + 2] = rgba.b
        imageDataRGB.b.data[i + 3] = rgba.a
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
    if (!codeR || !codeG || !codeB) return undefined
    const resBuffer = new Uint8Array([...codeR.binaryData, ...codeG.binaryData, ...codeB.binaryData])
    const data = unpaddingData(resBuffer)
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
            res.value = new TextDecoder().decode(data)
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