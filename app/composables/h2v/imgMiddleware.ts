const useImgDisplayMiddleware: () => middlewareType = () => {
    const previewSrcList = reactive<string[]>([])
    return {
        filter(tagName: string) {
            return tagName === 'img'
        },
        async render({
            item: _item,
            tagAttrs,
        }) {
            const imgDisplay = await cachedPromise('component:md-image-display', async () => {
                const component = markRaw((await import('~/components/h2v/miaoPostImage.vue')).default)
                return component
            })
            return h(
                imgDisplay,
                {
                    src: tagAttrs.src!,
                    alt: tagAttrs.alt! ?? "",
                    previewSrcList,
                },
            )
        },
    }
}

export default useImgDisplayMiddleware