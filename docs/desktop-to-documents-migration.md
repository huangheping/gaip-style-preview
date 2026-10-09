---
title: 桌面标准化成果迁移准备清单
updated: 2026-09-22
status: prepared-not-applied
tags:
  - maintenance
  - migration
---

# 桌面成果如何带到文稿项目

**本文保留迁移前准备清单；2026-09-25 正式应用进度与验收见 [[docs/formal-migration-20260923]]。** 桌面业务验收基准为 `27480714d372adcd3bcdffc2e024ba9569e37671`，验收结果见 [[docs/final-acceptance-20260922]]。两份项目不是自动同步关系，本地提交也不代表 GitHub 已更新。

## 当前差异决定了不能整包覆盖

2026-09-22 只读核查：文稿项目位于 `/Users/hhp/Documents/GAIP项目集/样式优化html`，当前提交 `4e28fac`，仍有未提交业务更新。状态快照保存在桌面 `outputs/final-acceptance/20260922/documents-status-before.txt`。该快照只记录文件状态，不替代文稿项目自己的完整备份。

需重点保留的文稿工作包括：学习课程/直播脚本与样式、直播示例数据、共享轮播、AI 重要提示及银行技术图片、登录视频候选、视觉台账和知识记录。桌面通过测试不能证明这些文稿增量已经迁入桌面。

## 可以复用的标准与需要改写的项目事实

| 内容 | 桌面位置 | 迁移方法与边界 |
| --- | --- | --- |
| 维护约定、任务路由 | AGENTS.md、.agents/skills/ | 合并已有规则；把“桌面测试副本”和绝对路径改成目标项目事实，不覆盖文稿原约定 |
| 频道/组件归属 | channels/、components/、shared/ | 复用目录结构，按下表迁移每个资源及消费者；不能只搬 CSS/JS |
| HTML、CSS、JS 分离检查 | scripts/check-project-structure.cjs、scripts/check-js-styles.cjs、scripts/js-style-audit.cjs | 配合 package.json/锁文件与模板采用；动态样式逐项复审，不把整个项目加入例外 |
| 原站例外 | shared/config/runtime-style-exceptions.json | 仅适用于当前 GAIP 文件摘要与表达式；不能直接发给新项目作为通用豁免 |
| 生成器与维护源 | scripts/build-html-templates.cjs、scripts/sync-entry-aliases.cjs、templates/ | 先迁维护源，再构建产物；生成脚本、模板、注册表和检查形成完整一组 |
| 中文目录与说明 | app/project-index/、目录说明.md、频道 README | 用目标注册表生成目录；重新核验文件链接，不保留失效旧入口 |
| Obsidian 项目知识 | knowledge/、docs/、PROJECT_STATE.md | 合并目标项目当前事实与索引；不复制桌面“已通过”结论充当目标验收 |
| 视觉修改台账 | design-changes/ | 保留文稿最新目标和首次基准，只调整迁移后的当前源码路径；不覆盖目标项目更新 |
| 本地 Git 规则 | docs/github-sync-rules.md、当前未发布变更.md | 保留目标已有未发布工作及排除项；只提交明确范围，继续禁止推送和部署 |
| AOCI 接入 | aoci*.txt、.aoci/、tools/aoci/ | 当前完整索引尚未建立；目标需按其自身状态接入，不能复制桌面收据或手写索引制造完成 |

## GAIP 旧目录到新目录的处理顺序

| 文稿中的旧位置 | 桌面对应位置 | 必须一起处理的关系 |
| --- | --- | --- |
| features/learning-center/ | channels/learning-center/ | 文稿课程/直播增量先保留，再合并到新的单一 learning-center.css；数据域与控制器仍独立 |
| 其他 features/<频道>/ | channels/<频道>/ | 按目标现存文件逐一匹配注册表、模板、弹窗登记与真实入口，不凭同名覆盖 |
| assets/learning/ 等频道素材 | 对应 channels/<频道>/assets/ | HTML/CSS/JS、Mock 和浏览器旧存储路径一起核对；保留旧图片路径的显示兼容，不清空学习进度 |
| AI Agent/ | components/ai-agent/ | 四份旧 CSS 的有效增量按覆盖次序汇入单一 CSS；素材和所有入口一同改路径 |
| shared 下的复用组件 | components/<组件>/ | 所有消费者、真实弹窗预览与缓存版本同步；组件只留一份源码 |
| 全局组件/ | components/ | 目录预览与业务调用同一实现；自动索引从真实源登记重新生成 |
| 根目录多个频道 HTML | channels/<频道>/index.html | 根 index.html 保持登录；中文说明放 app/project-index/index.html；Hash 导航保持同文档 |
| web/ | web/ 基线及频道 legacy/映射 | 不整包删除或覆盖；原站分包搬迁需配套 channel-bundles.js 和实际入口验证 |

## 不随迁移覆盖的内容

- 文稿 `.git/`、已有未提交修改、个人浏览器数据与本地学习进度。
- `node_modules/`、`outputs/`、工具二进制与临时缓存；目标依赖按锁文件安装，验收证据重新生成。
- 机器绝对路径的 `.codex/config.toml`、Obsidian workspace 状态及凭据。
- 当前未发布清单明确排除的登录视频实验、财富值候选图片、AI 候选素材和资讯参考分包。不能因迁移把它们加入正式依赖或提交。
- 桌面 GitHub 发布状态、测试通过记录和 AOCI 收据；它们不能代表文稿的状态。

## 真正迁移时的执行与回退

1. 重新只读核对文稿 HEAD、已暂存/未暂存修改和候选；这份清单不是未来状态快照。
2. 先保存文稿的完整恢复副本（包含未跟踪素材），再在独立目标副本演练。备份必须验证可恢复，不能只记一个提交号而遗漏未提交内容。
3. 以文稿当前内容为基础应用目录/检查/合并方法，逐项保留其后续业务变化；不要把桌面覆盖到文稿。
4. 在目标副本验证登录、12 频道直开/切换/刷新、图片、相关弹窗、学习记录兼容和目标新增功能。执行标准/知识检查与相称回归。
5. 保存差异清单与验收结果，才确定实际替换范围。未经迁移授权，不写入文稿；用户本次仅授权准备清单。
6. 使用本地提交和保留的完整副本作为回退依据；先在新目录验证恢复，不使用 `reset --hard` 或清理未跟踪文件来覆盖进行中的工作。

## 以后新项目

使用 `npm run new:project -- --target <新的明确目录> --title <项目名>`，新页面使用 `npm run new:page -- --id <id> --title <标题>`。这些命令提供骨架和项目内规则，不代表业务已经实现。新项目保持自己的 AGENTS、知识、索引和提交边界，不依赖桌面 GAIP 的个人缓存或历史例外。

[[docs/final-acceptance-20260922|桌面验收结果]] · [[docs/source-file-inventory|频道维护清单]] · [[docs/aoci-integration-blocker|AOCI 未完成项]]
