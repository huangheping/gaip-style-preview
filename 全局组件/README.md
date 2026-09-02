# GAIP 全局组件目录

此目录用于集中预览和登记项目中的全局组件。预览页直接加载组件所属位置的真实脚本和 CSS，不维护独立的演示版视觉样式。

## 文件结构

- `index.html`：可直接通过本地文件打开的组件目录。
- `components-registry.js`：组件名称、来源、调用方式和使用位置清单。
- `components-preview.js`：目录渲染和真实组件预览动作。
- `components-preview.css`：仅负责组件目录页面的布局样式。
- `弹窗预览.html`：真实源弹窗的隔离预览页。每个可预览弹窗在独立 iframe 中调用所属源码入口并只加载自己的资源，不改写 fixed/top-layer、遮罩、Portal 或组件视觉。
- `弹窗源登记.js`：45 类已盘点弹层的类型、来源、状态和真实资源登记；不包含弹窗 HTML/CSS。抽屉、Agent 主面板及已下线/不可达/非独立弹窗项只保留盘点信息，不进入预览。
- `海报分享/`：文章海报分享的独立组件项目、模板图片和导出实现。
- `../shared/scripts/global-multi-select.js`：折叠式多选下拉的真实共享逻辑。
- `../shared/styles/global-multi-select.css`：折叠式多选下拉的真实共享样式。

## 新增规则

1. 全局组件实现继续放在 `shared/scripts`、`shared/styles` 或对应的共享资源目录中。
2. 在 `components-registry.js` 中登记组件、真实来源文件和项目使用位置。
3. 在 `components-preview.js` 的 `runPreview` 中接入真实组件的预览动作。
4. 预览页不得复制组件实现或单独维护一套组件样式。

## 弹窗盘点口径

当前共盘点 45 类：28 类进入真实源 iframe 预览，待接入为 0，17 类不展示。17 类包括 6 类抽屉、用户明确排除的“GAIP Agent 助手主面板”，以及 10 类经当前 Hash 路由和源码复核确认已下线、入口不可达或本身并非独立弹窗的旧登记。配置中心四类调用正式页完整控制器；另外 15 类只读 Umi 业务弹窗通过正式频道页面和真实 DOM 点击入口打开。相同结构的新增/编辑合并为一种；普通下拉菜单、Tooltip、Toast 和日期面板等非业务弹层不计入。

同步机制不是复制 HTML/CSS：本地共享项由 iframe 加载登记的真实 CSS/脚本并调用同一 API；Umi 业务项则进入正式 Hash 页面，由只在 `gaip-popup-preview` 标记存在时启用的桥接脚本点击真实页面入口。全部 iframe 主动加载并回报成功/失败；真实弹窗出现后，桥接脚本只添加中性背景隔离层遮住频道正文，原弹窗、遮罩、Portal 和视觉样式不变。父预览页只控制卡片、状态和 iframe 尺寸，不保存弹窗 DOM 或视觉规则，因此源结构或 CSS 修改后刷新即可同步。无法由当前正式页面抵达的旧登记必须明确排除，不得用通用 Modal/Drawer、类名拼装或复制 DOM 伪造预览。

子 iframe 使用项目根目录作为动态资源基准；登记表中的 CSS、JS、SVG 和图片路径均按 `shared/`、`features/`、`web/` 等根目录相对路径填写，避免被误解析到 `全局组件/` 目录。

## 当前组件

| 组件 | 全局入口 | 当前使用位置 |
| --- | --- | --- |
| AI 内容重要提示 | `window.__GAIP_AI_NOTICE__.show(options)` | AI Agent、资讯中心 |
| 折叠式多选下拉 | `window.__GAIP_MULTI_SELECT__.mount(root, options)` | 活动中心筛选视觉标准、其他多选筛选场景 |
| 文章海报分享 | `window.__GAIP_POSTER_SHARE__.open(article)` | 资讯中心列表、文章详情、全局组件目录 |
