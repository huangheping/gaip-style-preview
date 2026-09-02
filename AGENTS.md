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

## “本地”与预览地址约定

- 用户说“本地”时，默认指当前本地项目文件及既有 `file://` 预览方式，不得自行把交付地址改成 `127.0.0.1`、`localhost` 或其他 HTTP 地址。
- 只有自动化验证确实受 `file://` 限制时，才可临时启动本机 HTTP 服务；该地址仅用于内部测试，不作为用户的预览入口或交付地址。
- 临时 HTTP 服务和测试标签页必须在验证后关闭，不改动或替换用户已有的浏览器标签页。

## 频道改版

- 页面专属 CSS/JS 必须放在 `features/<频道>/` 中，并作为唯一源码维护。
- 禁止把大段页面专属 `<style>` 或 `<script>` 内嵌回某个根目录 HTML。
- 在 `shared/config/channels.js` 对应频道的 `assets.styles` / `assets.scripts` 中登记资源。
- `shared/scripts/channel-features.js` 会在每个入口预加载已登记资源，保证从任何 HTML 通过 Hash 无刷新切换时都显示同一新版。
- 不要直接修改 `web/` 中下载的 Umi 主包和分包；这些是原站基线文件。

## 新增或修改弹窗的强制契约

- 新增可预览业务弹窗时，必须在真实弹窗源 JS 中加入一个合法的 `/* @gaip-modal { ... } */` JSON 登记块，并暴露同一真实 `open()` / `show()` / `create()` 入口；禁止只在频道页面内新增未登记弹窗，也禁止在预览页复制第二套 DOM 或样式。
- 登记块至少包含 `id`、`title`、`channel`、`type`、`status`。直接源预览还必须包含 `invoke.path`、`styles`、`scripts`；返回未挂载节点的工厂使用 `resultMode: "append"`，需要入场类时使用 `resultMode: "append-open-class"`。
- `id` 必须全项目唯一并使用小写字母、数字和连字符。抽屉使用 `type: "drawer"` 且不进入当前弹窗预览；明确不展示、已下线或不可达项使用 `status: "excluded"` 并写明 `reason`。
- 修改登记块后必须运行 `node scripts/generate-modal-catalog.cjs`，并将生成的 `全局组件/弹窗自动索引.generated.js` 一并保留；禁止手工编辑生成文件。
- 完成弹窗任务前必须运行 `node scripts/generate-modal-catalog.cjs --check` 与 `node scripts/test-popup-preview.cjs`。测试会阻止过期索引、重复 ID、缺失资源和预览页手写分支重新出现。
- 现有只读 Umi 分包中的路由触发项和历史排除项暂由 `全局组件/弹窗源登记.js` 保留基线盘点；新增本地源码弹窗不得继续写入这份基线表。

## 新增或修改主导航的强制契约

- 开始新增频道、二级导航或调整主导航前，必须先读取 `knowledge/公共模块/主导航与Hash路由.md` 的“主导航交互与样式契约”，不得在频道内另写一套父项交互或对齐规则。
- 一级叶子频道点击后才执行 Hash 无刷新导航；带 `[data-gaip-main-menu-toggle]` 的一级父项只能展开/收起，点击不得改变 Hash、打开默认子页或触发任何频道的离开逻辑。二级项才执行真实导航。
- 可展开父项的 `is-open` 与 `is-current` 必须分离：开合只反映子菜单可见性；任一二级项当前时，父项仅将图标、文字和箭头变为 `#025b52`，父项背景与左边框保持透明。绿色浅底和 `4px` 品牌绿左边框只属于当前二级项；父项 hover 统一为中性灰浅底。
- 展开侧栏统一使用 40px 行高、4px 透明左边框占位、父项左内边距 24px、18px 图标列、13px 图文间距、二级项左内边距 55px；基于 208px 侧栏时图标左边为 36px，一级与二级文字左边均为 67px。箭头固定在右侧 16px，不得随文字长度移动。
- 图标必须优先复用线上/项目原始资产，不得自行重画。固定填色的 `<img>` 需要当前态变色时，保留原图可见并使用 CSS 滤镜；不得先隐藏原图再依赖外部 SVG 蒙版。内联原图本身支持 `currentColor` 时可直接继承。
- 主导航滚动必须使用共享的 `.gaip-sidebar-nav-scroll`：滚动条贴侧栏右缘、默认低对比度，且层级高于百宝箱上延底图。不得在单个频道里覆盖滚动条位置、颜色或底图层级。
- 父项必须支持 Enter/空格开合、Esc 收起，并同步 `aria-expanded` / `aria-hidden`；箭头按 `is-open` 旋转 180°/180ms，减少动态偏好下取消动画。
- 所有跨频道捕获监听必须忽略 `[data-gaip-main-menu-toggle]`。完成后必须运行 `scripts/test-expandable-main-nav.cjs` 和 `./scripts/verify-local-navigation.sh`，并验证普通频道、当前频道父项、二级当前项及另一个可展开父项。

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
