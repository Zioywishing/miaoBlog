export type postItem = {
    id: number;
    title: string;
    date: number;
    summary: string;
    tags: string[];
    type: 'markdown';
    url: string;
};

export type postContent = {
    title: string;
    data: string;
};