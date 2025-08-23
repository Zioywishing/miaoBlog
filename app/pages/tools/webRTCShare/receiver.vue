<template>
    <div class="min-h-screen flex items-center justify-center p-4 w-full">
        <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
            <h1 class="text-3xl font-bold text-center text-gray-800 mb-6">WebRTC Screen Sharing - Receiver</h1>
            <div v-if="!joined" class="space-y-4">
                <input v-model="inputRoomId" placeholder="Enter Room ID"
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-spring" />
                <input v-model="inputMemberId" placeholder="Enter Sender's Member ID"
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-spring" />
                <input v-model="myMemberId" placeholder="Your Member ID (optional)"
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-spring" />
                <button @click="becomeReceiver" v-if="1 || inputRoomId && inputMemberId"
                    :disabled="!inputRoomId || !inputMemberId"
                    class="cursor-pointer w-full bg-spring-light text-white py-2 px-4 rounded-md hover:bg-spring transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:hover:bg-gray-400">
                    Join as Receiver
                </button>
            </div>

            <div v-else class="space-y-4">
                <p class="text-gray-700"><span class="font-semibold">Room ID:</span> {{ roomId }}</p>
                <p class="text-gray-700"><span class="font-semibold">Your ID:</span> {{ memberId }}</p>
                <p class="text-gray-700"><span class="font-semibold">Role:</span> Receiver</p>

                <div>
                    <div v-show="1 || hasVideo">
                        <video ref="remoteVideo" controls autoplay playsinline class="w-full h-64 bg-black"></video>
                        <!-- <div class="flex justify-start items-center gap-3">
                            <button @click="toggleFullscreen"
                                class="cursor-pointer bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 mt-2">
                                {{ isFullscreen ? 'Exit Fullscreen' : 'Fullscreen' }}
                            </button>
                        </div> -->
                    </div>
                    <!-- <p v-show="!hasVideo" class="text-gray-700">Only Audio</p> -->
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const route = useRoute();
const inputRoomId = ref(route.query.roomid as string ?? "");
const inputMemberId = ref(route.query['sender-memberid'] as string ?? "");
const myMemberId = ref('');
const roomId = ref('');
const memberId = ref('');
const joined = ref(false);
const remoteVideo = ref<HTMLVideoElement | null>(null);
let es: EventSource | null = null;
let heartbeatInterval: NodeJS.Timeout | null = null;
let pc: RTCPeerConnection | null = null;
const hasVideo = ref(false);
const isFullscreen = ref(false);

function becomeReceiver() {
    setupConnection(inputRoomId.value);
}

function setupConnection(targetRoomId: string) {
    memberId.value = myMemberId.value || crypto.randomUUID();
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
            sendSignalingData({ type: 'ready' });
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
    pc.ontrack = (event) => {
        if (event.streams[0]) {
            if (!remoteVideo.value) return;
            const stream = event.streams[0];
            hasVideo.value = stream.getVideoTracks().length > 0;
            if (hasVideo.value) {
                remoteVideo.value.srcObject = stream;
            } else {
                // 尝试只有音频的情况
                remoteVideo.value.srcObject = stream;
            }

            setTimeout(() => {
                fetch('/api/tools/webRTC/broadcast', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        roomid: roomId.value,
                        menberid: memberId.value,
                        data: {
                            close: true,
                        }
                    }),
                });
                stopEs();
            }, 5000);
        }
    };
}

function toggleFullscreen() {
    if (!remoteVideo.value) return;
    if (!document.fullscreenElement) {
        remoteVideo.value.requestFullscreen();
        // 显示判断有问题，临时这样处理
        // isFullscreen.value = true;
    } else {
        document.exitFullscreen();
        isFullscreen.value = false;
    }
}

function sendSignalingData(message: any) {
    const target = inputMemberId.value;
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
    if (data.type === 'offer') {
        await pc?.setRemoteDescription(new RTCSessionDescription(data.sdp));
        const answer = await pc?.createAnswer();
        await pc?.setLocalDescription(answer);
        sendSignalingData({ type: 'answer', sdp: pc?.localDescription });
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