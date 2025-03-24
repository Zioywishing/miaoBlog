import type { VNode } from "vue";

// 未完成
export default class Html2VNode {
    private middlewareList: middlewareType[] = []

    constructor() {
        this.use(this.defaultMiddleware)
    }

    public use(middleware: middlewareType) {
        this.middlewareList.push(middleware)
    }
    public render(htmlString: string) {
        const htmlString2 = htmlString.replaceAll('<hr>', '<hr></hr>').replaceAll('<br>', '<br></br>')
        const html2ObjResult = this.html2Obj(htmlString2);
        const middlewareMap = this.buildMiddlewareMap(html2ObjResult);
        const wrinklesResult = this.wrinkles(html2ObjResult)
        const vnodes = this.render2VNode(wrinklesResult, middlewareMap)
        return vnodes;
    }

    private buildMiddlewareMap(objs: (TagType | miaoVNodeType)[]) {
        const tagNameSet = new Set<string>()
        const middlewareMap = new Map<string, middlewareType[]>()
        for (const item of objs) {
            const { tagName = '' } = this.parseTag(item.tag);
            tagNameSet.add(tagName)
        }
        for (const tagName of tagNameSet) {
            for (const middleware of this.middlewareList) {
                if (middleware.filter(tagName)) {
                    if(!middlewareMap.has(tagName)) {
                        middlewareMap.set(tagName, [middleware])
                    } else {
                        middlewareMap.get(tagName)!.unshift(middleware)
                    }
                }
            }
        }
        return middlewareMap;
    }

    private render2VNode = (
        wrinklesResult: (miaoVNodeType | string)[],
        middlewareMap: Map<string, middlewareType[]>
    ): (VNode | string)[] => {
        return wrinklesResult.map((item: miaoVNodeType | string): VNode | string => {
            if (typeof item === 'string') {
                return item;
            }
            const { tagName = '', tagAttrs } = this.parseTag(item.tag);
            const middlewares = middlewareMap.get(tagName)
            for(const middleware of middlewares!) {
                const _res = middleware.render({
                    item,
                    tagName,
                    tagAttrs,
                    middlewareMap
                })
                if(_res) {
                    return _res
                }
            }
            return ''
        })
    }

    private defaultMiddleware: middlewareType = {
        filter: (_: string) => {
            return true;
        },
        render: ({
            item, tagName, tagAttrs, middlewareMap
        }) => {
            if (!tagName) {
                return item.children as string;
            }
            let child: string | (string | VNode)[] = item.children as string
            if (typeof item.children !== 'string') {
                child = this.render2VNode(item.children, middlewareMap)
            }
            return h(tagName ?? 'span', tagAttrs, child)
        }
    }

    private html2Obj = (htmlString: string) => {
        const html2ObjResult: (TagType | miaoVNodeType)[] = []
        let currhtml = htmlString;
        while (true) {
            const nextTag = this.getNextHtmlTag(currhtml);
            if (!nextTag) {
                if(currhtml) {
                    html2ObjResult.push({
                        tag: '',
                        children: currhtml,
                    })
                }
                break;
            }
            const middleChild = currhtml.slice(0, nextTag.Index);
            if (middleChild) {
                html2ObjResult.push({
                    tag: '',
                    children: middleChild,
                })
            }
            currhtml = currhtml.slice(nextTag.Index + nextTag.tag.length);
            html2ObjResult.push(nextTag)
        }
        html2ObjResult.forEach(item => {
            // @ts-ignore
            if(item.children &&typeof item.children==='string') {
                // @ts-ignore
                item.children = this.parseString(item.children)
            }
        })
        return html2ObjResult;
    }

    private parseString = (target: string) => {
        
        return target.replaceAll('&lt;', '<')
            .replaceAll('&gt;', '>')
            .replaceAll('&amp;', '&')
            .replaceAll('&quot;', '"')
            .replaceAll('&#39;', '\'')
    }

    private check = (html2ObjResult: (TagType | miaoVNodeType)[]) => {
        const stack = []
        for (const item of html2ObjResult) {
            if (!item.tag) {
                continue;
            }
            // @ts-ignore
            if (item?.isClose && item.isClose == true) {
                const last = stack.pop();
                if (last !== this.parseTag(item.tag).tagName) {
                    return false;
                }
            } else {
                stack.push(this.parseTag(item.tag).tagName)
            }
        }
        return true;
    }

    // 想必是flat的反义词吧
    private wrinkles = (target: (TagType | miaoVNodeType)[]) => {
        const res: miaoVNodeType[] = []
        const resStack = [res]
        for (const item of target) {
            if (!item.tag) {
                // @ts-ignore
                resStack[resStack.length - 1].push(item)
                // @ts-ignore
            } else if (item.isClose) {
                resStack.pop()
            } else {
                const _childRes: any = []
                resStack[resStack.length - 1].push({
                    tag: item.tag,
                    // tag: this.getTagName(item.tag),
                    children: _childRes,
                })
                resStack.push(_childRes)
            }
        }
        return res;
    }

    private getNextHtmlTag = (htmlString: string): {
        tag: string,
        Index: number,
        isClose: boolean
    } | null => {
        let startIndex = 0;
        let tagRegex = /<("[^"]*"|'[^']*'|[^'">])*>/;
        let tagMatch = tagRegex.exec(htmlString.slice(startIndex));
        if (tagMatch) {
            const isClose = tagMatch[0].startsWith('</');
            return {
                tag: tagMatch[0],
                Index: tagMatch.index,
                isClose
            };
        }
        return null;
    }

    private parseTag = (tag: string) => {
        const tagStr = tag.replace(/<\s*\/*\s*|\s*>/g, '');
        const tagArr = tagStr.split(' ').filter(item => item.trim());
        const tagName = tagArr.shift();
        const tagAttrs = tagArr.map(v => v.trim().split('=')).reduce((pre, cur) => {
            pre[cur[0]] = cur[1];
            return pre;
        }, {} as { [key: string]: string })
        return { tagName, tagAttrs };
    }
}

type miaoVNodeType = {
    tag: string,
    children: string | miaoVNodeType[],
}

type TagType = {
    tag: string;
    Index: number;
    isClose: boolean;
}

// 要优化也是以后优化了
export type middlewareType = {
    filter: (tagName: string) => boolean,
    render: (option: {
            item: miaoVNodeType,
            tagName: string,
            tagAttrs: { [key: string]: string },
            middlewareMap: Map<string, middlewareType[]>
        }
    ) => VNode | string
}