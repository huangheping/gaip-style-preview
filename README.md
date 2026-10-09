> 本目录是文稿中的正式工作项目。2026-09-25 正式目录迁移结果见 [[docs/formal-migration-20260923]]；本地提交不代表已推送。

# GAIP 文稿工作项目

历史方法依据：[整站验收](docs/final-acceptance-20260922.md) · [迁移准备清单](docs/desktop-to-documents-migration.md)。每个正式频道文件夹的 README 都有中文维护入口。


双击 [index.html](index.html) 仍打开登录页。另有 [中文项目目录](app/project-index/index.html) 可直接选择频道；目录说明不替换登录页。根目录只保留一个 HTML，频道入口在自己的目录内。

**不知道文件夹装什么，先看 [目录说明](目录说明.md)。** 日常页面在 channels，共用组件在 components，项目知识在 knowledge。CSS、JS 数量与用途见 [文件说明](docs/source-file-inventory.md)。

本项目在文稿原路径继续开发，桌面测试与演练副本不会自动同步回来。本轮允许本地 Git 提交，禁止推送或部署。

## 频道中文对照

| 中文频道 | 文件夹 | 页面入口 |
| --- | --- | --- |
| 工作台总览 | [channels/workspace](channels/workspace/README.md) | [打开页面](channels/workspace/index.html) |
| 客户中心360 | [channels/customer](channels/customer/README.md) | [打开页面](channels/customer/index.html) |
| 保单列表 | [channels/policy](channels/policy/README.md) | [打开页面](channels/policy/index.html) |
| 方案中心 | [channels/proposal-center](channels/proposal-center/README.md) | [打开页面](channels/proposal-center/index.html) |
| 产品中心 | [channels/product](channels/product/README.md) | [打开页面](channels/product/index.html) |
| 活动中心 | [channels/activity](channels/activity/README.md) | [打开页面](channels/activity/index.html) |
| 资讯中心 | [channels/news-center](channels/news-center/README.md) | [打开页面](channels/news-center/index.html) |
| 财富值中心 | [channels/wealth-center](channels/wealth-center/README.md) | [打开页面](channels/wealth-center/index.html) |
| 配置中心 | [channels/config-center](channels/config-center/README.md) | [打开页面](channels/config-center/index.html) |
| 薄荷入职引导 | [channels/induction](channels/induction/README.md) | [打开页面](channels/induction/index.html) |
| 线索中心 | [channels/clues](channels/clues/README.md) | [打开页面](channels/clues/index.html) |
| 学习中心 | [channels/learning-center](channels/learning-center/README.md) | [打开页面](channels/learning-center/index.html) |
| 登录页 | [channels/login](channels/login/README.md) | [打开页面](channels/login/index.html) |
| 登录视频实验（本地候选） | channels/login-video-test | 可选目录内的 index.html，不纳入本轮提交 |

## 维护与生成

频道入口、路由和资源只登记在 shared/config/channels.js。频道 index.html 是维护源；npm run build:entries 生成根登录入口、独立中文项目目录和结构清单，不再复制其他根目录别名。Hash 导航保持同文档切换。

- `npm test`：结构、模板、知识、生成器和现有业务回归。
- `npm run build:templates`：修改频道 HTML 模板后生成 file 预览所需的模板脚本。
- `npm run build:entries`：修改频道登记或目录页模板后生成登录入口与独立中文目录。
- `npm run new:page -- --id example --title 示例页面`：生成独立页面骨架，业务实现与 SPA 接入仍需完成。
- `npm run new:project -- --target /明确的新项目路径 --title 新项目`：生成项目自己的规范、知识和检查；拒绝覆盖，不建立远端，不复制旧 AOCI 认知。

旧入口已逐文件校验并保存于 outputs/standardization/20260922/root-entry-migration/legacy-entries，仅用于追溯，不作为当前预览入口。历史资料在 docs/archive；outputs 与 node_modules 不参与 Git 同步。

9 组旧频道已改为 HTML 模板、page.css 与 page.js，详见 [页面维护说明](docs/html-source-restoration-20260925.md)。自有结构片段与固定图片归属已补齐，AOCI 正式文本索引已通过治理对齐；框架运行时、必要动态样式及现场验收边界见 [实际状态](docs/standardization-status.md)。

[组件预览](components/index.html) · [知识总索引](knowledge/INDEX.md) · [维护规则](AGENTS.md) · [本地同步规则](docs/github-sync-rules.md)
