#!/bin/bash
# Replace better_sqlite3.node file
if [ -f "better_sqlite3_linux_amd64.node" ] && [ -d ".output/server/node_modules/better-sqlite3/build/Release" ]; then
    cp better_sqlite3_linux_amd64.node .output/server/node_modules/better-sqlite3/build/Release/better_sqlite3.node
    echo "Replacement of better_sqlite3.node file completed"
fi

# 检查.output目录是否存在
if [ -d ".output" ]; then
    tar -czf ./output.tar.gz .output
    mv output.tar.gz .output/output.tar.gz
    echo "generate output.tar.gz finish"
fi