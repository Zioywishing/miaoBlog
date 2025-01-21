<template>
    <div class="qr-scanner-wrapper">
        <video ref="scannerDisplayRef"></video>
        <!-- <canvas ref="testCtx" v-show="false"></canvas> -->
    </div>
</template>

<script setup lang="ts">
import jsQR from 'jsqr'

const emit = defineEmits<{
    onResult: [value: string]
}>()

const scannerDisplayRef = ref<HTMLVideoElement>()
// const testCtx = ref<HTMLCanvasElement>()
const result = reactive<string[]>([])

let stream: MediaStream | null = null
let timer: any | undefined = undefined

const scannerResult = new Set()

const getQRData = (videoFrame: VideoFrame): string | undefined => {
    const canvas = document.createElement('canvas')
    // const canvas = testCtx.value!
    // @ts-ignore
    canvas.width = videoFrame.width
    // @ts-ignore
    canvas.height = videoFrame.height
    // console.log(canvas.width, canvas.height)
    const ctx = canvas.getContext('2d')
    ctx?.drawImage(videoFrame, 0, 0, canvas.width, canvas.height)
    const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height)
    if (!imageData) return undefined
    const code = jsQR(imageData?.data, imageData?.width, imageData?.height)
    return code?.data
}

const handleVideoTrack = (track: MediaStreamTrack) => {
    timer && clearInterval(timer);
    let errCount = 0
    // @ts-ignore
    const imageCapture = new ImageCapture(track)
    timer = setInterval(async () => {
        try {
            const videoFrame = await imageCapture.grabFrame()
            const data = getQRData(videoFrame)
            if (data && !scannerResult.has(data)) {
                console.log(data)
                scannerResult.add(data)
                result.push(data)
                emit('onResult', data)
            }
            videoFrame.close()
        } catch (e) {
            errCount++
            if (errCount > 10) {
                clearInterval(timer)
            }
        }
    }, 500)
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
        handleVideoTrack(videoTrack)
    }
})

onBeforeUnmount(() => {
    stream?.getTracks().forEach(track => track.stop())
})

</script>

<style scoped>
.qr-scanner-wrapper {
    display: flex;
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