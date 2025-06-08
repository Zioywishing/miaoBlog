#!/bin/bash

# 替换better_sqlite3.node文件
if [ -f "better_sqlite3_linux_amd64.node" ] && [ -d ".output/server/node_modules/better-sqlite3/build/Release" ]; then
    cp better_sqlite3_linux_amd64.node .output/server/node_modules/better-sqlite3/build/Release/better_sqlite3.node
    echo "替换better_sqlite3.node文件完成"
fi

# 检查.output目录是否存在
if [ -d ".output" ]; then
    tar -czf ./output.tar.gz .output
    mv output.tar.gz .output/output.tar.gz
    echo "generate output.tar.gz finish"
fi