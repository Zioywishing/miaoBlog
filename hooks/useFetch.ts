
export const uploadPost = (body: {
    title: string,
    summary: string,
    type: string,
    tags: string[],
    url: string,
    date: number,
    content: string
}) => $fetch('/api/posts/uploadPost', {
    method: 'POST',
    body
})

export const updatePost = (body: {
    id: number,
    title: string,
    summary: string,
    type: string,
    tags: string[],
    url: string,
    date: number,
    content: string
}) => $fetch('/api/posts/uploadPost', {
    method: 'POST',
    body
})