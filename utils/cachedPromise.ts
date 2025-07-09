import useDefaultStore from "~/hooks/pinia/useDefaultStore"

export default async function cachedPromise<T>(key: string, promise: () =>Promise<T>): Promise<T> {
    if(import.meta.server) {
        // In server-side rendering, we don't cache promises
        return promise()
    }
    const cache = useDefaultStore().getCache(key)
    if (cache) {
        return cache
    }
    const res = await promise()
    useDefaultStore().setCache(key, res)
    return res
}