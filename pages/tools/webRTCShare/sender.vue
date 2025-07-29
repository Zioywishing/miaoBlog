<template>
    <div class="min-h-screen flex items-center justify-center p-4 w-full">
        <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
            <div class="flex items-center justify-center mb-6">
                <h1 class="text-3xl font-bold text-center text-gray-800">WebRTC Screen Sharing - Sender</h1>
                <div v-if="joined" class="relative ml-3">
                    <div class="cursor-pointer text-gray-600 hover:text-gray-800 transition-colors" title="点击复制链接"
                        @mouseenter="showTooltip = true" @mouseleave="showTooltip = false" @click="handleCopyShareUrl">
                        <IconsQrcode class="w-6 h-6" />
                    </div>
                    <!-- <div v-if="showTooltip" 
                         class="absolute top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-2 px-3 whitespace-nowrap z-10">
                        {{ shareUrl }}
                        <div class="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                    </div>
                    
                    <div v-if="showTooltip" 
                         class="absolute bottom-8 right-1/2 transform translate-x-1/2 bg-gray-800 text-white text-xs rounded py-2 px-3 whitespace-nowrap z-10">
                        点击复制链接
                        <div class="absolute -bottom-1 right-1/2 transform translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                    </div> -->
                </div>
            </div>
            <div v-if="!joined" class="space-y-4">
                <input v-model="roomId" placeholder="Your Room ID (optional)"
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-spring" />
                <input v-model="memberId" placeholder="Your Member ID (optional)"
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-spring" />
                <button @click="becomeSender"
                    class="cursor-pointer w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">
                    Start as Sender
                </button>
            </div>

            <div v-else class="space-y-4">
                <p class="text-gray-700"><span class="font-semibold">Room ID:</span> {{ roomId }}</p>
                <p class="text-gray-700"><span class="font-semibold">Your ID:</span> {{ memberId }}</p>
                <p class="text-gray-700"><span class="font-semibold">Role:</span> Sender</p>

                <video ref="localVideo" autoplay playsinline muted class="w-full h-64 bg-black"></video>

                <div class="space-y-4">
                    <!-- <label class="flex items-center space-x-2">
                        <input type="checkbox" v-model="onlyAudio" />
                        <span>Only Audio</span>
                    </label> -->
                    <button v-if="!isSharing" @click="startSharing"
                        class="cursor-pointer w-full bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600">
                        Start Sharing
                    </button>
                    <button v-else @click="stopSharing"
                        class="cursor-pointer w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600">
                        Stop Sharing
                    </button>
                </div>
            </div>
        </div>
        <transition name="fade">
            <miaoQRCode v-if="showTooltip"
                class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-md shadow-md"
                :data="shareUrl" v-model:qrcode-img-data="qrcodeDataCache" :height="300" :width="300" />
        </transition>
    </div>
</template>

<script setup lang="ts">
import { throttle } from 'lodash-es';

const roomId = ref('');
const memberId = ref('');
const joined = ref(false);
const localVideo = ref<HTMLVideoElement | null>(null);
const receiverId = ref('');
let es: EventSource | null = null;
let heartbeatInterval: NodeJS.Timeout | null = null;
let pc: RTCPeerConnection | null = null;
let localStream: MediaStream | null = null;
const onlyAudio = ref(false);
const isSharing = ref(false);
const showTooltip = ref(false);

const qrcodeDataCache = ref<ImageData>();

const shareUrl = computed(() => {
    if (!joined.value || !roomId.value || !memberId.value) return '';
    const baseUrl = window.location.origin;
    return `${baseUrl}/tools/webRTCShare/receiver?roomid=${roomId.value}&sender-memberid=${memberId.value}`;
});

// 使用lodash的防抖包装复制链接功能,延迟300ms执行
const handleCopyShareUrl = throttle(async () => {
    const success = await copyToClipboard(shareUrl.value);
    if (success) {
        ElMessage.success('复制成功');
    } else {
        ElMessage.error('复制失败');
    }
}, 300);

function becomeSender() {
    setupConnection(roomId.value);
}

function setupConnection(targetRoomId: string) {
    memberId.value = memberId.value || crypto.randomUUID();
    const url = `/api/tools/webRTC/join?menberid=${memberId.value}${targetRoomId ? `&roomid=${targetRoomId}` : ''}`;
    es = new EventSource(url);

    es.onmessage = (event) => {
        const rawData = event.data;
        const parsedData = rawData.split('data: ')[1];
        const data = JSON.parse(parsedData);
        if (data.close) {
            stopEs();
            return;
        }
        if (data.roomid && data.menberid) {
            roomId.value = data.roomid;
            memberId.value = data.menberid;
            joined.value = true;
            initPeerConnection();
        } else {
            handleSignalingData(data);
        }
    };

    es.onerror = (error) => {
        console.error('SSE Error:', error);
        stopEs()
    };

    startHeartbeat();
}

function initPeerConnection() {
    pc = new RTCPeerConnection();
    pc.onicecandidate = (event) => {
        if (event.candidate) {
            sendSignalingData({ type: 'candidate', candidate: event.candidate });
        }
    };
}

async function createOffer() {
    if (!pc) return;
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    sendSignalingData({ type: 'offer', sdp: pc.localDescription });
}

async function startSharing() {
    try {
        if (onlyAudio.value) {
            localStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
        } else {
            localStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
        }
        if (localVideo.value) {
            localVideo.value.srcObject = localStream;
        }
        localStream.getTracks().forEach(track => pc?.addTrack(track, localStream!));
        if (receiverId.value) {
            await createOffer();
        }
        isSharing.value = true;
    } catch (error) {
        console.error('Error starting sharing:', error);
    }
}

function stopSharing() {
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }
    if (localVideo.value) {
        localVideo.value.srcObject = null;
    }
    isSharing.value = false;
}

function sendSignalingData(message: any) {
    const target = receiverId.value;
    if (!target && message.type !== 'ready') return;
    fetch('/api/tools/webRTC/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            roomid: roomId.value,
            menberid: memberId.value,
            data: { ...message, from: memberId.value, target }
        }),
    });
}

async function handleSignalingData(data: any) {
    if (data.target && data.target !== memberId.value) return;
    if (data.from === memberId.value) return;
    if (data.type === 'ready') {
        receiverId.value = data.from;
        if (localStream) {
            await createOffer();
        }
        return;
    }
    if (data.type === 'answer') {
        await pc?.setRemoteDescription(new RTCSessionDescription(data.sdp));
    } else if (data.type === 'candidate') {
        await pc?.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
}

function startHeartbeat() {
    heartbeatInterval = setInterval(() => {
        fetch('/api/tools/webRTC/heartbeat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomid: roomId.value, menberid: memberId.value }),
        });
    }, 30000);
}

function stopEs() {
    console.log('stopEs');
    if (es) {
        es.close();
        es = null;
    }
    if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
    }
}

function cleanup() {
    stopEs();
    if (pc) pc.close();
    if (localStream) localStream.getTracks().forEach(track => track.stop());
    joined.value = false;
}

onUnmounted(() => {
    if (joined.value) {
        fetch('/api/tools/webRTC/exit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomid: roomId.value, menberid: memberId.value }),
        });
    }
    cleanup();
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: all 0.1s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: scale(0.8);
}
</style>