#!/bin/bash

echo "start update miaoBlog"

# 停止 pm2 服务
pm2 stop miaoBlog

# 删除指定的文件和文件夹
rm -rf server public nitro.json

# 解压 .output.tar.gz 到当前目录
tar -xzvf output.tar.gz -C . --strip-components=1

rm -f output.tar.gz

# 重新启动 pm2 服务
pm2 start miaoBlog

echo "update miaoBlog Success"