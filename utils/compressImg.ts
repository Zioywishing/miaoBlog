export default async function compressImg(imgFile: File, quality?: number) {
    quality = quality || 0.5;
    const bitmap = await createImageBitmap(imgFile);
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext('2d');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    ctx?.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height);
    const compressImgData = await canvas.convertToBlob({ type: 'image/jpeg', quality });
    return compressImgData;
}