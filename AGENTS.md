# GAIP 本地静态版维护规则

## 页面架构

- 根目录的各个 `*.html` 是“初始入口薄壳”，不是频道改版源码。
- 主导航必须继续使用 Umi 的 Hash SPA 路由（`#/workspace`、`#/proposal` 等）。
- 禁止为主导航使用 `location.href`、`location.assign()`、`location.replace()` 或刷新页面。
- `shared/scripts/channel-entry-navigation.js` 只允许同步地址栏文件名，不得触发整页导航。

## 频道改版

- 页面专属 CSS/JS 必须放在 `features/<频道>/` 中，并作为唯一源码维护。
- 禁止把大段页面专属 `<style>` 或 `<script>` 内嵌回某个根目录 HTML。
- 在 `shared/config/channels.js` 对应频道的 `assets.styles` / `assets.scripts` 中登记资源。
- `shared/scripts/channel-features.js` 会在每个入口预加载已登记资源，保证从任何 HTML 通过 Hash 无刷新切换时都显示同一新版。
- 不要直接修改 `web/` 中下载的 Umi 主包和分包；这些是原站基线文件。

## 修改后的必做检查

运行：

```sh
./scripts/verify-local-navigation.sh
```

并至少验证两条路径：

1. `工作台.html#/workspace` → 被改版频道 → 另一个频道。
2. 任意其他 HTML → 被改版频道。

验证过程中，URL 的 Hash 可以变化，但页面不得发生整页刷新；被改版频道必须显示 `features/` 中的最新版。
