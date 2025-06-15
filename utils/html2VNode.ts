import type { VNode } from "vue";

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
            return h(htmlString);
        }
        const doc = this.domParser.parseFromString(htmlString, "text/html").body;
        if (!doc) {
            throw new Error('htmlString is not a valid html string')
        }
        // console.log(doc.childNodes)
        const wrinklesResult = this.buildMiaoVNodeFromDoc(doc.childNodes);
        // console.log(doc.childNodes)
        // const htmlString2 = htmlString.replaceAll('<hr>', '<hr></hr>').replaceAll('<br>', '<br></br>')
        // const html2ObjResult = this.html2Obj(htmlString2);
        // const wrinklesResult = this.wrinkles(html2ObjResult)
        // console.log({ _wrinklesResult, wrinklesResult })
        const vnodes = await this.render2VNode(wrinklesResult, _ => this.filterMiddleware(_)!);
        // (async _ => console.log(await vnodes, wrinklesResult, html2ObjResult))()
        return vnodes.filter(item => typeof item !== 'string');
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
        return Promise.all(wrinklesResult.map((async (item: miaoVNodeType | string): Promise<VNode | string> => {
            if (typeof item === 'string') {
                return item;
            }
            const { tagName = '', tagAttrs } = item
            const middleware = filterMiddleware(tagName);
            const _res = middleware.render({
                item,
                tagName,
                tagAttrs,
                filterMiddleware
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

// type TagType = {
//     tag: string;
//     Index: number;
//     isClose: boolean;
// }

// 要优化也是以后优化了
export type middlewareType = {
    filter: (tagName: string) => boolean,
    render: (option: {
        item: miaoVNodeType,
        tagName: string,
        tagAttrs: { [key: string]: string },
        filterMiddleware: (tagName: string) => middlewareType,
    }
    ) => Promise<VNode | string>
}