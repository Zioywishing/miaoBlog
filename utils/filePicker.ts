export class FilePicker {
    private _resolve: ((files: File[]) => void) | undefined
    constructor() {
        if (this._resolve) {
            this._resolve([])
            this._resolve = undefined
        }
    }

    public pick(option?: { accept?: string; multiple?: boolean }) {
        if (this._resolve) {
            this._resolve([])
            this._resolve = undefined
        }
        return new Promise<File[]>((resolve) => {
            const inpEle = document.createElement('input')
            inpEle.id = `__file_${Math.ceil(Math.random() * 100000000)}`
            inpEle.type = 'file'
            inpEle.style.display = 'none'
            this._resolve = resolve
            // 文件类型限制
            // inpEle.accept="image/*"
            option?.accept && (inpEle.accept = option?.accept)
            // 多选限制
            option?.multiple && (inpEle.multiple = option?.multiple)
            // inpEle.addEventListener("change", event => fn.call(inpEle, event, inpEle.files), { once: true });
            inpEle.addEventListener(
                'change',
                () => {
                    if (!inpEle.files) {
                        return
                    }
                    const files: File[] = []
                    let i = 0
                    while (i < inpEle.files?.length) {
                        const _file = inpEle?.files?.item(i)
                        if (_file!== null) {
                            files.push(_file)
                        }
                        i += 1
                    }
                    resolve(files)
                    this._resolve = undefined
                },
                { once: true }
            )
            inpEle.addEventListener('abort', () => {
                this._resolve && this._resolve([])
                this._resolve = undefined
            })
            inpEle.addEventListener('error', () => {
                this._resolve && this._resolve([])
                this._resolve = undefined
            })
            inpEle.click()
        })
    }
}




// (() => {
//     let _resolve: ((files: File[]) => void) | undefined
//     return (option?: { accept?: 'string'; multiple: boolean }) => {
//        if (_resolve) {
//           _resolve([])
//           _resolve = undefined
//        }
//        return new Promise<File[]>((resolve) => {
//           const inpEle = document.createElement('input')
//           inpEle.id = `__file_${Math.ceil(Math.random() * 100000000)}`
//           inpEle.type = 'file'
//           inpEle.style.display = 'none'
//           _resolve = resolve
//           // 文件类型限制
//           // inpEle.accept="image/*"
//           option?.accept && (inpEle.accept = option?.accept)
//           // 多选限制
//           option?.multiple && (inpEle.multiple = option?.multiple)
//           // inpEle.addEventListener("change", event => fn.call(inpEle, event, inpEle.files), { once: true });
//           inpEle.addEventListener(
//              'change',
//              () => {
//                 if (!inpEle.files) {
//                    return
//                 }
//                 const files: File[] = []
//                 let i = 0
//                 while (i < inpEle.files?.length) {
//                    const _file = inpEle?.files?.item(i)
//                    if (_file !== null) {
//                       files.push(_file)
//                    }
//                    i += 1
//                 }
//                 resolve(files)
//                 _resolve = undefined
//              },
//              { once: true }
//           )
//           inpEle.click()
//        })
//     }
//  })()