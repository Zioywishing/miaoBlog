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
                <el-row style="margin: 10px 0">
                    <el-col :span="24">
                        <el-text style="color: #595959;">
                            首选方案：从Github获取更新包。
                        </el-text>
                    </el-col>
                </el-row>
                <el-row style="margin: 10px 0">
                    <el-col :span="17">
                        <el-input v-model="githubRepoUrl" placeholder="输入Github API地址">
                            <!-- <template #prepend>API</template> -->
                        </el-input>
                    </el-col>
                    <el-col :span="1">
                    </el-col>
                    <el-col :span="6" class="flex-end">
                        <el-button type="primary" @click="handleUpdateFromGithub">
                            获取更新
                        </el-button>
                    </el-col>
                </el-row>
                <el-row style="margin: 10px 0" v-if="updateLog">
                    <el-col :span="24">
                        <el-text style="color: #595959;">
                            更新进度：
                        </el-text>
                        <el-text :type="updateLog.type">{{ updateLog.text }}</el-text>
                    </el-col>
                </el-row>
                <el-row style="margin: 10px 0">
                    <el-col :span="24">
                        <el-text style="color: #595959;">
                            备选方案：上传更新包:*.tar.gz文件，上传后会自动解压并更新服务端。
                        </el-text>
                    </el-col>
                </el-row>
                <el-row style="margin: 10px 0">
                    <el-col :span="24">
                        <el-upload :auto-upload="false" v-model="fileList" action="/api/system/update" ref="uploadRef"
                            :headers="headers" drag :on-exceed="handleExceed" :on-change="handleUploadChange"
                            :limit="1">
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
import useUserStore from '~/stores/useUserStore';
import add from '~/components/icons/add.vue';
import { genFileId } from 'element-plus'
import useFetch from '~/composables/useMiaoFetch';


const fileList = ref<UploadUserFile[]>([])
const userStore = useUserStore()

const uploadRef = ref<UploadInstance>()

const githubRepoUrl = ref('https://api.github.com/repos/Zioywishing/miaoBlog/releases/latest')

const updateLog = ref<{
    type: "info" | "success" | "warning" | "primary" | "danger",
    text: string
}>()

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
        if (!files[i]!.name.endsWith('.tar.gz')) {
            files.splice(i, 1);
        }
    }
    files.length = Math.max(1, files.length)
    fileList.value = files
}

const submitUpload = () => {
    uploadRef.value!.submit()
}

const handleUpdateFromGithub = async () => {
    const getReleaseVer = (info: any) => {
        return info.tag_name
    }
    try {
        updateLog.value = {
            type: "primary",
            text: '已向服务器发送更新请求。'
        }
        const res = await useFetch().system.updateFromGithub(githubRepoUrl.value)
        if (res.status === 200) {
            const releaseVer = getReleaseVer((res as any).releaseInfo)
            updateLog.value = {
                type: 'success',
                text: `更新包已下载完成，即将执行更新。（版本号：${releaseVer}）`
            }
        } else {
            const releaseVer = getReleaseVer((res as any).releaseInfo)
            updateLog.value = {
                type: 'danger',
                text: `更新出错。${releaseVer ? `（版本号：${releaseVer}）` : '版本号获取失败'}`
            }
        }
    } catch (error) {
        updateLog.value = {
            type: 'danger',
            text: '更新出错。'
        }
    }
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
    max-width: 800px;
    margin: 0px auto;

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