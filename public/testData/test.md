# getUserMedia (获取设备音视频输入)

navigator.mediaDevices.getUserMedia(constraints?: MediaStreamConstraints)

获取用户设备上的输入，比如摄像头，麦克风，返回一个 mediaStream 对象
注意需要通过用户主动操作（如 click）唤起才行，否则会报错。

```ts
const getUserMedia = async (constraints?: MediaStreamConstraints) => {
  if (!navigator.mediaDevices.getUserMedia) {
    console.log('getUserMedia not supported');
    return;
  }
  mediaStream.value = await navigator.mediaDevices.getUserMedia(constraints);

  console.log(mediaStream.value, videoRef.value)

  const track = mediaStream.value.getVideoTracks()[0];

  console.log(track, track.getSettings())
  videoRef.value && (videoRef.value.srcObject = mediaStream.value)
  videoRef.value && (videoRef.value.play())
}
```

# getDisplayMedia (获取屏幕音视频输入)

navigator.mediaDevices.getDisplayMedia(constraints?: MediaStreamConstraints)

获取用户屏幕上的音视频，返回一个 mediaStream 对象
注意需要通过用户主动操作（如 click）唤起才行，否则会报错。

```ts
const getDesktopStream = async () => {
  if (!navigator.mediaDevices.getDisplayMedia) {
    console.log('getDisplayMedia not supported');
    return;
  }
  mediaStream.value = await navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio: true,
  });
  console.log(mediaStream.value, videoRef.value)
  videoRef.value && (videoRef.value.srcObject = mediaStream.value)
  videoRef.value && (videoRef.value.play())
}
```

# mediaStream

mediaStream 主要表示一系列的音视频轨道

常用：

```ts
mediaStream.addTrack(track);
const tracks = mediaStream.getTracks();
const videoTrack = mediaStream.getVideoTracks()[0];
const audioTrack = mediaStream.getAudioTracks()[0];
```

# mediaStreamTrack

mediaStreamTrack 表示一个音视频轨道
常用属性：

```ts
mediaStreamTrack.id;// 轨道的唯一标识符
mediaStreamTrack.kind;// 轨道的类型，如 video、audio、text 等
mediaStreamTrack.label;// 轨道的标签, 如摄像头名称
mediaStreamTrack.enabled;// 轨道是否可用, false表示不可用, 可能是黑屏等
mediaStreamTrack.muted;// 轨道是否静音

mediaStreamTrack.getSettings();// 获取轨道的设置, 如分辨率、帧率、比特率等
mediaStreamTrack.getConstraints();// 获取轨道的约束，可能是由用户设置的
```

# mediaNegotiate 媒体协商

媒体协商用来交换双端的信息，如可接受的音视频编码等。通过信令服务器交换 sdp 信息。

sdp = Session Description Protocol，webRTC 中分为会话描述和媒体描述

具体流程如下：

1. 客户端 A 通过 getUserMedia 获取音视频输入
2. 客户端 A 通过 createOffer 创建一个 offer
3. 客户端 A 通过 setLocalDescription 设置本地描述
4. 客户端 A 通过 signalingChannel 发送 offer 给客户端 B
5. 客户端 B 通过 setRemoteDescription 设置远程描述
6. 客户端 B 通过 createAnswer 创建一个 answer
7. 客户端 B 通过 setLocalDescription 设置本地描述
8. 客户端 B 通过 signalingChannel 发送 answer 给客户端 A
9. 客户端 A 通过 setRemoteDescription 设置远程描述
10. 客户端 A 和客户端 B 可以开始通话了

代码实现如下：

```ts

// 设置ICE候选，在媒体协商之前
const configuration = {
    iceServers: [
        {
            urls: 'stun:stun.example.com:3478'
        },
        {
            urls: 'turn:turn.example.com:3478',
            username: 'your_username',
            credential: 'your_password'
        }
    ]
};
// 假设已经有一个信令服务器
const signalingChannel = {...};

const mediaNegotiateA = async () => {
  const peerConnection = new RTCPeerConnection(configuration);
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });
  stream.getTracks().forEach(track => {
    peerConnection.addTrack(track, stream);
  });
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  console.log('offer', offer);
  // 发送offer给B
  signalingChannel.send(JSON.stringify(offer));
  // 接收B的answer
  const answer = await signalingChannel.receive();
  console.log('answer', answer);
  await peerConnection.setRemoteDescription(answer);
}

const mediaNegotiateB = async () => {
  const peerConnection = new RTCPeerConnection(configuration);
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });
  stream.getTracks().forEach(track => {
    peerConnection.addTrack(track, stream);
  });
  const offer = await signalingChannel.receive();
  console.log('offer', offer);
  await peerConnection.setRemoteDescription(offer);
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  console.log('answer', answer);
  // 发送answer给A
  signalingChannel.send(JSON.stringify(answer));
}
```

信令服务器只需要负责中继传递 offer 和 answer 即可。
可以使用如 ws 的方式自行实现。

# webRTC 网络穿越

## ICE

