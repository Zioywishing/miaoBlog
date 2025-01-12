import { defineStore } from "pinia";

export const useDefaultStore = defineStore("default", () => {
	const _return = {};
	const appendReturn = (obj: { [key: string]: any }) => {
		Object.assign(_return, obj);
	};
	const count = ref(0);
	appendReturn({ count });
	return _return;
});
