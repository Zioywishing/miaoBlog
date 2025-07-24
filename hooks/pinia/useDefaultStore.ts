import { defineStore } from "pinia";

export const useDefaultStore = defineStore("default", () => {
	const cache = ref<Map<string, any>>(new Map());

	const setCache = (key: string, value: any, option?: {}) => {
		cache.value.set(key, { value });
	};

	const getCache = (key: string, option?: {
		default: any,
	}) => {
		return toRaw(cache.value.get(key))?.value ?? option?.default ?? undefined;
	};

	const deleteCache = (key: string) => {
		cache.value.delete(key);
	};
	
	return { cache, setCache, getCache, deleteCache };
});

export default useDefaultStore;