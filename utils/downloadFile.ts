export default function downloadFile(file: File) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(file);
    a.download = file.name;
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
}