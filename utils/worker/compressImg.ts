import compressImg from "../compressImg";

self.onmessage = async (event: MessageEvent<FileMessage>) => {
    let { file, quality, type, id } = event.data;

    try {
        const compressedFile = new File([await compressImg(file, {
            quality: quality || 0.5,
            type: type || 'image/jpeg',
        })], file.name, {
            type: type || 'image/jpeg'
        });
        // 立即返回文件
        self.postMessage({
            file: compressedFile, id
        });
    } catch (error) {
        self.postMessage({
            file, id, error: error instanceof Error ? error.message : String(error)
        });
    }
};
// 定义消息类型
interface FileMessage {
    file: File;
    quality?: number;
    type?: string;
    id?: number;
}
