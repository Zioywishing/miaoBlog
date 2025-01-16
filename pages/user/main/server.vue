<template>
    <div class="user-server-config">
      <el-container>
        <el-header>
            <h1>服务端配置</h1>
        </el-header>
        <el-main>
            <el-divider content-position="left">
                <h2>更新服务端</h2>
                
            </el-divider>
            <p>上传更新包并更新服务端</p>
            <el-row style="margin-bottom: 10px;">
                <el-col :span="24">
                    <el-upload 
                        :auto-upload="false" 
                        v-model="fileList" 
                        action="/api/system/update" 
                        ref="uploadRef" 
                        :headers="headers" 
                        drag
                        :on-exceed="handleExceed"
                        :on-change="handleUploadChange"
                        :limit="1"
                    >
                        <template #trigger>
                            <div class="server-upload">
                                <add class="server-upload-icon"></add>
                                <el-text style="margin: 0;">拖拽 output.tar.gz 至此<br />或单击此处选择文件</el-text>
                            </div>
                        </template>
                    </el-upload>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="24" class="flex-end">
                    <el-button type="primary" @click="submitUpload" :disabled="disabledUploadUpdataBtn">
                            点击上传更新包并更新服务
                    </el-button>
                </el-col>
            </el-row>
        </el-main>
      </el-container>
    </div>
</template>


<script lang="ts" setup>
import type { UploadInstance, UploadRawFile, UploadUserFile } from 'element-plus/es/components/index.mjs';
import useUserStore from '~/hooks/pinia/useUserStore';
import add from '~/components/icons/add.vue';
import { genFileId } from 'element-plus'


const fileList = ref<UploadUserFile[]>([])
const userStore = useUserStore()

const uploadRef = ref<UploadInstance>()

const headers = reactive(
    {
        Authorization: ``
    }
)

const disabledUploadUpdataBtn = computed(() => {
    return fileList.value.length === 0
})

const handleExceed = (files: UploadUserFile[]) => {
  uploadRef.value!.clearFiles()
  const file = files[0] as UploadRawFile
  file.uid = genFileId()
  uploadRef.value!.handleStart(file)
}

const handleUploadChange = (_file: UploadUserFile, files: UploadUserFile[]) => {
    for (let i = files.length - 1; i >= 0; i--) {
        if (files[i].name !== 'output.tar.gz') {
            files.splice(i, 1);
        }
    }
    files.length = Math.max(1, files.length)
    fileList.value = files
}

const submitUpload = () => {
  uploadRef.value!.submit()
}

onMounted(() => {
    // nuxt的create声明周期发生在node环境，没有localstorage
    headers.Authorization = `Bearer ${userStore.token}`
})

</script>

<style lang="scss" scoped>
.user-server-config {
    position: relative;
    padding: 10px 20px;
    .server-upload {
        border-radius: 6px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        transition: all .2s ease;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        &-icon {
            width: 45px;
            color: #595959;
        }
    }
    h1 {
        font-size: xx-large;
    }
    h2 {
        font-size: larger;
    }
    p {
        color: #595959;
    }
}

.flex-end {
    display: flex;
    justify-content: flex-end;
}
</style>