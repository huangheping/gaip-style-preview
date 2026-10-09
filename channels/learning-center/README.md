# 学习中心：从这里开始

双击 [index.html](index.html) 看本频道。项目总登录入口是 [根 index.html](../../index.html)，频道中文目录是 [项目目录页](../../app/project-index/index.html)。本频道依赖项目共享组件与运行时，单独复制此文件夹不是完整网站。

## 要修改什么，就找哪个文件

| 文件 | 中文用途 |
| --- | --- |
| [index.html](index.html) | 本频道入口薄壳与依赖声明；不是所有页面 DOM 的完整源码 |
| [entry.js](entry.js) | 仅设置首次打开的默认 Hash，不是业务交互文件 |
| [learning-app.js](learning-app.js) | 课程管理、编辑、学习与学情交互 |
| [learning-center.css](learning-center.css) | 学习频道唯一样式入口：按首页、课程管理、直播分段 |
| [learning-center.js](learning-center.js) | 学习页面挂载和导航 |
| [learning-data.js](learning-data.js) | 课程数据、权限、进度和存储规则 |
| [learning-live-data.js](learning-live-data.js) | 直播数据、上下架状态、日志和存储规则 |
| [learning-live.js](learning-live.js) | 直播首页与管理交互 |
| [templates.generated.js](templates.generated.js) | 生成文件：来自 templates 中的 HTML，不手工修改 |

首页骨架在 [templates/home.html](templates/home.html)；改完运行 `npm run build:templates`。课程管理/编辑、学情与直播表单的固定结构已迁入 markup-learning-app.html 与 markup-learning-live.html；JS 保留动态数据和事件。

## 图片、图标和公共组件

私有图片/图标位于 [assets/](assets/)；公共字体、导航与复用 UI 由 `shared/`、`components/` 提供。频道资源只在 [channels.js](../../shared/config/channels.js) 登记，同一改动必须从其他频道入口也能看到。

HTML 不写内联样式或执行脚本；固定样式写 CSS，JS 用 class/data/hidden 切换状态。生成文件不手改；未知的编译分包不要凭文件名删除。

## 保存后怎么检查

入口或频道登记改变后运行 `npm run build:entries`；模板改变后运行 `npm run build:templates`。运行 `npm run check:standards`、`npm run check:knowledge`，行为改动按 [维护流程](../../docs/maintenance-workflow.md) 选择相关回归，再检查本频道直开及跨频道进入。

[全站验收记录](../../docs/final-acceptance-20260922.md) · [迁移准备清单](../../docs/desktop-to-documents-migration.md) · [文件数量与保留原因](../../docs/source-file-inventory.md)

本目录属于已正式迁移的文稿项目；桌面副本不自动同步。当前只允许本地提交，不推送、不部署，明确排除的候选不混入提交。

固定结构片段维护在本目录 templates/markup-*.html，修改后运行 `npm run build:templates`。对应 JS 顶部 @gaip-markup-cache 是生成缓存，不手改；其下保留业务数据和事件。
