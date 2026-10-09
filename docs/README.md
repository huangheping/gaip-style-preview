# GAIP 本地预览版

正式迁移与验收：[[docs/formal-migration-20260923]]。历史桌面依据：[[docs/final-acceptance-20260922|整站验收]] · [[docs/desktop-to-documents-migration|迁移准备清单]]。每个正式频道文件夹的 README 都有中文维护入口。


## 使用方式

双击根目录的 `index.html` 进入登录页；文件说明和频道捷径在 `app/project-index/index.html`，任意填写非空账号和密码即可登录。

也可以直接打开 `channels/workspace/index.html`、`channels/product/index.html`、`channels/induction/index.html` 等独立频道入口。

主导航沿用 Umi Hash 路由进行无刷新切换。共享脚本只同步地址栏中的频道文件名，
并将入口根目录锁定为当前 `样式优化html/`；不会重新加载页面，也不会引用工作区内
其他同名目录。登录成功后的工作台跳转同样遵循这一规则。

配置中心可从侧栏展开，或直接打开 `channels/config-center/index.html`。包含“组织架构”和“操作日志”二级页面；组织与日志均为本地模拟数据，不写入线上系统。

## 开发检查（预览网站无需安装）

维护代码时，在实际 Git 根使用 Node 24 / npm 11：

```sh
npm ci --include=dev --ignore-scripts --no-fund
npm test
```

测试依赖只用于开发；`npm test` 包含现有静态与 DOM 回归，不代表真实浏览器验收通过。单项命令、已知失败和官方依据见 [工程基线](official-engineering-baseline.md)，真实操作步骤见 [浏览器回归清单](browser-regression-checklist.md)。双击 HTML 不需要运行以上命令。

## 目录说明

- 根目录：仅 index.html 登录入口；中文目录在 app/project-index/index.html；频道入口位于 channels 下。
- `shared/`：跨频道共用的样式与脚本。
- `shared/config/channels.js`：频道名称、路由、入口文件、图标和页面类型的唯一配置源。
- `channels/`：学习中心、线索中心、工作台及频道本地 Mock 等功能专属代码。
- `channels/<频道>/assets/`：频道图片、图标、视频和文档；公共字体在 `shared/assets/fonts/`。
- `components/`：共享组件真实源码、组件资产及预览目录。
- `docs/`：使用说明、结构规范和修改记录。
- `docs/archive/qa/`：页面一致性审计截图。
- `web/`：原始 Umi 构建产物，不手动改名或移动。
- `components/ai-agent/`：AI 助手运行时文件。原构建引用由本地兼容运行时适配，新路径为组件的唯一维护源。

全局字体、字重、滚动条等跨页面调整统一记录在
[`global-style-changelog.md`](./global-style-changelog.md)，后续可直接作为前端交接清单。

频道首页的代码审计、结构命名和页面类型规范分别见：

- [`channel-home-code-audit.md`](./channel-home-code-audit.md)
- [`channel-home-standard.md`](./channel-home-standard.md)
- [`channel-structure.md`](./channel-structure.md)

新增或修改频道时，先更新 `shared/config/channels.js`，页面脚本不得再单独维护一份
频道名称、路由或入口文件映射。

## 说明

此版本直接加载原站下载的 HTML 入口、CSS、JavaScript 分包和图片资源，没有重新编写原页面样式。只调整了本地运行所需的相对资源路径、Hash 路由、登录验证和本地空数据响应。

本地 Mock 按功能拆分：保留原有线索中心和产品中心数据，并为工作台总览、客户中心、
保单列表、方案中心和活动中心补充相互关联的预览数据。工作台覆盖概览指标、客户转化
漏斗、今日焦点和续保预警；学习中心和薄荷入职指引使用页面自带的静态内容，不重复 Mock。

所有固定图片、图标和字体均保存在本文件夹内。`file://` 页面无法连接需要登录会话的原站后台，因此这里只保证前端页面和本地资源可预览；真实账号登录、真实接口数据和线上业务操作不属于离线静态文件。

## 标准化维护入口

目录导航见 [根说明](../README.md)，实际完成度见 [标准化状态](standardization-status.md)。根 index.html 为生成的登录入口，app/project-index/index.html 为中文目录，修改频道登记或目录模板后运行 `npm run build:entries`；配置中心/学习首页 HTML 模板修改后运行 `npm run build:templates`。`npm test` 先执行结构、模板、知识链接和新项目生成器验证，再执行业务回归。
