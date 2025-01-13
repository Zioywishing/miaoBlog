import fs from 'fs';

export default function mkdirIfNotExists(dir: string | string[]): void {
    if (typeof dir !== 'string') {
        dir.forEach((d) => mkdirIfNotExists(d));
        return;
    }
    if (!fs.existsSync(dir)) {
        try {
            fs.mkdirSync(dir, { recursive: true });
        } catch (error) {
            console.error(error)
        }
    }
}
