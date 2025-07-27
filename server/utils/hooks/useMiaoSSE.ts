export interface SSEHandler {
    write: (data: { [key: string]: any }) => number
}

export default function useMiaoSSE(event: any): SSEHandler {
    setResponseHeader(event, 'Content-Type', 'text/event-stream')
    setResponseHeader(event, 'Cache-Control', 'no-cache')
    setResponseHeader(event, 'Connection', 'keep-alive')

    const messageData: {
        id: number,
        message: string
    }[] = []

    const _res = event.node.res

    return {
        write: (data: { [key: string]: any }) => {
            const msg = `data: ${JSON.stringify(data)}\n\n`
            const id = messageData.length
            messageData.push({
                id,
                message: msg
            })
            _res.write(`id: ${id}\ndata: ${msg}\n\n`)
            return id
        }
    }
}