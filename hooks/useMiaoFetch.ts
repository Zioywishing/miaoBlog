import needRegister from "~/server/api/user/needRegister";
import useUserStore from "./pinia/useUserStore"


export default function useFetch() {
    const userStore = useUserStore();
    return {
        post: {
            uploadPost: (body: {
                title: string,
                summary: string,
                type: string,
                tags: string[],
                url: string,
                date: number,
                content: string,
                contentHtml: string
            }) => $fetch('/api/posts/uploadPost', {
                method: 'POST',
                body,
                headers: {
                    'Authorization': `Bearer ${userStore.token}`
                }
            }),
            updatePost: (body: {
                id: number,
                title: string,
                summary: string,
                type: string,
                tags: string[],
                url: string,
                date: number,
                content: string,
                contentHtml: string
            }) => $fetch('/api/posts/editPost', {
                method: 'POST',
                body,
                headers: {
                    'Authorization': `Bearer ${userStore.token}`
                }
            }),
            getPost: (id: number) => $fetch(`/api/posts/getPostContent`, {
                method: 'post',
                body: {
                    id
                },
                headers: {
                    'Authorization': `Bearer ${userStore.token}`
                }
            }),
            getPostMD: (id: number) => $fetch(`/api/posts/getPostMDContent`, {
                method: 'post',
                body: {
                    id
                },
                headers: {
                    'Authorization': `Bearer ${userStore.token}`
                }
            }),
            getPostList: (body: {
                page?: number,
                tag?: string
            }) => $fetch('/api/posts/getPostList', {
                method: 'POST',
                body,
                headers: {
                    'Authorization': `Bearer ${userStore.token}`
                }
            }),
            deletePost: (id: number) => $fetch('/api/posts/deletePost', {
                body: {
                    id
                },
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${userStore.token}`
                }
            })
        },
        user: {
            login: (body: {
                username: string,
                password: string
            }) => $fetch('/api/user/login', {
                method: 'POST',
                body
            }),
            register: (body: {
                username: string,
                password: string
            }) => $fetch('/api/user/register', {
                method: 'POST',
                body
            }),
            needRegister: () => $fetch('/api/user/needRegister'),
            refreshToken: () => $fetch('/api/user/refreshToken', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${userStore.token}`
                }
            }),
            updatePassword: (body: {
                oldPassword: string,
                newPassword: string
            }) => $fetch('/api/user/updatePassword', {
                method: 'POST',
                body,
                headers: {
                    'Authorization': `Bearer ${userStore.token}`
                }
            })
        },
        system: {
            updateFromGithub: (url: string) => $fetch('/api/system/updateFromGithub', {
                body: {
                    url
                },
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${userStore.token}`
                }
            })
        }
    }
}


export const testAuth = () => {
    const userStore = useUserStore();
    (async () => {
        const res = await $fetch('/api/test/testDir', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${userStore.token}`
            }
        })
        console.log(res)
    })()
}