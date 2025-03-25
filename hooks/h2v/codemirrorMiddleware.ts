const codemirrorMiddleware: middlewareType = {
    filter(tagName: string) {
        return tagName === 'code'
    },
    async render({
        item,
        tagAttrs,
    }) {
        const codeMirror = await cachedPromise('component:codeMirror', async () => {
            const codeMirror = (await import('~/components/codeMirror.vue')).default
            return codeMirror
        })
        const codeType = tagAttrs?.class?.slice(1, -1)?.split('-')?.[1] ?? ''
        // @ts-ignore
        const inline = (item.children[0].children.trim() as string).includes('\n') ? false : true
        return h(
            codeMirror,
            {
                // @ts-ignore
                data: item.children[0].children.trim(),
                type: codeType,
                inline,
            },
        )
    },
}

export default codemirrorMiddleware