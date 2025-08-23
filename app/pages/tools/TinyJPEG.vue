<template>
    <div class="container mx-auto p-6">
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-6 transition-all duration-300 hover:border-[#15aa87] cursor-pointer select-none"
            @dragover="handleDragOver" @dragleave="handleDragLeave" @drop="handleDrop" @click="handleLableClick">
            <input type="file" accept="image/*" multiple class="hidden" ref="fileInput" @change="handleFileSelect" />
            <label class="block text-center text-gray-600 hover:text-gray-800 cursor-pointer">
                <div class="flex flex-col items-center">
                    <i class="fa fa-cloud-upload text-4xl mb-2 text-gray-400"></i>
                    <span class="text-lg font-medium">拖放图片到此处或点击上传</span>
                    <span class="text-sm text-gray-500 mt-1">支持多图上传</span>
                </div>
            </label>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6 mb-6 sticky top-2 z-20">
            <div class="flex items-center justify-between mb-2 select-none">
                <label class="text-gray-700 font-medium">压缩质量</label>
                <span class="text-gray-500 text-sm">{{ `${quality}` }}</span>
            </div>
            <el-slider v-model="quality" :min="0.01" :max="1" :step="0.01" show-tooltip @change="recompressAllImages"
                :disabled="isCompressing" class="w-full"></el-slider>
            <p class="text-xs text-gray-500 mt-2 select-none">
                调整压缩质量 (值越高质量越好，文件越大)
            </p>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6 mb-6 flex items-center justify-between"
            v-if="imageList.length > 0">
            <div class="text-gray-700 font-medium max-w-[80%]">
                <p>{{`压缩前：${(imageList.reduce((acc, item) => acc + item.file.size, 0) /
                    1024).toFixed(2)}KB ==> 压缩后：${(imageList.reduce((acc, item) => acc + (item.compressedSize ??
                        item.file.size),
                        0) / 1024).toFixed(2)}KB`}}</p>
                <p>{{`压缩率：${((imageList.reduce((acc, item) => acc + (item.compressedSize ??
                    item.file.size), 0) / imageList.reduce((acc, item) => acc + item.file.size, 0)) *
                    100).toFixed(2)}% ===> 节省：${((imageList.reduce((acc, item) => acc + item.file.size, 0) -
                        imageList.reduce((acc, item) => acc + (item.compressedSize ?? 0), 0)) /
                        1024).toFixed(2)}KB`}}</p>
            </div>
            <el-button @click="downloadAll" :disabled="isProcessingDownload || isCompressing" type="success">{{ isCompressing ?
                `处理中...` : `保存所有图片` }}</el-button>
        </div>

        <div class="flex flex-col items-center gap-6">
            <div v-for="(image, index) in imageList" :key="image.file.name"
                class="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg w-full">
                <div class="p-6 border-b border-gray-100 flex items-center justify-between">
                    <el-scrollbar class="min-w-40">
                        <h3 class="font-semibold text-gray-800">
                            {{ `${index + 1}. ${image.file.name}` }}
                        </h3>
                    </el-scrollbar>
                    <div class="flex items-center gap-2 flex-wrap" v-if="!image.isError">
                        <h3 class="font-semibold text-[#15aa87] mr-2 whitespace-nowrap">
                            {{ image.percent ? `- ${((image.file.size - (image.compressedSize ?? image.file.size)) /
                                1024).toFixed(2)}KB` : '-' }}
                        </h3>
                        <h3 class="font-semibold text-[#15aa87] mr-2 whitespace-nowrap">
                            压缩率：{{ image.percent ? `${((image.percent) * 100).toFixed(2)}%` : '-' }}
                        </h3>
                        <div class="flex gap-2">
                            <el-button class=" ml-0!" @click="downloadFile(image.compressedFile!)"
                                :disabled="!image.compressedFile || isCompressing" type="success">保存</el-button>
                            <el-button class=" ml-0!" @click="deleteFile(image)"
                                :disabled="!image.compressedFile || isCompressing" type="danger">删除</el-button>
                        </div>
                        <button @click="image.display = !image.display"
                            class="p-1.5 rounded-sm hover:bg-gray-100 transition-colors duration-200 w-10 cursor-pointer z-10">
                            <i class="text-lg">
                                <span>{{ image.display ? '👓' : '🕶️' }}</span>
                            </i>
                        </button>
                    </div>
                    <div v-if="image.isError" class="flex items-center gap-2">
                        <p class="text-sm text-red-500">压缩失败，请检查图片</p>
                        <el-button class=" ml-0!" @click="deleteFile(image)"
                            :disabled="isCompressing" type="danger">删除</el-button>
                    </div>
                </div>
                <miao-collapse :show="image.display && !image.isError">
                    <div class="flex flex-col md:flex-row">
                        <div class="w-full md:w-1/2 p-6 border-b md:border-b-0 md:border-r border-gray-100">
                            <div class="flex items-center justify-between">
                                <p class="text-sm text-gray-500 mb-2">原图</p>
                                <p class="text-sm text-gray-500 mb-2">{{ `${(image.file.size / 1024).toFixed(2)}KB` }}
                                </p>
                            </div>
                            <img :src="image.originalUrl" class="w-full h-auto rounded-lg object-contain"
                                :alt="`Original Image ${index + 1}`" />
                        </div>
                        <div class="w-full md:w-1/2 p-6">
                            <div class="flex items-center justify-between">
                                <p class="text-sm text-gray-500 mb-2">压缩后</p>
                                <p class="text-sm text-gray-500 mb-2">
                                    {{ image.compressedSize ? `${(image.compressedSize / 1024).toFixed(2)}KB` : '-' }}
                                </p>
                            </div>
                            <img v-if="image.compressedUrl" :src="image.compressedUrl"
                                class="w-full h-auto rounded-lg object-contain"
                                :alt="`Compressed Image ${index + 1}`" />
                            <div v-else class="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                                <div v-if="image.processing">
                                    <i class="fa fa-spinner fa-spin text-gray-400 mr-2"></i>
                                    <span class="text-gray-500 select-none">处理中...</span>
                                </div>
                                <div v-else>
                                    <i class="fa fa-refresh text-gray-400 mr-2"></i>
                                    <span class="text-gray-500">点击上方滑块调整质量</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </miao-collapse>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import compressImgWorker from '~/utils/worker/compressImg.ts?worker';
// 这个不显式导入会报错
import WorkerPool from '~/utils/WorkerPool';

interface ImageItem {
    file: File;
    originalUrl: string;
    compressedFile?: File;
    compressedUrl?: string;
    compressedSize?: number;
    processing: boolean;
    percent?: number;
    display: boolean;
    isError?: boolean;
}

const fileInput = ref<HTMLInputElement | null>(null);
const imageList = reactive<ImageItem[]>([]);
const quality = ref(0.3);
const isCompressing = ref(false);

const isProcessingDownload = ref(false);

const workerPool = import.meta.client ? new WorkerPool(compressImgWorker, {
    MaxWorkerCount: 4,
    // MaxTaskPerWorker: Infinity,
    // Mode: WorkerPool.MODE_MoreWorker
    // MaxTaskPerWorker: Infinity
}) : null;

const compressImgByWorker: (file: File, options: { quality: number }) => Promise<File> = workerPool ? async (file: File, options: { quality: number }) => {
    const res =
        (await workerPool.postMessage({ file, ...options }));
    if (res && res.error) {
        throw new Error(res.error);
    }
    return res!.file;
} : async (file: File) => {
    return file
};

const replaceSuffix = (filename: string, suffix: string) => {
    const dotIndex = filename.lastIndexOf('.');
    if (dotIndex === -1) return filename + suffix;
    return filename.substring(0, dotIndex) + suffix;
};

const deleteFile = (imageItem: ImageItem) => {
    const index = imageList.indexOf(imageItem);
    if (index !== -1) {
        imageList.splice(index, 1);
        URL.revokeObjectURL(imageItem.originalUrl);
        if (imageItem.compressedUrl) {
            URL.revokeObjectURL(imageItem.compressedUrl);
        }
    }
};

const downloadAll = async () => {
    if (isProcessingDownload.value) return;

    isProcessingDownload.value = true;

    const JSZip = await import('@progress/jszip-esm');

    const zip = new JSZip.default();

    imageList.forEach((imageItem) => {
        if (imageItem.isError || !imageItem.compressedFile) return;
        zip.file(imageItem.compressedFile!.name, imageItem.compressedFile!);
    });

    const result = new File([await zip.generateAsync({ type: 'blob' })], `compressed_images_${new Date().toISOString()}.zip`, {
        type: 'application/zip',
    });

    downloadFile(result);

    isProcessingDownload.value = false;
};

// 点击上传区域
const handleLableClick = () => {
    fileInput.value?.click();
};

// 处理拖放相关事件
const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer?.setData('text/plain', '');
    //   e.currentTarget?.classList.add('border-[#15aa87]', 'bg-green-50/30');
};

