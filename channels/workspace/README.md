# 工作台总览：从这里开始

双击 [index.html](index.html) 看本频道。项目总登录入口是 [根 index.html](../../index.html)，频道中文目录是 [项目目录页](../../app/project-index/index.html)。本频道依赖项目共享组件与运行时，单独复制此文件夹不是完整网站。

## 要修改什么，就找哪个文件

| 文件 | 中文用途 |
| --- | --- |
| [index.html](index.html) | 本频道入口与可编辑页面 HTML 模板（@gaip-page-views 区段） |
| [page.css](page.css) | 页面基础样式及从 JS 迁出的固定样式 |
| [page.js](page.js) | 页面状态、数据和事件；文件顶部缓存由 HTML 生成 |
| [entry.js](entry.js) | 仅设置首次打开的默认 Hash，不是业务交互文件 |
| [workspace-update.css](workspace-update.css) | 工作台改版样式 |
| [workspace-update.js](workspace-update.js) | 工作台模块、行情与本地交互 |

9 组旧频道分包已改为 HTML 模板、page.css 与 page.js。修改结构/静态文字请编辑 index.html 的模板区段，然后运行 `npm run build:templates`；page.js 仅顶部 `@gaip-page-cache` 区段自动生成，其下业务绑定可维护。动态数据、事件和 React 组件仍由原 Umi 运行时驱动，不是单文件无依赖网页，也不是恢复原始 TSX 工程。

详细维护例子与边界见 [HTML 源码维护说明](../../docs/html-source-restoration-20260925.md)。

## 图片、图标和公共组件

私有图片/图标位于 [assets/](assets/)；公共字体、导航与复用 UI 由 `shared/`、`components/` 提供。频道资源只在 [channels.js](../../shared/config/channels.js) 登记，同一改动必须从其他频道入口也能看到。

HTML 不写内联样式或执行脚本；固定样式写 CSS，JS 用 class/data/hidden 切换状态。生成文件不手改；未知的编译分包不要凭文件名删除。

## 保存后怎么检查

入口或频道登记改变后运行 `npm run build:entries`；模板改变后运行 `npm run build:templates`。运行 `npm run check:standards`、`npm run check:knowledge`，行为改动按 [维护流程](../../docs/maintenance-workflow.md) 选择相关回归，再检查本频道直开及跨频道进入。

[全站验收记录](../../docs/final-acceptance-20260922.md) · [迁移准备清单](../../docs/desktop-to-documents-migration.md) · [文件数量与保留原因](../../docs/source-file-inventory.md)

本目录属于已正式迁移的文稿项目；桌面副本不自动同步。当前只允许本地提交，不推送、不部署，明确排除的候选不混入提交。

固定结构片段维护在本目录 templates/markup-*.html，修改后运行 `npm run build:templates`。对应 JS 顶部 @gaip-markup-cache 是生成缓存，不手改；其下保留业务数据和事件。
