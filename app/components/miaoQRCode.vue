<script setup lang="ts">
import QRCode from 'qrcode';

const props = defineProps<{
    data: Uint8Array | string
    height: number
    width: number
}>()

const qrcodeData = defineModel<ImageData>('qrcode-img-data')

const canvasRef = ref<HTMLCanvasElement>()

const string2U8Array = (str: string) => new TextEncoder().encode(str);

const generateQRCodeCanvasData = (data: Uint8Array, option: {
    width: number,
    height: number,
}) => {
    if (!canvasRef.value) return;
    const canvas = canvasRef.value
    const ctx = canvas.getContext('2d')!
    QRCode.toCanvas(canvas, [{ data, mode: 'byte' }], option)
    const imageData = ctx.getImageData(0, 0, option.width, option.height)
    return imageData
}

onMounted(() => {
    if (!canvasRef.value) return;
    if(qrcodeData.value) {
        console.log("cache")
        canvasRef.value.width = qrcodeData.value.width;
        canvasRef.value.height = qrcodeData.value.height;
        canvasRef.value.getContext('2d')?.putImageData(qrcodeData.value, 0, 0);
        return
    }
    if (props.data) {
        const data = typeof props.data === 'string' ? string2U8Array(props.data) : props.data;
        qrcodeData.value = generateQRCodeCanvasData(data, {
            width: props.width,
            height: props.height,
        })
    }
})

</script>

<template>
    <canvas :width="width" :height="height" ref="canvasRef"></canvas>
</template>

<style lang="scss" scoped></style>