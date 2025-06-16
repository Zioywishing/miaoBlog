/**
 * 修复HTML字符串中的未闭合标签
 * @param html - 需要修复的HTML字符串
 * @returns 修复后的HTML字符串
 */
export default function htmlFixer(html: string): string {
    // 存储标签栈，用于跟踪未闭合的标签
    const tagStack: string[] = [];
    // 存储最终修复后的HTML结果
    let result = '';
    // 当前处理的位置
    let i = 0;

    // 遍历HTML字符串中的每个字符
    while (i < html.length) {
        // 遇到开始标签 <
        if (html[i] === '<') {
            // 如果是结束标签 </
            if (i + 1 < html.length && html[i + 1] === '/') {
                // 找到结束标签的结束位置 >
                const endTagEnd = html.indexOf('>', i + 2);
                if (endTagEnd !== -1) {
                    // 提取标签名，例如从 </div> 中提取 div
                    const closingTag = html.substring(i + 2, endTagEnd).trim();
                    // 将结束标签及其内容添加到结果中
                    result += html.substring(i, endTagEnd + 1);
                    i = endTagEnd + 1;

                    // 检查栈顶标签是否与当前结束标签匹配
                    while (tagStack.length > 0) {
                        const topTag = tagStack.pop()!;
                        // 如果匹配，继续处理下一个字符
                        if (topTag === closingTag) {
                            break;
                        } else {
                            // 如果不匹配，添加闭合标签
                            result = result.slice(0, -(`</${closingTag}>`).length) + `</${topTag}></${closingTag}>`;
                        }
                    }
                    continue;
                }
            }
            // 如果是开始标签 <tag>
            else {
                // 找到开始标签的结束位置 >
                const tagEnd = html.indexOf('>', i + 1);
                if (tagEnd !== -1) {
                    // 提取标签内容，例如 <div class="test"> 中的 div class="test"
                    const tagContent = html.substring(i + 1, tagEnd).trim();
                    // 提取标签名，例如从 div class="test" 中提取 div
                    const tagNameMatch = tagContent.match(/^[a-zA-Z0-9]+/);
                    
                    if (tagNameMatch) {
                        const tagName = tagNameMatch[0];
                        // 自闭合标签不需要处理
                        if (tagContent.endsWith('/')) {
                            result += html.substring(i, tagEnd + 1);
                        } else {
                            // 将非自闭合标签压入栈中
                            tagStack.push(tagName);
                            result += html.substring(i, tagEnd + 1);
                        }
                    }
                    i = tagEnd + 1;
                    continue;
                }
            }
        }
        // 处理非标签内容
        result += html[i];
        i++;
    }

    // 处理剩余未闭合的标签
    while (tagStack.length > 0) {
        const unclosedTag = tagStack.pop()!;
        result += `</${unclosedTag}>`;
    }

    return result;
}