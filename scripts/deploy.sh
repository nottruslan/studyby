#!/usr/bin/env bash
set -e
if [ -z "$*" ]; then
  echo "Укажи сообщение коммита: npm run deploy -- \"описание изменений\""
  exit 1
fi
git add .
git commit -m "$*"
git push
