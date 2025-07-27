import type { SSEHandler } from "../hooks/useMiaoSSE";

const RoomMemberExitTime = 1000 * 60 * 1 // 3min

export class SSESocketRoomMember {
    private _id: string
    private _socket: SSEHandler
    private exitTimer: any
    private roomId: string
    private _exitPromise: Promise<void>
    private _exitPromiseResolve?: (_: void) => void

    private refreshTimestamp: number = 0

    constructor(props: {
        id: string
        socket: SSEHandler
        roomId: string
    }) {
        this._id = props.id
        this._socket = props.socket
        this.roomId = props.roomId
        this._exitPromise = new Promise((resolve) => {
            this._exitPromiseResolve = resolve
        })

        this.refreshTimer()
    }

    get exitPromise() {
        return this._exitPromise
    }

    get id() {
        return this._id
    }

    set socket(socket: SSEHandler) {
        this._socket = socket
    }

    refreshTimer() {
        // console.log("refreshTimer::", this.id)


        this.refreshTimestamp = Date.now()
        clearTimeout(this.exitTimer)
        this.exitTimer = setTimeout(() => {
            if (Date.now() - this.refreshTimestamp > RoomMemberExitTime) {
                this.exit()
            }
        }, RoomMemberExitTime)
    }

    message(data: { [key: string]: any }) {
        this._socket.write(data)
    }

    exit() {
        // console.log("exit::", this.id)

        clearTimeout(this.exitTimer)
        this._socket.write({
            event: 'exit'
        })
        SSESocketRoom.exit({
            roomId: this.roomId,
            menberId: this.id
        })
        this._exitPromiseResolve?.()
    }
}

export default class SSESocketRoom {
    private static socketMap = new Map<string, SSESocketRoomMember[]>()

    public static join(props: {
        roomId: string
        sse: SSEHandler
        menberId: string
    }) {
        const { roomId, sse, menberId } = props
        let room: SSESocketRoomMember[] = SSESocketRoom.socketMap.get(roomId) ?? (() => {
            const newRoom: SSESocketRoomMember[] = []
            SSESocketRoom.socketMap.set(roomId, newRoom)
            return newRoom
        })()
        const existMember = room.find(member => member.id === menberId)
        if (existMember) {
            existMember.socket = sse
            existMember.refreshTimer()
            return existMember
        }
        const member: SSESocketRoomMember = new SSESocketRoomMember({
            id: menberId,
            socket: sse,
            roomId
        })
        room.push(member)
        return member
    }

    public static broadcast(props: {
        roomId: string
        menberId: string
        data: { [key: string]: any }
    }) {
        const { roomId, data, menberId } = props
        const room = SSESocketRoom.socketMap.get(roomId)
        if (room) {
            room.forEach(member => {
                // console.log("broadcast::", member.id, JSON.stringify(data))
                if (member.id !== menberId) {
                    member.message(data)
                } else {
                    member.refreshTimer()
                }
            })
        }
    }

    public static exit(props: {
        roomId: string
        menberId: string
    }) {
        const { roomId, menberId } = props
        const room = SSESocketRoom.socketMap.get(roomId)
        if (room) {
            for (let i = 0; i < room.length; i++) {
                const member = room[i]
                if (member.id === menberId) {
                    room.splice(i, 1)
                    break
                }
            }
            if (room.length === 0) {
                SSESocketRoom.socketMap.delete(roomId)
                // console.log("delete room::", roomId)
            }
        }
    }

    public static getMenber(props: {
        roomId: string
        menberId: string
    }) {
        const { roomId, menberId } = props
        const room = SSESocketRoom.socketMap.get(roomId)
        if (room) {
            for (let i = 0; i < room.length; i++) {
                const member = room[i]
                if (member.id === menberId) {
                    return member
                }
            }
        }
        return null
    }
}