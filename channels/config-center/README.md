# 配置中心：从这里开始

双击 [index.html](index.html) 看本频道。项目总登录入口是 [根 index.html](../../index.html)，频道中文目录是 [项目目录页](../../app/project-index/index.html)。本频道依赖项目共享组件与运行时，单独复制此文件夹不是完整网站。

## 要修改什么，就找哪个文件

| 文件 | 中文用途 |
| --- | --- |
| [index.html](index.html) | 本频道入口薄壳与依赖声明；不是所有页面 DOM 的完整源码 |
| [announcement-management-view.js](announcement-management-view.js) | 公告示例数据与列表/编辑交互 |
| [announcement-management.css](announcement-management.css) | 公告管理样式 |
| [ant-source.css](ant-source.css) | 原站组件样式基线，非日常业务改版入口 |
| [config-center-content.css](config-center-content.css) | 组织架构主体与业务弹窗样式 |
| [config-center.css](config-center.css) | 配置中心导航与页面框架样式 |
| [config-center.js](config-center.js) | 组织架构、管理员、导入与频道交互 |
| [entry.js](entry.js) | 仅设置首次打开的默认 Hash，不是业务交互文件 |
| [source-dialogs.js](source-dialogs.js) | 配置弹窗适配源；构建时并入 source-markup.js |
| [source-markup.js](source-markup.js) | 生成文件：来自 templates 和 source-dialogs.js，不手工修改 |
| [templates.css](templates.css) | 配置 HTML 模板所用样式 |

已有主体、表单和示例行模板在 [templates/](templates/)；改完运行 `npm run build:templates`。组织调整、批量导入、公告编辑的固定结构也已迁入 markup-*.html；数据、条件与事件保留在对应 JS。

## 图片、图标和公共组件

私有图片/图标位于 [assets/](assets/)；公共字体、导航与复用 UI 由 `shared/`、`components/` 提供。频道资源只在 [channels.js](../../shared/config/channels.js) 登记，同一改动必须从其他频道入口也能看到。

HTML 不写内联样式或执行脚本；固定样式写 CSS，JS 用 class/data/hidden 切换状态。生成文件不手改；未知的编译分包不要凭文件名删除。

## 保存后怎么检查

入口或频道登记改变后运行 `npm run build:entries`；模板改变后运行 `npm run build:templates`。运行 `npm run check:standards`、`npm run check:knowledge`，行为改动按 [维护流程](../../docs/maintenance-workflow.md) 选择相关回归，再检查本频道直开及跨频道进入。

[全站验收记录](../../docs/final-acceptance-20260922.md) · [迁移准备清单](../../docs/desktop-to-documents-migration.md) · [文件数量与保留原因](../../docs/source-file-inventory.md)

本目录属于已正式迁移的文稿项目；桌面副本不自动同步。当前只允许本地提交，不推送、不部署，明确排除的候选不混入提交。

固定结构片段维护在本目录 templates/markup-*.html，修改后运行 `npm run build:templates`。对应 JS 顶部 @gaip-markup-cache 是生成缓存，不手改；其下保留业务数据和事件。
