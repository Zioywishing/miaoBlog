#!/bin/bash

# 检查.output目录是否存在
if [ -d ".output" ]; then
    tar -czvf ./output.tar.gz .output
    mv output.tar.gz .output/output.tar.gz
fi

echo "You can preview this build using node .output/server/index.mjs"