const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    //   e.currentTarget?.classList.remove('border-[#15aa87]', 'bg-green-50/30');
};

const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    //   e.currentTarget?.classList.remove('border-[#15aa87]', 'bg-green-50/30');

    const files = Array.from(e.dataTransfer?.files || []).filter(file => file.type.startsWith('image/'));
    if (files.length) {
        handleImages(files);
    }
};

// 处理文件选择
const handleFileSelect = (e: Event) => {
    const files = Array.from((e.target as HTMLInputElement).files || []).filter(file => file.type.startsWith('image/'));
    if (files.length) {
        handleImages(files);
        (e.target as HTMLInputElement).value = ''; // 重置输入，允许重复选择同一文件
    }
};

const handleImages = async (files: File[]) => {
    isCompressing.value = true;

    const timeStart = Date.now();

    const _c = async (file: File) => {
        const isDuplicate = imageList.some(item => item.file.name === file.name && item.file.size === file.size);
        if (isDuplicate) return;

        const originalUrl = URL.createObjectURL(file);

        const imageItem: ImageItem = {
            file,
            originalUrl,
            processing: true,
            display: false,
        };

        imageList.unshift(imageItem);

        try {
            const compressedBlob = await compressImgByWorker(file, { quality: quality.value })!;
            updateImageData(imageItem, compressedBlob!);
        } catch (error) {
            console.error(`${file.name} 压缩失败，请检查图片`, error);
            ElMessage({
                message: `${file.name} 压缩失败，请检查图片`,
                type: 'error',
            });
            imageItem.processing = false;
            imageItem.isError = true;
        }
    };
    await Promise.all(files.map(item => _c(item)));
    imageList.forEach(item => {
        item.display = false;
    });
    imageList[0].display = true;

    const timeEnd = Date.now();
    timeEnd - timeStart > 1000 && ElMessage({
        message: `压缩完成，耗时 ${timeEnd - timeStart}ms`,
        type: 'success',
    });
    isCompressing.value = false;
};

