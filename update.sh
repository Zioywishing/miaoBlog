#!/bin/bash

echo "start update miaoBlog"

# ֹͣ pm2 ����
pm2 stop miaoBlog

# ɾ��ָ�����ļ����ļ���
rm -rf server public nitro.json

# ��ѹ .output.tar.gz ����ǰĿ¼
tar -xzvf output.tar.gz -C . --strip-components=1

rm -f output.tar.gz

# �������� pm2 ����
pm2 start miaoBlog

echo "update miaoBlog Success"