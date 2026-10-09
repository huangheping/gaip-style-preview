# GAIP 全局组件目录

此目录用于集中预览和登记项目中的全局组件。预览页直接加载组件所属位置的真实脚本和 CSS，不维护独立的演示版视觉样式。

## 文件结构

- `index.html`：可直接通过本地文件打开的组件目录。
- `components-registry.js`：组件名称、来源、调用方式和使用位置清单。
- `components-preview.js`：目录渲染和真实组件预览动作。
- `components-preview.css`：仅负责组件目录页面的布局样式。
- `弹窗预览.html`：真实源弹窗的隔离预览页。每个可预览弹窗在独立 iframe 中调用所属源码入口并只加载自己的资源，不改写 fixed/top-layer、遮罩、Portal 或组件视觉。
- `弹窗源登记.js`：45 类既有弹层的基线盘点，主要保留只读 Umi 路由触发项和历史排除项。
- `弹窗自动索引.generated.js`：由源 JS 中的 `@gaip-modal` 登记块自动生成；禁止手工编辑。
- `../shared/scripts/modal-registry.js`：合并基线与自动索引、校验唯一 ID，并通过登记的真实入口打开弹窗。
- `../scripts/generate-modal-catalog.cjs`：扫描 `shared/`、`channels/`、`components/` 的源登记块并生成自动索引；支持 `--check` 检查索引是否过期。
- `海报分享/`：文章海报分享的独立组件项目、模板图片和导出实现。
- `../components/multi-select/global-multi-select.js`：折叠式多选下拉的真实共享逻辑。
- `../components/multi-select/global-multi-select.css`：折叠式多选下拉的真实共享样式。

## 结构维护边界

组件的固定视觉样式位于各自 CSS；目录卡片、重要提示、操作日志和业务弹层的固定结构已迁入所属 templates/markup-*.html，JS 保留数据与事件。维护方式和边界见 [HTML 结构迁移](../docs/markup-source-completion-20260925.md)。

## 新增规则

1. 全局组件实现统一放在 `components/<component-id>/`，私有资产放该组件目录的 `assets/`。公共导航、注册器等应用能力保留在 `shared/`。
2. 普通全局组件在 `components-registry.js` 中登记；业务弹窗则在真实源 JS 内添加 `@gaip-modal` JSON 登记块，并暴露真实打开入口。
3. 弹窗登记完成后运行 `node scripts/generate-modal-catalog.cjs`；预览页通过通用注册器打开，不再为每个弹窗增加手写分支。
4. 预览页不得复制组件实现或单独维护一套组件样式。

## 弹窗盘点口径

数量以 `npm run check:modals` 的实时输出为准，不在说明文档重复维护。原站分包弹窗与本地登记弹窗的来源/排除理由见真实登记和自动索引。

同步机制不是复制 HTML/CSS：本地共享项由 iframe 加载登记的真实 CSS/脚本，`modal-registry.js` 根据 `invoke` 调用同一 API；Umi 业务项则进入正式 Hash 页面，由只在 `gaip-popup-preview` 标记存在时启用的桥接脚本点击真实页面入口。父页初始只建立轻量卡片与等高占位，卡片进入可见区域或用户点击“立即加载”后才创建对应 iframe；正式频道项继续最多 3 个并发。真实弹窗出现后，桥接脚本直接删除弹窗之外的频道页面 DOM，只保留弹窗所在分支、原遮罩、Portal 和视觉样式，不再用覆盖层隐藏整页。配置中心直接源预览使用空的样式作用域宿主，不生成组织架构页面。父预览页只控制卡片、状态、按需加载和 iframe 尺寸，不保存弹窗 DOM 或视觉规则，因此源结构或 CSS 修改后刷新即可同步。无法由当前正式页面抵达的旧登记必须明确排除，不得用通用 Modal/Drawer、类名拼装或复制 DOM 伪造预览。

子 iframe 使用项目根目录作为动态资源基准；登记表中的 CSS、JS、SVG 和图片路径均按 `shared/`、`channels/`、`web/` 等根目录相对路径填写，避免被误解析到 `components/` 目录。

## 当前组件

| 组件 | 全局入口 | 当前使用位置 |
| --- | --- | --- |
| AI 内容重要提示 | `window.__GAIP_AI_NOTICE__.show(options)` | AI Agent、资讯中心 |
| 折叠式多选下拉 | `window.__GAIP_MULTI_SELECT__.mount(root, options)` | 活动中心筛选视觉标准、其他多选筛选场景 |
| 文章海报分享 | `window.__GAIP_POSTER_SHARE__.open(article)` | 资讯中心列表、文章详情、全局组件目录 |
| 真实弹窗预览 | `window.__GAIP_MODAL_SOURCE_CATALOG__` | 全局组件目录入口、实时登记的真实源弹窗集中预览 |

“真实弹窗预览”卡片只加载轻量目录登记并实时显示可预览、待接入和不展示数量；点击后在独立页面打开 `弹窗预览.html`。组件目录首页不创建弹窗 iframe，因此不会重复加载所有频道页面。

固定结构片段维护在本目录 templates/markup-*.html，修改后运行 `npm run build:templates`。对应 JS 顶部 @gaip-markup-cache 是生成缓存，不手改；其下保留业务数据和事件。
