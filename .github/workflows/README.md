# 自动发布GitHub Action

这个GitHub Action工作流会在每次推送代码到`main`分支时自动创建一个新的发布版本，使用Debian 12环境进行构建。

## 工作流程

1. 当代码推送到`main`分支时，工作流自动触发
2. 使用Debian 12容器作为构建环境
3. 安装必要的系统依赖（git、curl、nodejs等）
4. 检出代码并设置Node.js和PNPM环境
5. 安装项目依赖并构建项目
6. 将构建输出（.output目录）打包为output.tar.gz
7. 从package.json中获取版本号
8. 计算提交次数并将其添加到版本号中
9. 生成更新日志（从上一个标签到当前提交的所有变更）
10. 创建GitHub Release，包括：
    - 版本标签（格式：v版本号.提交次数，例如v0.1.0.42）
    - 自动生成的更新日志
    - 构建输出压缩包（output.tar.gz）

## 使用方法

无需手动操作，只需将代码推送到`main`分支，GitHub Action将自动执行并创建新的发布版本。

如果需要更改发布版本号，请修改`package.json`文件中的`version`字段。

## 环境兼容性

构建过程在Debian 12环境中进行，确保生成的输出文件与目标部署环境（Debian 12）完全兼容。 