import { defineStore } from "pinia";

export const useUserStore = defineStore("user", () => {
    const isLogin = ref<boolean>(false);
    const _token = ref<string>();
    const _tokenExpireTime = ref<number>();

    const tokenExpireTime = computed(() => {
        if (_tokenExpireTime.value) {
            return _tokenExpireTime.value;
        }
        const res = parseInt(localStorage.getItem("miao-token-expire-time") || "0")
        _tokenExpireTime.value = res;
        return res;
    });

    const setTokenExpireTime = (value: number) => {
        _tokenExpireTime.value = value;
        localStorage.setItem("miao-token-expire-time", value.toString());
    };

    const token = computed(() => {
        if (_token.value) {
            return _token.value;
        }
        const res = localStorage.getItem("miao-token") || ""
        _token.value = res;
        return res;
    });
    
    const setLoginStatus = (value: boolean) => {
        isLogin.value = value;
    };
    const setToken = (value: string) => {
        _token.value = value;
        localStorage.setItem("miao-token", value);
    };
    return {
        isLogin,
        setLoginStatus,
        token,
        setToken,
        tokenExpireTime,
        setTokenExpireTime,
        _tokenExpireTime,
        _token
    };
});

export default useUserStore;