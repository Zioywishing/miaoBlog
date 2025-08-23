import { defineStore } from "pinia";
import type { postContent, postItem } from "~/types/post";

const useDefaultStore = defineStore("postStore", () => {
    const postCache = ref<Record<string, postContent>>({});
    const lastUpdateTime = ref<Record<string, number>>({});

    const postListCache = ref<Record<string, postItem[]>>({});
    const postListLastUpdateTime = ref<number>(-1);

    function getPostCache(key: string) {
        if (lastUpdateTime.value[key] - Date.now() > 1000 * 60) {
            delete postCache.value[key];
            delete lastUpdateTime.value[key];
        }
        if (postCache.value[key]) {
            return postCache.value[key];
        }
        return undefined;
    }

    function setPostCache(key: string, value: postContent) {
        postCache.value[key] = value;
        lastUpdateTime.value[key] = Date.now();
    }

    function deletePostCache(key: string) {
        delete postCache.value[key];
        delete lastUpdateTime.value[key];
    }

    return {
        lastUpdateTime, postCache, postListCache, postListLastUpdateTime,
        getPostCache, setPostCache, deletePostCache
    };
});

export default useDefaultStore;