#!/bin/bash

# 检查.output目录是否存在
if [ -d ".output" ]; then
    tar -czf ./output.tar.gz .output
    mv output.tar.gz .output/output.tar.gz
    echo "generate output.tar.gz finish"
fi