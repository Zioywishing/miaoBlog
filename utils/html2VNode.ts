import type { VNode } from "vue";

import { parseDocument } from "htmlparser2";

// 得重构了
export default class Html2VNode {
    private middlewareList: middlewareType[] = []
    private middlewareMap: Map<string, middlewareType> = new Map();
    private domParser = window && DOMParser !== undefined ? new DOMParser() : null;

    constructor() {
        this.use(this.defaultMiddleware)
        // this.use(this.preMiddleware)
    }

    public use(middleware: middlewareType) {
        this.middlewareList.unshift(middleware)
    }

    private filterMiddleware = (tagName: string) => {
        if (this.middlewareMap.has(tagName)) {
            return this.middlewareMap.get(tagName)
        }
        else {
            const mid = this.middlewareList.filter(middleware => middleware.filter(tagName))[0]!
            this.middlewareMap.set(tagName, mid)
            return mid;
        }
    }


    public async render(htmlString: string) {
        if (!this.domParser) {
            return [h(htmlString)];
        }

        const doc = parseDocument(htmlString).children as chileNodeType[];
        const vnodes = await this.render2VNode(doc, _ => this.filterMiddleware(_)!);
        return vnodes.filter(item => typeof item !== 'string');
    }

    private render2VNode = async (
        wrinklesResult: chileNodeType[],
        filterMiddleware: (tagName: string) => middlewareType
    ): Promise<(VNode | string)[]> => {
        return Promise.all(wrinklesResult.map((async (item: chileNodeType): Promise<VNode | string> => {
            if (item.type === 'text') {
                return item.data;
            }
            const { name, attribs, children } = item
            const middleware = filterMiddleware(name);
            const _res = middleware.render({
                item,
                tagName: name,
                tagAttrs: attribs,
                filterMiddleware,
                render: this
            })
            if (_res) {
                return await _res
            }
            return ''
        })))
    }

    private defaultMiddleware: middlewareType = {
        filter: (_: string) => {
            return true;
        },
        render: async ({
            item, tagName, tagAttrs, filterMiddleware, render
        }) => {
            if (item.type === "text") {
                return item.data;
            }
            let child = await render.render2VNode(item.children, filterMiddleware)
            return h(tagName ?? 'span', tagAttrs, child)
        }
    }
}

type chileNodeType = {
    type: "tag",
    name: string,
    attribs: { [key: string]: string },
    children: chileNodeType[],
} | {
    type: "text",
    data: string,
}

// type TagType = {
//     tag: string;
//     Index: number;
//     isClose: boolean;
// }

// 要优化也是以后优化了
export type middlewareType = {
    filter: (tagName: string) => boolean,
    render: (option: {
        item: chileNodeType,
        tagName: string,
        tagAttrs: { [key: string]: string },
        filterMiddleware: (tagName: string) => middlewareType,
        render: Html2VNode
    }
    ) => Promise<VNode | string>
}