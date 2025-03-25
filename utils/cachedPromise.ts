import useDefaultStore from "~/hooks/pinia/useDefaultStore"

export default async function cachedPromise<T>(key: string, promise: () =>Promise<T>): Promise<T> {
    const cache = useDefaultStore().getCache(key)
    if (cache) {
        return cache
    }
    const res = await promise()
    useDefaultStore().setCache(key, res)
    return res
}