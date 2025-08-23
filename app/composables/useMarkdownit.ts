let md: { default: any; }

export default async function useMarkdownit() {
    if(!md) {
        md = await import('markdown-it');
    }
    const markdownit = md.default;
    const mdit = markdownit({
        html: true,
        linkify: true,
        typographer: true
    });
    return mdit;
}