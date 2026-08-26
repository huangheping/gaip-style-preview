# GAIP 本地静态版维护规则

## 每次任务的知识库工作流

- 开始任何修改前，先读取根目录 `PROJECT_STATE.md` 和 `knowledge/INDEX.md`。
- 再按任务范围读取对应的页面笔记、公共模块笔记和被其链接的详细文档；禁止为了获取上下文而默认读取整个知识库。
- `git status`、`git diff` 和实际源码是代码事实源；知识库用于说明范围、关系、原因、风险和当前状态，不能代替 Git。
- Codex 任务 ID 可以记录在变更笔记的“来源”中，但只能用于追溯，不作为判断当前代码状态的依据。
- 修改前在 `knowledge/变更/当前未发布变更.md` 登记目标、范围和状态；完成后补充实际文件、验证结果，并同步 `PROJECT_STATE.md`。
- 修改了页面入口、路由、共享模块或模块边界时，必须同步对应页面/模块笔记；只改具体数值且关系未变化时，只更新当前变更记录即可。
- 已发布后，把本次内容从“当前未发布变更”迁移为 `knowledge/变更/YYYY-MM-DD-主题.md`，并在 `PROJECT_STATE.md` 记录提交号。
- 不把临时分析、长日志、完整 `git diff` 或聊天全文写进知识库；只沉淀能够帮助后续工作的结论。

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

最后还要核对：

1. `knowledge/变更/当前未发布变更.md` 中记录的文件与 `git diff --name-only` 一致。
2. `PROJECT_STATE.md` 能准确说明当前进行中、待验证、待发布和已知问题。
