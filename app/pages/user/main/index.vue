<template>
    <div class="p-6">
        <div class="bg-white rounded-lg shadow-md p-6">
            <h1 class="text-2xl font-bold mb-6 text-gray-800">系统信息</h1>
            
            <miaoLoading v-if="isLoading" :customHeight="true" :height="160" />
            
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
                            <span class="font-medium">{{ systemStatus?.system?.platform }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">版本:</span>
                            <span class="font-medium">{{ systemStatus?.system?.release }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">主机名:</span>
                            <span class="font-medium">{{ systemStatus?.system?.hostname }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Node.js版本:</span>
                            <span class="font-medium">{{ systemStatus?.node }}</span>
                        </div>
                    </div>
                </div>
                
                <!-- 硬件信息 -->
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h2 class="text-lg font-semibold mb-3 text-gray-700">硬件信息</h2>
                    <div class="space-y-2">
                        <div class="flex justify-between">
                            <span class="text-gray-600">CPU型号:</span>
                            <span class="font-medium">{{ systemStatus?.hardware?.cpu?.model }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">CPU核心数:</span>
                            <span class="font-medium">{{ systemStatus?.hardware?.cpu?.cores }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">CPU使用率:</span>
                            <div class="w-32 bg-gray-200 rounded-full h-4 overflow-hidden">
                                <div class="bg-blue-600 h-4 rounded-full" :style="`width: ${systemStatus?.performance?.cpu?.usage < 5 ? 5 : systemStatus?.performance?.cpu?.usage}%`"></div>
                            </div>
                            <span class="font-medium">{{ systemStatus?.performance?.cpu?.usage }}%</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">内存使用情况:</span>
                            <span class="font-medium">{{ systemStatus?.performance?.memory?.used }} / {{ systemStatus?.performance?.memory?.total }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">内存使用率:</span>
                            <div class="w-32 bg-gray-200 rounded-full h-4 overflow-hidden">
                                <div class="bg-green-600 h-4 rounded-full" :style="`width: ${systemStatus?.performance?.memory?.percent}%`"></div>
                            </div>
                            <span class="font-medium">{{ systemStatus?.performance?.memory?.percent }}%</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="mt-4 text-gray-500 text-sm flex justify-center">
                <div>数据更新时间: {{ lastUpdated }}</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import useUserStore from '~/stores/useUserStore';
const systemStatus = ref<any>(null);
const isLoading = ref(true);
const error = ref('');
const lastUpdated = ref('');

// 格式化时间
const formatTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
};

// 定义API响应类型
interface SystemStatusResponse {
    success: boolean;
    data?: {
        system: {
            platform: string;
            release: string;
            hostname: string;
        };
        node: string;
        hardware: {
            cpu: {
                model: string;
                cores: number;
                usage: number;
            };
            memory: {
                total: string;
                free: string;
                used: string;
                percent: number;
            };
        };
        performance: {
            cpu: {
                usage: number;
            };
            memory: {
                total: string;
                free: string;
                used: string;
                percent: number;
            };
        };
    };
    message?: string;
}

// 获取系统状态信息
const fetchSystemStatus = async () => {
    try {
        isLoading.value = true;
        error.value = '';
        
        const response = await $fetch<SystemStatusResponse>('/api/system/status', {
            headers: {
                'Authorization': `Bearer ${useUserStore().token}`
            }
        });
        
        if (response && response.success && response.data) {
            systemStatus.value = response.data;
            lastUpdated.value = formatTime();
        } else {
            error.value = response?.message || '获取系统信息失败';
        }
    } catch (err) {
        error.value = '请求发生错误';
        console.error('Error fetching system status:', err);
    } finally {
        isLoading.value = false;
    }
};

// 首次获取数据
onMounted(() => {
    // 获取系统状态信息
    fetchSystemStatus();
    
    // 设置60秒定时更新系统状态信息（与缓存时间一致）
    const statusTimer = setInterval(() => {
        fetchSystemStatus();
    }, 60000);
    
    // 组件卸载时清除定时器
    onUnmounted(() => {
        clearInterval(statusTimer);
    });
});
</script>

<style scoped></style>