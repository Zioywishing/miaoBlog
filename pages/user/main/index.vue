<template>
    <div class="p-6">
        <div class="bg-white rounded-lg shadow-md p-6">
            <h1 class="text-2xl font-bold mb-6 text-gray-800">系统信息</h1>
            
            <div v-if="isLoading" class="flex justify-center items-center h-40">
                <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
            
            <div v-else-if="error" class="text-red-500 text-center">
                {{ error }}
            </div>
            
            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- 系统信息 -->
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h2 class="text-lg font-semibold mb-3 text-gray-700">操作系统</h2>
                    <div class="space-y-2">
                        <div class="flex justify-between">
                            <span class="text-gray-600">平台:</span>
                            <span class="font-medium">{{ systemInfo?.system?.platform }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">版本:</span>
                            <span class="font-medium">{{ systemInfo?.system?.release }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">主机名:</span>
                            <span class="font-medium">{{ systemInfo?.system?.hostname }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Node.js版本:</span>
                            <span class="font-medium">{{ systemInfo?.node }}</span>
                        </div>
                    </div>
                </div>
                
                <!-- 硬件信息 -->
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h2 class="text-lg font-semibold mb-3 text-gray-700">硬件信息</h2>
                    <div class="space-y-2">
                        <div class="flex justify-between">
                            <span class="text-gray-600">CPU型号:</span>
                            <span class="font-medium">{{ systemInfo?.hardware?.cpu?.model }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">CPU核心数:</span>
                            <span class="font-medium">{{ systemInfo?.hardware?.cpu?.cores }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">CPU使用率:</span>
                            <div class="w-32 bg-gray-200 rounded-full h-4 overflow-hidden">
                                <div class="bg-blue-600 h-4 rounded-full" :style="`width: ${performanceData?.cpu?.usage < 5 ? 5 : performanceData?.cpu?.usage}%`"></div>
                            </div>
                            <span class="font-medium">{{ performanceData?.cpu?.usage }}%</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">内存使用情况:</span>
                            <span class="font-medium">{{ performanceData?.memory?.used || systemInfo?.hardware?.memory?.used }} / {{ performanceData?.memory?.total || systemInfo?.hardware?.memory?.total }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">内存使用率:</span>
                            <div class="w-32 bg-gray-200 rounded-full h-4 overflow-hidden">
                                <div class="bg-green-600 h-4 rounded-full" :style="`width: ${performanceData?.memory?.percent}%`"></div>
                            </div>
                            <span class="font-medium">{{ performanceData?.memory?.percent }}%</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="mt-4 text-gray-500 text-sm flex justify-between">
                <div>性能数据更新时间: {{ performanceUpdated }}</div>
                <div>系统数据更新时间: {{ lastUpdated }}</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const systemInfo = ref<any>(null);
const performanceData = ref<any>(null);
const isLoading = ref(true);
const error = ref('');
const lastUpdated = ref('');
const performanceUpdated = ref('');

// 格式化时间
const formatTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
};

// 获取系统信息
const fetchSystemInfo = async () => {
    try {
        if (!systemInfo.value) {
            isLoading.value = true;
        }
        error.value = '';
        
        const { data } = await useFetch('/api/system/info');
        const response = data.value as any;
        
        if (response && response.success) {
            systemInfo.value = response.data;
            
            // 如果还没有性能数据，初始化它
            if (!performanceData.value) {
                performanceData.value = {
                    cpu: {
                        usage: response.data.hardware.cpu.usage
                    },
                    memory: response.data.hardware.memory
                };
            }
            
            lastUpdated.value = formatTime();
        } else {
            error.value = response?.message || '获取系统信息失败';
        }
    } catch (err) {
        error.value = '请求发生错误';
        console.error('Error fetching system info:', err);
    } finally {
        isLoading.value = false;
    }
};

// 获取性能数据（CPU和内存使用率）
const fetchPerformanceData = async () => {
    try {
        const { data } = await useFetch('/api/system/performance');
        const response = data.value as any;
        
        if (response && response.success) {
            performanceData.value = response.data;
            performanceUpdated.value = formatTime();
        }
    } catch (err) {
        console.error('Error fetching performance data:', err);
    }
};

// 首次获取数据
onMounted(() => {
    // 获取完整系统信息
    fetchSystemInfo();
    
    // 设置30秒定时更新系统信息
    const systemTimer = setInterval(() => {
        fetchSystemInfo();
    }, 30000);
    
    // 立即获取一次性能数据
    fetchPerformanceData();
    
    // 设置5秒定时更新性能数据
    const performanceTimer = setInterval(() => {
        fetchPerformanceData();
    }, 5000);
    
    // 组件卸载时清除定时器
    onUnmounted(() => {
        clearInterval(systemTimer);
        clearInterval(performanceTimer);
    });
});
</script>

<style scoped></style>