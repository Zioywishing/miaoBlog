export default async function useMarkdownit() {
    const md = await import('markdown-it');
    const markdownit = md.default;
    const mdit = markdownit({
        html: true,
        linkify: true,
        typographer: true
    });
    return mdit;
}