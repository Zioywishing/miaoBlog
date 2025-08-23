export type essayItem = {
    id: number;
    content: string;
    contentHtml: string;
    images: string[]; // 图片URL数组
    userId: number;
    username?: string;
    createTime: number;
    updateTime: number;
};

export type essayCreateRequest = {
    content: string;
    contentHtml: string;
    images: string[];
};

export type essayUpdateRequest = {
    id: number;
    content: string;
    contentHtml: string;
    images: string[];
};