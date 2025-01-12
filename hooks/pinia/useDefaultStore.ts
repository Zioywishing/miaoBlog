import { defineStore } from "pinia";

export const useDefaultStore = defineStore("default", () => {
	const cache = ref<Map<string, any>>(new Map());

	const setCache = (key: string, value: any, option?: {}) => {
		cache.value.set(key, { value });
	};

	const getCache = (key: string) => {
		return cache.value.get(key)?.value ?? undefined;
	};

	const deleteCache = (key: string) => {
		cache.value.delete(key);
	};
	
	return { cache, setCache, getCache, deleteCache };
});

export default useDefaultStore;