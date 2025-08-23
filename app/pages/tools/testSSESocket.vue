<template>
    <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4 w-full">
        <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
            <h1 class="text-3xl font-bold text-center text-gray-800 mb-6">Simple Chat Room</h1>

            <div v-if="!joined" class="space-y-4">
                <input v-model="inputRoomId" placeholder="Enter Room ID (optional)"
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input v-model="inputMenberId" placeholder="Enter Your ID (optional)"
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <div class="flex space-x-4">
                    <button @click="createRoom" v-if="!inputRoomId"
                        class="cursor-pointer flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                        Create New Room
                    </button>
                    <button @click="joinRoom" v-if="inputRoomId"
                        class="cursor-pointer flex-1 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                        Join Room
                    </button>
                </div>
            </div>

            <div v-else class="space-y-4">
                <p class="text-gray-700"><span class="font-semibold">Room ID:</span> {{ roomId }}</p>
                <p class="text-gray-700"><span class="font-semibold">Your ID:</span> {{ menberId }}</p>

                <div class="bg-gray-50 p-4 rounded-md h-64 overflow-y-auto border border-gray-200">
                    <div v-for="(msg, index) in messages" :key="index" class="mb-2">
                        <div class="flex flex-col">
                            <strong class="text-spring">{{ msg.from }}:</strong>
                            <div class="bg-white p-2 rounded-md relative shadow-md">
                                <span class="text-gray-800">{{ msg.text }}</span>
                                <span class="text-gray-500 text-xs absolute right-0" style="bottom: -1.5em;">{{ msg.timestamp }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex space-x-2">
                    <input v-model="newMessage" placeholder="Type a message"
                        class="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        @keyup.enter="sendMessage" />
                    <button @click="sendMessage"
                        class="cursor-pointer bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
                        Send
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

const inputRoomId = ref('');
const inputMenberId = ref('');
const roomId = ref('');
const menberId = ref('');
const joined = ref(false);
const messages = ref<{ from: string; text: string; timestamp: string }[]>([]);
const newMessage = ref('');
let es: EventSource | null = null;
let heartbeatInterval: NodeJS.Timeout | null = null;

function createRoom() {
    setupConnection('');
}

function joinRoom() {
    setupConnection(inputRoomId.value);
}

function setupConnection(targetRoomId: string) {
    menberId.value = inputMenberId.value || crypto.randomUUID();
    const url = `/api/tools/webRTC/join?menberid=${menberId.value}${targetRoomId ? `&roomid=${targetRoomId}` : ''}`;
    es = new EventSource(url);

    es.onmessage = (event) => {
        const rawData = event.data;
        const parsedData = rawData.split('data: ')[1];
        const data = JSON.parse(parsedData);
        if (data.roomid && data.menberid) {
            roomId.value = data.roomid;
            menberId.value = data.menberid;
            joined.value = true;
            startHeartbeat();
        } else {
            messages.value.push({ from: data.from, text: data.text, timestamp: formatDate(data.timestamp as number, `yyyy-MM-dd HH:mm:ss`) });
        }
    };

    es.onerror = (error) => {
        console.error('SSE Error:', error);
        cleanup();
    };
}

function sendMessage() {
    if (!newMessage.value) return;
    fetch('/api/tools/webRTC/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            roomid: roomId.value, menberid: menberId.value, data: {
                from: menberId.value,
                text: newMessage.value,
                timestamp: Date.now(),
            }
        }),
    });
    newMessage.value = '';
}

function startHeartbeat() {
    heartbeatInterval = setInterval(() => {
        fetch('/api/tools/webRTC/heartbeat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomid: roomId.value, menberid: menberId.value }),
        });
    }, 30000); // 每30秒心跳
}

function cleanup() {
    if (es) es.close();
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    joined.value = false;
}

onUnmounted(() => {
    if (joined.value) {
        fetch('/api/tools/webRTC/exit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomid: roomId.value, menberid: menberId.value }),
        });
    }
    cleanup();
});
</script>
