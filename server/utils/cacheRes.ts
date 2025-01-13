export default function cacheResult<T>(func: () => T): () => T {
    let result: any;
    return () => {
        if (result === undefined) {
            result = func();
        }
        return result;
    };
}