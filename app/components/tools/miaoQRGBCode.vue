<template>
    <div>
        <canvas ref="canvasRefRGB"></canvas>
    </div>
</template>

<script setup lang="ts">
import QRCode from 'qrcode';
import jsqrgb from 'jsqrgb';
import { onMounted, ref, watchEffect } from 'vue';

const props = defineProps<{
    value: string | Uint8Array,
    width?: number
}>()

const width = ref(props.width ?? 600)

const canvasRefRGB = ref<HTMLCanvasElement>()

const generateQRCodeCanvasData = (data: Uint8Array) => {
    const canvas = document.createElement('canvas')
    canvas.width = width.value
    canvas.height = width.value
    const ctx = canvas.getContext('2d')!
    QRCode.toCanvas(canvas, [{ data, mode: 'byte' }], {
        width: width.value,
    })
    const imageData = ctx.getImageData(0, 0, width.value, width.value)
    return imageData
}

const paddingData = (data: Uint8Array) => {
    return new Uint8Array([...data, ...new Array(3 - data.length % 3).fill(0).map((_, i) => i)])
}

onMounted(() => {
    watchEffect(() => {
        const u8iData = props.value instanceof Uint8Array ? props.value : new TextEncoder().encode(props.value)
        const imgData = jsqrgb.generate(u8iData, {
            size: 600
        })
        const canvas = canvasRefRGB.value!
        canvas.width = width.value
        canvas.height = width.value
        const ctx = canvas.getContext('2d')!
        ctx.putImageData(imgData, 0, 0)
        return

        // const padedData = paddingData(u8iData)
        // const data = {
        //     r: padedData.slice(0, padedData.length / 3),
        //     g: padedData.slice(padedData.length / 3, padedData.length / 3 * 2),
        //     b: padedData.slice(padedData.length / 3 * 2, padedData.length)
        // }
        // const imgData = {
        //     r: generateQRCodeCanvasData(data.r),
        //     g: generateQRCodeCanvasData(data.g),
        //     b: generateQRCodeCanvasData(data.b)
        // }
        // const rgbImgData = new ImageData(width.value, width.value)
        // for (let i = 0; i < rgbImgData.data.length; i += 4) {
        //     rgbImgData.data[i] = imgData.r.data[i]
        //     rgbImgData.data[i + 1] = imgData.g.data[i + 1]
        //     rgbImgData.data[i + 2] = imgData.b.data[i + 2]
        //     rgbImgData.data[i + 3] = 2 << 8 - 1
        // }
        // const canvas = canvasRefRGB.value!
        // canvas.width = width.value
        // canvas.height = width.value
        // const ctx = canvas.getContext('2d')!
        // ctx.putImageData(rgbImgData, 0, 0)
    })
})


</script>

<style scoped></style>