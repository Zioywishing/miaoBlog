<template>
    <div class="imgBed-wrapper">
        <div class="imgBed-wrapper-upload">
            <el-upload class="imgBed-wrapper-upload-el" :auto-upload="false" v-model="fileList"
                action="/api/tools/imgBed/upload" ref="uploadRef" :headers="headers" drag :data="data"
                @success="handleSuccess">
                <template #trigger>
                    <div class="imgBed-upload">
                        <upload class="imgBed-upload-icon"></upload>
                        <el-text style="margin: 0;">拖拽 图片 至此<br />或单击此处选择文件</el-text>
                    </div>
                </template>
            </el-upload>
            <el-row>
                <el-col :span="17">
                    <el-input v-model="expire" placeholder="有效期(小时)" style="width: 100%;">
                        <template #prepend>过期时间（小时）</template>
                    </el-input>
                </el-col>
                <el-col :span="7" class="flex-end">
                    <el-button type="primary" @click="handleUpload">
                        点击上传图片
                    </el-button>
                </el-col>
            </el-row>
            <el-table :data="tableData" style="width: 100%">
                <el-table-column show-overflow-tooltip prop="name" label="文件名" />
                <el-table-column prop="expire" label="过期时间" width="180" />
                <el-table-column fixed="right" prop="share" label="操作" width="180">
                    <template #default="scoped">
                        <el-button link type="primary" size="small" @click="handleDownload(scoped.row)">
                            下载
                        </el-button>
                        <el-button link type="primary" size="small" @click="handleShare(scoped.row)">分享</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <el-dialog v-model="showShareDialog" title="分享链接">
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <img :src="shareDialogData.img" alt="shareQRCodeBase64" />
                <div style="max-width: 80%;">
                    <span>{{ shareDialogData.url }}</span>
                    <span>
                        <copy style="width: 15px; margin-left: 4px; transform: translateY(3px); cursor: pointer;" @click="handleCopyUrl(shareDialogData.url)"></copy>
                    </span>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import type { UploadInstance } from 'element-plus';
import upload from '~/components/icons/upload.vue';
import copy from '~/components/icons/copy.vue';
// @ts-ignore
import QRCode from 'qrcode'

const fileList = ref([])
const headers = reactive({
    Authorization: ``
})
const uploadRef = ref<UploadInstance>()

const tableData = reactive<{
    name: string;
    expire: string;
    hash: string;
}[]>([])

const showShareDialog = ref(false)

const shareDialogData = ref({
    img: '',
    url: '',
})

const expire = ref(1)

const data = computed(() => {
    return {
        expire: expire.value * 3600 * 1000
    }
})

const handleUpload = () => {
    uploadRef.value!.submit()
}

const handleSuccess = (res: {
    code: number;
    fileName: string;
    expire: number;
    hash: string;
    fileSize: number;
}) => {
    if (res.code === 200) {
        const data = {
            name: res.fileName,
            expire: formatDate(new Date(Number(res.expire)), 'yyyy-MM-dd HH:mm:ss'),
            expireDate: Number(res.expire),
            hash: res.hash,
        }
        tableData.push(data)
    }
}

const handleDownload = (row: {
    name: string;
    hash: string;
}) => {
    const url = `/api/tools/imgBed/download/${row.hash}`
    const a = document.createElement('a')
    a.download = row.name
    a.href = url
    a.click()
}

const handleShare = async (row: {
    name: string;
    hash: string;
}) => {
    const url = `${location.origin}/api/tools/imgBed/download/${row.hash}`
    const data = await QRCode.toDataURL(url)
    shareDialogData.value = {
        img: data,
        url: url,
    }
    showShareDialog.value = true
}

const handleCopyUrl = async (url: string) => {
    await navigator.clipboard.writeText(url)
    ElMessage.success('复制成功')
}

onMounted(() => {
    const record = localStorage.getItem('miaoTool-imgBed-uploadRecord')
    if (record) {
        let _record = JSON.parse(record)
        // console.log({ _record, record })
        _record = _record.filter((item: { expireDate: number }) => {
            return item.expireDate && item.expireDate > Date.now()
        })
        tableData.push(..._record)
    }

    watchEffect(() => {
        localStorage.setItem('miaoTool-imgBed-uploadRecord', JSON.stringify(tableData))
    })
})
</script>

<style lang="scss" scoped>
.imgBed-wrapper {
    // box-sizing: border-box;
    position: relative;
    margin: 0 20px;
    padding: 20px 0 0 0;
    width: 100%;
    // height: calc(100vh - 60px);
    // max-height: calc(100vh - 60px);
    max-width: 800px;
    display: flex;
    flex-direction: column;
    align-items: center;

    &-upload {
        width: 95%;

        &-el {
            margin-bottom: 30px;
        }
    }

    .imgBed-upload {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        margin: 5px;

        &-icon {
            display: block;
            width: 45px;
            color: #595959;
        }
    }
}

.flex-end {
    display: flex;
    justify-content: flex-end;
}
</style>