交互式连接创建（Interactive Connectivity Establishment，ICE）是一个允许你的浏览器和对端浏览器建立连接的协议框架。在实际的网络当中，有很多原因能导致简单的从 A 端到 B 端直连不能如愿完成。这需要绕过阻止建立连接的防火墙，给你的设备分配一个唯一可见的地址（通常情况下我们的大部分设备没有一个固定的公网地址），如果路由器不允许主机直连，还得通过一台服务器转发数据。

ICE中有控制方（发送offer的）和被控制方，最终地址选择由控制方决定。

具体工作流程如下：
1. 收集候选地址

    1. 主机网卡实际地址host
    2. 服务器反射候选者srflx（STUN返回的binding success response中的地址，即最外层NAT地址）
    3. 中继候选者relay（TURN服务器的地址）
    4. 对端反射候选者prflx（对端STUN返回的binding success response中的地址，无法主动获取）


2. 交换候选项
3. 开始连通性检测（一方发送binding request，一方返回binding response）
4. 选择地址从host到srflx/prflx到relay

## NAT 穿透

    NAT类型：
    完全圆锥型：外部主机可以通过映射后的公网 IP 地址和端口号，主动向内部主机发送数据包。
    一旦内部主机的某个私有 IP 地址和端口号被映射到一个公网 IP 地址和端口号，任何外部主机都可以使用这个公网地址和端口号向内部主机发送数据。

    受限圆锥型：外部主机只有先收到内部主机发送的数据包后，才能向内部主机发送数据。
    具体来说，当内部主机通过 NAT 设备向外部某个主机发送数据包后，NAT 设备会记录这个外部主机的 IP 地址。之后，只有这个被记录的外部主机才能使用 NAT 转换后的公网 IP 地址和端口号向内部主机发送数据。

    端口受限圆锥型：比起受限圆锥型，增加了外部主机的端口限制。

    对称型：内部主机每次向不同的外部主机发送数据包时，NAT 设备都会为其分配不同的公网 IP 地址和端口号组合。且具有端口受限型的所有特征。

## STUN

STUN（Session Traversal Utilities for NAT，翻译为用于NAT的会话穿越工具）是一种用于 NAT 穿越的协议。它可以帮助 NAT 设备自动发现映射后的公网 IP 地址和端口号。

STUN的工作流程如下：

    1. NAT探测阶段：STUN客户端向服务端发送一个binding请求，STUN服务端返回一个binding响应，其中携带MAPPED-ADDRESS、XOR-MAPPED-ADDRESS和RESPONSE-ORIGIN等属性。STUN客户端通过比较各个属性，确定其中是否存在NAT。
    2. 打洞阶段：STUN客户端向STUN服务端请求其他STUN客户端的信息，通过交换NAT映射地址尝试实现P2P连接。客户端交替发送绑定请求，在各自的NAT设备上建立会话表项，当两端NAT都建立会话表项的时候，就可以建立P2P连接。

## TURN

TURN（Traversal Using Relays around NAT，翻译为围绕NAT使用中继穿越）是一种用于 NAT 穿越的协议。它可以帮助 NAT 设备通过中继服务器转发数据包，从而实现 NAT 穿越。

## 时机：

设置 ICE 候选人应该在进行媒体协商后进行。

# RTCPeerConnection

表示本地端和远程对等端之间的 WebRTC 连接。它提供了创建远程对等端连接、维护和监视连接，以及在连接不再需要时关闭连接的方法。

主要功能：
```ts
const configuration = {
    // 设置ICE服务器
    iceServers: [
        {
            urls: 'stun:stun.l.google.com:19302'
        },
        {
            urls: 'turn:your-turn-server-url',
            username: 'your-username',
            credential: 'your-password'
        }
    ],
    // ICE传输策略，可选值有'relay', 'public' 和'all'，relay就是只中继
    iceTransportPolicy: 'all',

    
    // 当指定当远程对等点与 SDP BUNDLE 标准不兼容时，应如何处理候选的协商。
    // balanced
    // ICE 代理最初为每一种内容类型（音频、视频、数据通道）创建一个 RTCDtlsTransport。如果远程端点无法感知 BUNDLE，那么每一个 DTLS 传输用于处理一种数据类型的通信。

    // max-compat
    // ICE 代理最初为每个媒体轨道创建一个 RTCDtlsTransport，对数据通道则创建一个单独的传输。如果远程端点无法感知 BUNDLE，那么对于所有的内容都会协商一个单独的 DTLS 传输。

    // max-bundle
    // ICE 代理最初仅创建一个 RTCDtlsTransport 来承载所有的 RTCPeerConnection 的数据。如果远程端点无法感知 BUNDLE，那么仅会协商一个轨道而忽略其余的轨道。
    bundlePolicy: 'max-bundle',
};

const pc = new RTCPeerConnection(configuration);

// 添加本地音视频流
stream.getTracks().forEach(track => {
  pc.addTrack(track, stream);
});

// 设置完本地SDP后会触发
pc.onicecandidate = (event) => {
  // 发送ICE候选给对端
  signalingChannel.send(JSON.stringify(event.candidate));
};

// 设置远端SDP后会触发
pc.ontrack = (event) => {
  // 接收对端的音视频流
  videoRef.value.srcObject = event.streams[0];
};
```