import useDefaultStore from "~/hooks/pinia/useDefaultStore"
import usePostStore from "~/hooks/pinia/usePostStore"
import useMiaoFetch from "~/hooks/useMiaoFetch"
// import usePostStore from "~/hooks/pinia/usePostStore"
import type { postContent, postItem } from "~/types/post"

export default async function getPostList() {
    const store = useDefaultStore()
    const cache = store.getCache('posts')
    if (cache) {
        return cache as postItem[]
    }
    const response = await $fetch('/api/posts/getPostList')
    const res = response.data
    store.setCache('posts', res)
    return res
}

export async function getPostData(id: number | string) {
    const postStore = usePostStore()
    const cache = postStore.getPostCache(`${id}`)
    if (cache) {
        return cache
    }
    const res = await $fetch('/api/posts/getPostContent', {
        method: 'POST',
        body: {
            id
        }
    }) as postContent
    postStore.setPostCache(`${id}`, res)
    return res
}