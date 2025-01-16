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
        if(tokenExpireTime.value < Date.now()) {
            localStorage.removeItem("miao-token");
            localStorage.removeItem("miao-token-expire-time");
            _token.value = undefined;
            return "";
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

    const logout = () => {
        setLoginStatus(false);
        _token.value = undefined;
        _tokenExpireTime.value = undefined;
        localStorage.removeItem("miao-token");
        localStorage.removeItem("miao-token-expire-time");
    };
    return {
        isLogin,
        setLoginStatus,
        token,
        setToken,
        tokenExpireTime,
        setTokenExpireTime,
        _tokenExpireTime,
        _token,
        logout
    };
});

export default useUserStore;