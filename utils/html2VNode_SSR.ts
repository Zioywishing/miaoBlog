import type { VNode } from "vue";

// tod0: client不应该加载这个
import * as htmlparser2 from "htmlparser2";

// 得重构了
export default class Html2VNodeSSR {
    private middlewareList: middlewareType[] = []
    private middlewareMap: Map<string, middlewareType> = new Map();
    // @ts-ignore
    private domParser: ((...args: any[]) => unknown) | undefined = window && DOMParser !== undefined ? (...args: any[]) => (new DOMParser()).parseFromString(...args) : undefined;



    private parserType: "window" | "htmlparser2" = "window";

    constructor() {
        this.use(this.defaultMiddleware)
        // this.use(this.preMiddleware)
    }

    public use(middleware: middlewareType) {
        this.middlewareList.unshift(middleware)
    }

    public async useHtmlparser2(){
        this.parserType = 'htmlparser2'
        this.domParser = htmlparser2.parseDocument
        // return import("htmlparser2").then(res => {
        //     this.domParser = res.parseDocument
        // })
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

    private parseDocument(htmlString: string): miaoVNodeType[] {
        if (this.parserType === 'window') {
            const doc =  (this.domParser!(htmlString, "text/html")as any).body as any
            return this.buildMiaoVNodeFromDoc(doc.childNodes);
        }
        // const doc = htmlparser2.parseDocument(htmlString)
        const doc = this.domParser!(htmlString) as any
        return this.buildMiaoVNodeFromDocTest(doc.children);
    }


    public async render(htmlString: string) {
        // if (!this.domParser) {
        //     return h(htmlString);
        // }
        // const doc = (this.domParser(htmlString, "text/html") as any).body;
        // const docTest = htmlparser2.parseDocument(htmlString);
        // console.log({ docTest, doc })
        // if (!doc) {
        //     throw new Error('htmlString is not a valid html string')
        // }
        // const wrinklesResult = this.buildMiaoVNodeFromDoc(doc.childNodes);
        // const wrinklesResultTest = this.buildMiaoVNodeFromDocTest(docTest.children);
        // console.log({ wrinklesResult, wrinklesResultTest })
        const miaoNodes = this.parseDocument(htmlString);
        const vnodes = await this.render2VNode(miaoNodes, _ => this.filterMiddleware(_)!);
        // const vnodes = await this.render2VNode(wrinklesResult, _ => this.filterMiddleware(_)!);
        const result = vnodes.filter(item => typeof item !== 'string') as VNode[]

        // const _keyMap = new Map<string, number>()

        // result.forEach(item => {
        //     if (typeof item.type === 'string') {
        //         _keyMap.set(item.type, (_keyMap.get(item.type) ?? 0) + 1)
        //         item.key = item.key ?? `${item.type}-${_keyMap.get(item.type)}`
        //     }
        // })
        return result;
    }

    private isTextChild = (node: any) => {
        return node.children.length === 1 && node.children[0].type === "text"
    }

    private buildMiaoVNodeFromDocTest = (doc: any[]): miaoVNodeType[] => {
        const vnodes: miaoVNodeType[] = [];
        for (const node of doc) {
            if (node.type === "text" && node.data === "\n") {
                continue
            }
            if (!node.name) {
                vnodes.push({
                    tagName: "",
                    tagAttrs: {},
                    children: node.data
                });
                continue
            }
            const tagName = node.name.toLowerCase();
            const tagAttrs = node.attribs
            const children = this.isTextChild(node) ? [{
                tagName: "",
                tagAttrs: {},
                children: node.children[0].data
            }] :
                this.buildMiaoVNodeFromDocTest(node.children)
            vnodes.push({
                tagName,
                tagAttrs,
                children,
            });
        }
        return vnodes;
    }

    private buildMiaoVNodeFromDoc = (nodes: NodeListOf<ChildNode>): miaoVNodeType[] => {
        const vnodes: miaoVNodeType[] = [];
        for (const node of nodes) {
            const tagName = node.nodeName.toLowerCase();
            if (tagName === '#text' || tagName === 'text') {
                vnodes.push({
                    tagName: '',
                    tagAttrs: {},
                    // @ts-ignore
                    children: node.data as string,
                });
                continue;
            }
            const childNodes = node.childNodes;
            // @ts-ignore
            const data = node.data as string | undefined;
            // @ts-ignore
            const attributes = node.attributes as NamedNodeMap | undefined;
            const tagAttrs = {} as Record<string, string>;
            if (attributes) {
                for (const attr of attributes) {
                    tagAttrs[attr.name] = attr.value;
                }
            }
            vnodes.push({
                tagName,
                tagAttrs,
                children: node.childNodes.length ? this.buildMiaoVNodeFromDoc(childNodes) : data ?? "",
            })
        }
        return vnodes;
    }

    private render2VNode = async (
        wrinklesResult: (miaoVNodeType | string)[],
        filterMiddleware: (tagName: string) => middlewareType
    ): Promise<(VNode | string)[]> => {
        return Promise.all(wrinklesResult.map((async (item: miaoVNodeType | string): Promise<(VNode | string)> => {
            if (typeof item === 'string') {
                return item;
            }
            const { tagName = '', tagAttrs } = item
            const middleware = filterMiddleware(tagName);
            const _res = await middleware.render({
                item,
                tagName,
                tagAttrs,
                filterMiddleware
            })
            return _res
        })))
    }

    private defaultMiddleware: middlewareType = {
        filter: (_: string) => {
            return true;
        },
        render: async ({
            item, tagName, tagAttrs, filterMiddleware
        }) => {
            if (!tagName) {
                return item.children as string;
            }
            let child: string | (string | VNode)[] = item.children as string
            if (typeof item.children !== 'string') {
                child = await this.render2VNode(item.children, filterMiddleware)
                // if (tagName === "table") debugger
            }
            return h(tagName ?? 'span', tagAttrs, child)
        }
    }
}

type miaoVNodeType = {
    // tag: string,
    tagName: string,
    tagAttrs: { [key: string]: string },
    children: string | miaoVNodeType[],
}