const updateImageData = (imageItem: ImageItem, compressedBlob: Blob) => {
    const compressedUrl = URL.createObjectURL(compressedBlob);

    if (imageItem.compressedUrl) {
        URL.revokeObjectURL(imageItem.compressedUrl);
    }

    const index = imageList.findIndex(item => item.originalUrl === imageItem.originalUrl);
    if (index !== -1) {
        imageList[index].compressedUrl = compressedUrl;
        imageList[index].processing = false;
        imageList[index].percent = compressedBlob.size / imageItem.file.size;
        imageList[index].compressedSize = compressedBlob.size;
        imageList[index].compressedFile = new File([compressedBlob], replaceSuffix(imageItem.file.name, '.jpeg'), {
            type: 'image/jpeg',
        });
        imageList[index].isError = false;
    }
};

const recompressAllImages = async () => {
    if (imageList.length === 0) return;

    const timeStart = Date.now();

    isCompressing.value = true;

    imageList.forEach(item => {
        item.processing = true;
    });

    await Promise.all(imageList.map(async (imageItem) => {
        try {
            const compressedBlob = await compressImgByWorker(imageItem.file, { quality: quality.value })!;
            updateImageData(imageItem, compressedBlob!);
        } catch (error) {
            console.error(`${imageItem.file.name} 压缩失败，请检查图片`, error);
            ElMessage({
                message: `${imageItem.file.name} 压缩失败，请检查图片`,
                type: 'error',
            });
            imageItem.processing = false;
            imageItem.isError = true;
        }
    }));
    
    const timeEnd = Date.now();

    timeEnd - timeStart > 1000 && ElMessage({
        message: `压缩完成，耗时 ${timeEnd - timeStart}ms`,
        type: 'success',
    });

    isCompressing.value = false;
};

onUnmounted(() => {
    imageList.forEach(item => {
        URL.revokeObjectURL(item.originalUrl);
        if (item.compressedUrl) {
            URL.revokeObjectURL(item.compressedUrl);
        }
    });
    workerPool && workerPool.terminate();
});
</script>