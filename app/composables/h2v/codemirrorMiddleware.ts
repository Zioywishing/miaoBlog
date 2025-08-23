const useCodedisplayMiddleware: () => middlewareType = () => ({
    filter(tagName: string) {
        return tagName === 'code'
    },
    async render({
        item,
        tagAttrs,
    }) {
        const codeDisplay = await cachedPromise('component:codeDisplay', async () => {
            const component = markRaw((await import('~/components/codeDisplay.vue')).default)
            return component
        })
        const codeType = tagAttrs?.class?.split('-')?.[1] ?? ''
        // @ts-ignore
        const inline = (item.children[0].children.trim() as string).includes('\n') ? false : true
        return inline ? h(
            "span",
            {
                style: {
                    backgroundColor: '#eff1f5',
                    padding: '2px 6px',
                    borderRadius: '4px',
                }
            },
            // @ts-ignore
            (item.children[0].children as string).trim()
        ) : h(
            codeDisplay,
            {
                // @ts-ignore
                data: item.children[0].children.trim(),
                type: codeType,
            },
        )
    },
})

export default useCodedisplayMiddleware