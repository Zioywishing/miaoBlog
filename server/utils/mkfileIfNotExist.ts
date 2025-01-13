import fs from 'fs';
import path from 'path';
import mkdirIfNotExist from './mkdirIfNotExist';

export default function mkfileIfNotExist(filePath: string | string[], content?: string): void {
    content = content || '';
    if (Array.isArray(filePath)) {
        filePath.forEach((file) => mkfileIfNotExist(file, content));
        return;
    }
    if (typeof filePath !== 'string') {
        console.error('Invalid file path:', filePath);
        return;
    }
    if (fs.existsSync(filePath)) {
        return;
    }
    const dir = path.dirname(filePath);
    mkdirIfNotExist(dir);
    try {
        fs.writeFileSync(filePath, content);
    } catch (error) {
        console.error('Error creating file:', error);
    }
}