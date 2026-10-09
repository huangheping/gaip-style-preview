---
type: index
project: GAIP 本地静态预览版
---

# 项目知识总索引

这是“样式优化html”项目的 Obsidian 导航入口。建议在 Obsidian 中把项目根目录作为 Vault 打开；无需移动现有源码或 `docs/`。

## 上下文读取顺序

1. 新任务确认：[[PROJECT_STATE|当前项目状态]]、[[AGENTS|AI 维护规则]] 的相关约束；已加载且未变化时复用，不要求每次编辑重读。
2. 按任务读取：[[页面/页面索引|页面索引]] 或 [[公共模块/公共模块索引|公共模块索引]] 中对应笔记。
3. 需要解释原因时读取：[[决策/决策索引|决策索引]]。
4. 需要追溯时读取：[[变更/变更索引|变更索引]]、`docs/` 或任务 ID。

## 索引

- [[docs/final-acceptance-20260922|桌面整站验收]]、[[docs/desktop-to-documents-migration|迁移准备清单]]：本地通过范围、已知限制与文稿工作保护。

- [[目录说明|文件夹中文说明]]、[[docs/source-file-inventory|CSS/JS 文件用途]]：入口、资源与备份位置。

- [[页面/页面索引|页面索引]]：已登记主导航频道的入口、路由、源码、关联和边界。
- [[公共模块/公共模块索引|公共模块索引]]：导航、框架、资源加载、本地 Mock、AI Agent。
- [[决策/决策索引|决策索引]]：不能被普通页面改版反复推翻的架构决定。
- [[变更/变更索引|变更索引]]：当前未发布工作和已发布变更。
- [[模板/模板索引|模板索引]]：新增页面、决策和变更笔记时复用。

- [[knowledge/组件/组件索引|组件索引]]：独立组件目录、真实 API 与消费者。

- [[docs/js-style-separation|JS 样式归属与检查]]：固定样式归 CSS，动态写入逐项审查。

## 详细规范证据

- [[docs/icon-catalog-spec|图标盘点与预览规则]]：现有图形、来源、尺寸依据和新风格待定边界。

- [[docs/README|项目说明]]
- [[docs/channel-structure|频道页面结构命名规范]]
- [[docs/channel-home-standard|频道首页规范]]
- [[docs/channel-home-code-audit|频道首页代码审计]]
- [[docs/global-style-changelog|全局样式修改记录]]
- [[docs/learning-center-design-qa|学习中心设计 QA]]
- [[docs/archive/workbuddy/项目结构分析|WorkBuddy 项目结构分析]]

## AI 维护入口

- [[docs/github-sync-rules|本地 GitHub 同步规则]]：归拢已有同步流程、范围、排除与结果证据；具体候选清单仍只维护在当前未发布变更。
- [[docs/project-standardization-spec|项目标准化规范 v1.0]] 与 [[docs/project-standardization-checklist|验收清单]]：频道目录、组件库、Obsidian、AOCI-CODE 和本地同步规则的目标契约；目录和本地工具已落地，9 组旧页面及剩余自有片段已转为 HTML 模板（[[docs/html-source-restoration-20260925|维护说明]]），AOCI 正式文本索引已对齐，实际证据与技术跳过范围见 [[docs/standardization-status|实施状态]]。

- [[docs/visual-change-workflow|视觉样式增量记录]]：每轮样式修改同步旧值和最终目标；记录在 `design-changes/`，标注以新版页面为主，位置和交互由产品文档承担。
- [[docs/maintenance-workflow|维护流程]]：按任务选择检查，弹窗登记、知识库同步和测试依赖说明。
- [[docs/agent-skill-audit-2026-09-30|Agent 与 Skill 当前官方审计]]：范围、去重、触发边界、中文技能显示与新项目规则；[[docs/agent-skill-audit-2026-09-07|旧审计]] 保留历史依据。
- [[docs/official-engineering-baseline|有官方依据的工程基线]]：开发依赖、标准测试命令及可选本地环境/worktree 接入。
- [[docs/browser-regression-checklist|浏览器行为回归清单]]：跨入口、刷新、弹窗关闭和 AI 入口的真实操作验收，未执行不算通过。

- [[docs/aoci-integration-blocker|AOCI 阻塞修复与正式对齐]]：历史故障、官方开发构建来源和最终验证。

## 使用原则

- 双链表达关系，不复制源码。
- 索引负责定位，不要求每次读取所有笔记。
- 页面事实变化时更新页面笔记；架构原因变化时新增 ADR；视觉样式参数只在 `design-changes/` 维护，当前变更留摘要/链接。
- Git 是代码事实源，知识库是语义事实源。

- [[docs/table-tag-color-mapping-v1|表格标签五色映射方案v1（待定，保留快照）]]

- [[docs/migration-rehearsal|历史演练与验证状态]]：保留 2026-09-22 演练事实；正式文稿验收见正式迁移记录。

- [[docs/formal-migration-20260923|文稿正式迁移记录]]：正式目录、原项目增量保护、验证与回退。

- [[docs/remaining-standardization-audit-20260925|剩余标准化审计]]：未模板化范围、固定样式检查、文件引用与保留原因。

- [[docs/markup-source-completion-20260925|剩余 HTML 结构迁移]]：源码位置、生成缓存边界与验收。

- [[docs/owned-image-assets-20260925|内嵌图片归属补齐]]：独立资源、file 遮罩兼容与字节核验。
