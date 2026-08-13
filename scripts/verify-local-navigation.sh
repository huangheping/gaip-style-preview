#!/bin/sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
NAV="$ROOT/shared/scripts/channel-entry-navigation.js"

if grep -Eq 'location\.(assign|replace)[[:space:]]*\(|location\.href[[:space:]]*=|window\.location[[:space:]]*=' "$NAV"; then
  echo "错误：主导航脚本包含整页跳转。"
  exit 1
fi

if ! grep -q 'history.replaceState' "$NAV" || ! grep -q "addEventListener('hashchange'" "$NAV"; then
  echo "错误：Hash 无刷新导航保护逻辑缺失。"
  exit 1
fi

for page in "$ROOT"/*.html; do
  if ! grep -q 'shared/scripts/channel-features.js' "$page"; then
    echo "错误：$(basename "$page") 未加载 channel-features.js。"
    exit 1
  fi
  if grep -q '<style>' "$page"; then
    echo "错误：$(basename "$page") 内嵌了频道样式，请移至 features/。"
    exit 1
  fi
  if [ "$(wc -c < "$page")" -gt 20000 ]; then
    echo "错误：$(basename "$page") 不再是入口薄壳，请将改版代码移至 features/。"
    exit 1
  fi
done

node --check "$ROOT/shared/config/channels.js"
node --check "$ROOT/shared/scripts/channel-entry-navigation.js"
node --check "$ROOT/shared/scripts/channel-features.js"
node --check "$ROOT/features/proposal-center/proposal-center.js"

echo "通过：频道资源为单一源码，主导航保持 Hash 无刷新切换。"
