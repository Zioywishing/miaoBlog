export default function range(start: number, end?: number) {
    if (end === undefined) {
        end = start;
        start = 0;
    }
    const result = [];
    for (let i = start; i < end; i++) {
        result.push(i);
    }
    return result;
}