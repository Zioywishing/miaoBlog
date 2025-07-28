export async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('使用 Clipboard API 复制失败:', error);
    }
  }

  const textArea = document.createElement('textarea');
  textArea.value = text;
  
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  
  document.body.appendChild(textArea);
  textArea.select();

  let success = false;
  try {
    success = document.execCommand('copy');
  } catch (error) {
    console.error('使用传统方法复制失败:', error);
  } finally {
    document.body.removeChild(textArea);
  }

  return success;
}