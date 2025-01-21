<template>
    <div class="fuck-sq-wrapper">
        <h1 style="margin-bottom: -5px;">反正是个刷赞的就对了</h1>
        <el-divider></el-divider>
        <main class="fuck-sq-main">
            <el-row style="width: 100%;" :gutter="20">
                <el-col :span="20">
                    <el-input v-model="url">
                        <template #prepend>链接</template>
                    </el-input>
                </el-col>
                <!-- <el-col :span="4">
                    <el-button type="primary" style="width: 100%" @click="handleSelectImage">图片</el-button>
                </el-col> -->
                <el-col :span="4">
                    <el-button type="primary" style="width: 100%" @click="handleOpenScanner">扫码</el-button>
                </el-col>
            </el-row>
            <el-row style="width: 100%;" :gutter="20">
                <el-col :span="13" class="col-flex-end">
                    <el-text size="large" style="margin-right: 7px;">赞数</el-text>
                    <el-input-number style="width: 130px;" v-model="likes" :min="1" :max="300" />
                </el-col>
                <el-col :span="4" class="col-flex-end">
                    <el-button type="primary" style="width: 100%"
                        :disabled="status === 'busy' || id === undefined" @click="handleStart">开始</el-button>
                </el-col>
                <el-col :span="7" class="col-flex-end">
                    <el-button type="primary" style="width: 100%" :disabled="messages.length === 0" @click="handleClear">清空输出</el-button>
                </el-col>
            </el-row>
            <div class="message-container-wrapper">
                <el-scrollbar>
                    <div class="message-container">
                        <el-text v-for="(message) in messages" :key="message.id" class="message-container-message">
                            <span style="margin-right: 7px;">{{ `${_fd(message.timestamp)} ==>`
                                }}</span>
                            <span>{{ message.message }}</span>
                        </el-text>
                    </div>
                </el-scrollbar>
            </div>
        </main>
        <div class="qr-scanner" v-if="displayQRScanner" @click="displayQRScanner = false">
            <miaoQRScanner class="qr-scanner-scanner" @on-result="handleScannerRes" @click.stop></miaoQRScanner>
        </div>
    </div>
</template>

<script setup lang="ts">

const router = useRouter()

const url = ref('')
const likes = ref(10)
const status = ref<'waiting' | 'busy'>('waiting')

const displayQRScanner = ref(false)

const messages = reactive<{
    timestamp: number,
    message: string,
    id: number
}[]>([])

const log = (...message: string[]) => {
    messages.unshift({
        timestamp: Date.now(),
        message: message.join(''),
        id: Math.random()
    })
}

const matchId = (url: string) => {
    const idMatch0 = url.match(/id%3D(\d+)/);
    const idMatch1 = url.match(/id=(\d+)/);
    return idMatch0? idMatch0[1] : idMatch1? idMatch1[1] : undefined
}

const id = computed(() => {
    return matchId(url.value)
})

const _fd = (
    date: number,
) => formatDate(date, 'yyyy-MM-dd   HH:mm:ss')

const handleStart = () => {
    log('开始刷赞，尝试建立与服务器的连接')
    status.value = 'busy'
    const sse = new EventSource(`/api/tools/shiqu/like?id=${id.value}&likes=${likes.value}`);
    sse.onopen = function (event) {
        log('建立与服务器的连接')
    };
    sse.onmessage = function (event) {
        const data = JSON.parse(event.data.split('data: ')[1])
        if(data.likeCountBefore || data.likeCountAfter) {
            log(`当前赞数: ${data?.likeCountBefore ?? data?.likeCountAfter}`)
        } else if(data.process) {
            log(`已点赞 ${data.process} 次，已完成 ${data.percent}%`)
        }
        if(data.likeCountAfter) {
            sse.close()
            log('任务完成')
            status.value = 'waiting'
        }
        // console.log(event.data)
        // log('Received message:', event.data);
    };
    sse.onerror = function (event) {
        log('Error occurred:');
        console.error(event)
        sse.close()
    };
}

const handleClear = () => {
    messages.splice(0, messages.length)
}

const handleOpenScanner = () => {
    // router.push('/tools/QRScanner')
    displayQRScanner.value = true
}

const handleScannerRes = (res: string) => {
    const id = matchId(res)
    if(id) {
        url.value = res
    }
    displayQRScanner.value = false
}

const handleSelectImage = () => {

}

watchEffect(() => {
    if (id.value) {
        log(`识别到id: ${id.value}`)
    } else {
        log(`未识别到id`)
    }
})

</script>

<style lang="scss" scoped>
.fuck-sq-wrapper {
    width: 95%;
    height: 100%;
    max-width: 800px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px;
}

.fuck-sq-main {
    width: 100%;
    height: 100%;
    max-width: 800px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
}

.col-flex-end {
    display: flex;
    justify-content: flex-end;
}

.message-container-wrapper {
    width: calc(100% - 20px);
    /* flex: 1; */
    box-sizing: border-box;
    /* padding: 5px 10px; */
    border: 1px solid #ccc;
    border-radius: 5px;
    /* max-height: 500px; */
}

.message-container {
    width: 100%;
    max-width: 800px;
    height: calc( 100vh - 350px );
    max-height: calc( 100vh - 350px );
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    padding: 10px 0 ;
}

.message-container-message  {
    width: 95%;
    margin: 0 10px;
}

.qr-scanner {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    &-scanner {
        width: 80%;
        height: 80%;
        object-fit: contain;
    }
}
</style>