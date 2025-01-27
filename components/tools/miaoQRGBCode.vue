<template>
    <div>
        <canvas ref="canvasRefRGB"></canvas>
    </div>
</template>

<script setup lang="ts">
import QRCode from 'qrcode';
import { onMounted, ref, watchEffect } from 'vue';

const props = defineProps<{
    value: string
}>()

const width = ref(600)

const canvasRefRGB = ref<HTMLCanvasElement>()

const generateQRCodeCanvasData = (data: string) => {
    const canvas = document.createElement('canvas')
    canvas.width = width.value
    canvas.height = width.value
    const ctx = canvas.getContext('2d')!
    QRCode.toCanvas(canvas, [{ data: new TextEncoder().encode(data), mode: 'byte' }], {
        width: width.value,
    })
    const imageData = ctx.getImageData(0, 0, width.value, width.value)
    return imageData
}

const paddingData = (data: string) => {
    const b64Data = btoa(data)
    if (b64Data.length % 3 === 0) {
        return b64Data + '012'
    } else if (b64Data.length % 3 === 1) {
        return b64Data + '01'
    } else {
        return b64Data + '0'
    }
}

onMounted(() => {
    watchEffect(() => {
        const padedData = paddingData(props.value)
        const data = {
            r: padedData.slice(0, padedData.length / 3),
            g: padedData.slice(padedData.length / 3, padedData.length / 3 * 2),
            b: padedData.slice(padedData.length / 3 * 2, padedData.length)
        }
        // console.log({
        //     data,
        //     ECData: {
        //         r: new TextEncoder().encode(data.r),
        //         g: new TextEncoder().encode(data.g),
        //         b: new TextEncoder().encode(data.b)
        //     }
        // })
        const imgData = {
            r: generateQRCodeCanvasData(data.r),
            g: generateQRCodeCanvasData(data.g),
            b: generateQRCodeCanvasData(data.b)
        }
        const rgbImgData = new ImageData(width.value, width.value)
        for (let i = 0; i < rgbImgData.data.length; i += 4) {
            rgbImgData.data[i] = imgData.r.data[i]
            rgbImgData.data[i + 1] = imgData.g.data[i + 1]
            rgbImgData.data[i + 2] = imgData.b.data[i + 2]
            rgbImgData.data[i + 3] = 2 << 8 - 1
        }
        const canvas = canvasRefRGB.value!
        canvas.width = width.value
        canvas.height = width.value
        const ctx = canvas.getContext('2d')!
        ctx.putImageData(rgbImgData, 0, 0)
    })
})


</script>

<style scoped></style>