import { renderToString } from 'vue/server-renderer'
import type { VNode } from 'vue'

export default function VNode2Html(vnodes: VNode) {
    const html = renderToString(vnodes)
    return html
}