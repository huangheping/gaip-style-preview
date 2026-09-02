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

for virtual_page in "$ROOT/财富值中心.html" "$ROOT/资讯中心.html" "$ROOT/学习中心.html"; do
  if grep -q '__GAIP_PAGE_OVERRIDE__' "$virtual_page"; then
    echo "错误：$(basename "$virtual_page") 仍会用入口文件强制覆盖当前 Hash，跨频道刷新可能回到错误页面。"
    exit 1
  fi
done

if ! grep -q "gaip-channel=wealth" "$ROOT/财富值中心.html" ||
   ! grep -q "gaip-channel=news" "$ROOT/资讯中心.html" ||
   ! grep -q "gaip-channel=learning" "$ROOT/学习中心.html"; then
  echo "错误：虚拟频道入口缺少无 Hash 时的默认频道参数。"
  exit 1
fi

node --check "$ROOT/shared/config/channels.js"
node --check "$ROOT/shared/scripts/channel-entry-navigation.js"
node --check "$ROOT/shared/scripts/channel-features.js"
node --check "$ROOT/features/proposal-center/proposal-center.js"
node "$ROOT/scripts/test-virtual-entry-refresh.cjs"

echo "通过：频道资源为单一源码，主导航保持 Hash 无刷新切换。"
