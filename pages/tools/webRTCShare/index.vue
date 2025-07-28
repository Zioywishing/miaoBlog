<template>
    <div class="min-h-screen flex items-center justify-center p-4 w-full">
        <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
            <h1 class="text-3xl font-bold text-center text-gray-800 mb-6">WebRTC Screen Sharing</h1>
            <div class="space-y-4">
                <p class="text-gray-600 text-center mb-6">Choose your role to start screen sharing</p>
                <div class="flex flex-col space-y-4">
                    <NuxtLink to="/tools/webRTCShare/sender"
                        class="cursor-pointer w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 text-center transition-colors">
                        Start as Sender
                    </NuxtLink>
                    <NuxtLink to="/tools/webRTCShare/receiver"
                        class="cursor-pointer w-full bg-green-500 text-white py-3 px-4 rounded-md hover:bg-green-600 text-center transition-colors">
                        Join as Receiver
                    </NuxtLink>
                </div>
                <div class="mt-6 text-sm text-gray-500">
                    <p class="mb-2"><strong>Sender:</strong> Share your screen or audio with others</p>
                    <p><strong>Receiver:</strong> View screen or listen to audio shared by a sender</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
// 导航页面，无需额外逻辑
</script>