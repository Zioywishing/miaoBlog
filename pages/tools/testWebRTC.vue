<template>
    <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4 w-full">
        <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
            <h1 class="text-3xl font-bold text-center text-gray-800 mb-6">WebRTC Screen Sharing</h1>

            <div v-if="!joined" class="space-y-4">
                <input v-model="inputRoomId" placeholder="Enter Room ID (for receiver)"
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input v-model="inputMemberId" placeholder="Enter Sender's Member ID (for receiver)"
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input v-model="myMemberId" placeholder="Your Member ID (optional)"
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <div class="flex space-x-4">
                    <button @click="becomeSender"
                        class="cursor-pointer flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">
                        Become Sender
                    </button>
                    <button @click="becomeReceiver" v-if="inputRoomId && inputMemberId"
                        class="cursor-pointer flex-1 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600">
                        Join as Receiver
                    </button>
                </div>
            </div>

            <div v-else class="space-y-4">
                <p class="text-gray-700"><span class="font-semibold">Room ID:</span> {{ roomId }}</p>
                <p class="text-gray-700"><span class="font-semibold">Your ID:</span> {{ memberId }}</p>
                <p class="text-gray-700"><span class="font-semibold">Role:</span> {{ isSender ? 'Sender' : 'Receiver' }}
                </p>

                <div v-if="!isSender">
                    <div v-show="1 || hasVideo">
                        <video ref="remoteVideo" autoplay playsinline class="w-full h-64 bg-black"></video>
                        <button @click="toggleFullscreen" class="cursor-pointer bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 mt-2">
                            {{ isFullscreen ? 'Exit Fullscreen' : 'Fullscreen' }}
                        </button>
                    </div>
                    <p v-show="!hasVideo" class="text-gray-700">Only Audio</p>
                </div>
                <video v-if="isSender" ref="localVideo" autoplay playsinline muted class="w-full h-64 bg-black"></video>

                <div v-if="isSender && joined">
                    <label class="flex items-center space-x-2">
                        <input type="checkbox" v-model="onlyAudio" />
                        <span>只共享音频</span>
                    </label>
                    <button v-if="!isSharing" @click="startSharing"
                        class="cursor-pointer bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600">
                        Start Sharing
                    </button>
                    <button v-else @click="stopSharing"
                        class="cursor-pointer bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600">
                        Stop Sharing
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

const inputRoomId = ref('');
const inputMemberId = ref('');
const myMemberId = ref('');
const roomId = ref('');
const memberId = ref('');
const joined = ref(false);
const isSender = ref(false);
const localVideo = ref<HTMLVideoElement | null>(null);
const remoteVideo = ref<HTMLVideoElement | null>(null);
const receiverId = ref('');
let es: EventSource | null = null;
let heartbeatInterval: NodeJS.Timeout | null = null;
let pc: RTCPeerConnection | null = null;
let localStream: MediaStream | null = null;
const onlyAudio = ref(false);
const isSharing = ref(false);
const hasVideo = ref(false);
const isFullscreen = ref(false);

function becomeSender() {
    isSender.value = true;
    setupConnection(inputRoomId.value);
}

function becomeReceiver() {
    isSender.value = false;
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
        if (data.roomid && data.menberid) {
            roomId.value = data.roomid;
            memberId.value = data.menberid;
            joined.value = true;
            startHeartbeat();
            initPeerConnection();
            if (!isSender.value) {
                sendSignalingData({ type: 'ready' });
            }
        } else {
            handleSignalingData(data);
        }
    };

    es.onerror = (error) => {
        console.error('SSE Error:', error);
        cleanup();
    };
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
            if(!remoteVideo.value) return;
            const stream = event.streams[0];
            hasVideo.value = stream.getVideoTracks().length > 0;
            if (hasVideo.value) {
                remoteVideo.value.srcObject = stream;
            } else {
                // 尝试只有音频的情况
                remoteVideo.value.srcObject = stream;
            }
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
            localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } else {
            localStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
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
    // Optionally reset peer connection if needed
    isSharing.value = false;
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
    const target = isSender.value ? receiverId.value : inputMemberId.value;
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
    if (data.type === 'ready' && isSender.value) {
        receiverId.value = data.from;
        if (localStream) {
            await createOffer();
        }
        return;
    }
    if (data.type === 'offer' && !isSender.value) {
        await pc?.setRemoteDescription(new RTCSessionDescription(data.sdp));
        const answer = await pc?.createAnswer();
        await pc?.setLocalDescription(answer);
        sendSignalingData({ type: 'answer', sdp: pc?.localDescription });
    } else if (data.type === 'answer' && isSender.value) {
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

function cleanup() {
    if (es) es.close();
    if (heartbeatInterval) clearInterval(heartbeatInterval);
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