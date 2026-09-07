---
type: release
date: 2026-09-07
status: 已发布
commit: 06c9e1a
---

# 2026-09-07 Agent 与 Skill 维护规则优化

## 发布结果

- 功能提交：`06c9e1a`（`Add repository maintenance skills and guidance`）。
- 完整提交：`06c9e1aec9aeb51a885d94024d2f27da3a135267`。
- 分支：`main`，已推送至 GitHub `origin/main`。
- 本次提交共 6 个文件、248 行新增、62 行删除，不修改网站运行时代码、依赖或 CI。

## 更新内容

- 精简根 `AGENTS.md`，将常驻规则聚焦到任务边界、不可破坏行为、按任务加载、验证交付和代码审查；易变参数与详细命令移到按需文档。
- 新增 `$gaip-channel-maintenance`，覆盖频道唯一源码、跨入口资源、Hash 切换、刷新错页和可展开主导航维护。
- 新增 `$gaip-modal-maintenance`，覆盖真实弹窗源、共享遮罩/定位、关闭后点击、生命周期和组件预览维护。
- 新增 `docs/maintenance-workflow.md`，按文档、图片、CSS、JS/入口、弹窗和发布风险选择最小相关检查，明确 JSDOM 与真实浏览器验证边界。
- 新增 `docs/agent-skill-audit-2026-09-07.md`，记录官方依据、仓库证据、已实施调整、触发场景及后续工程建议。
- `knowledge/INDEX.md` 增加 AI 维护入口，使用 Obsidian 双链连接维护流程和审计报告。

## 验证

- 两个 Skill 均包含合法 frontmatter、唯一名称和明确触发描述。
- Skill、维护流程、模块笔记、ADR、项目规则、状态与知识库链接的相对路径均存在。
- 知识索引双链与新增文档名称一致，`git diff --check` 通过。
- 审计未修改个人/插件技能、全局 Codex 设置、运行时依赖、CI、远程服务或网站业务源码。
- 仓库 Skill 的自动发现依赖从实际 Git 根打开项目；已运行的旧任务不承诺即时刷新技能列表。

## 后续建议边界

- 锁定开发测试依赖、补真实浏览器点击回归、集中共享资源版本和增加发布清单/CI 均仍是建议，没有在本次提交中实施。
- `AI Agent/` 继续作为网站功能目录，不作为 Codex Agent 配置目录。

## 关联文档

- [[docs/maintenance-workflow|维护流程]]
- [[docs/agent-skill-audit-2026-09-07|Agent 与 Skill 官方指导审计]]
- [[../公共模块/主导航与Hash路由|主导航与 Hash 路由]]
- [[../公共模块/全局框架与样式|全局框架与样式]]
- [[当前未发布变更]]
