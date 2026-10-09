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

node -e 'require(process.argv[1])(process.argv[2], { includeLocal: true }).forEach(p => console.log(p))' "$ROOT/scripts/entry-files.cjs" "$ROOT" | while IFS= read -r entry; do
  page="$ROOT/$entry"
  if ! grep -q 'shared/scripts/channel-features.js' "$page"; then
    echo "错误：$(basename "$page") 未加载 channel-features.js。"
    exit 1
  fi
  if grep -q '<style>' "$page"; then
    echo "错误：$(basename "$page") 内嵌了频道样式，请移至 channels/。"
    exit 1
  fi
  # Inert source templates do not enlarge the active navigation shell.
  node -e 'require(process.argv[1]).checkShell(process.argv[2])' "$ROOT/scripts/build-page-views.cjs" "$page"
done

for virtual_page in "$ROOT/channels/wealth-center/index.html" "$ROOT/channels/news-center/index.html" "$ROOT/channels/learning-center/index.html"; do
  if grep -q '__GAIP_PAGE_OVERRIDE__' "$virtual_page"; then
    echo "错误：$(basename "$virtual_page") 仍会用入口文件强制覆盖当前 Hash，跨频道刷新可能回到错误页面。"
    exit 1
  fi
done


node --check "$ROOT/shared/config/channels.js"
node --check "$ROOT/shared/scripts/channel-entry-navigation.js"
node --check "$ROOT/shared/scripts/channel-features.js"
node --check "$ROOT/channels/proposal-center/proposal-center.js"
node "$ROOT/scripts/test-virtual-entry-refresh.cjs"

echo "通过：频道资源为单一源码，主导航保持 Hash 无刷新切换。"
