# GAIP 维护流程

本文件承接 AGENTS.md 的按需细节；命令在含 `shared/config/channels.js` 的 Git 根目录运行。事实来源是源码与 Git，知识库只记录关系和当前决策。

## 任务与验收矩阵

| 修改类型 | 最小检查 | 何时扩大 |
| --- | --- | --- |
| 说明文档、AGENTS、Skill | 本次链接/路径存在、frontmatter、规则冲突与触发场景、`git diff --check` | 只有附带可执行脚本变化才跑该脚本；不跑无关业务套件 |
| 单张图片/图标替换 | 文件可读、尺寸/比例、附件一致性、实际引用和缓存、必要视觉检查 | 改到共享 JS/CSS 或入口时按相应行补检查；不为每个图片哈希新建测试 |
| 局部 CSS 数值 | 定位拥有该 UI 的源规则、层叠/响应式、相关视口、diff | 改到共享控件或交互状态时核对跨频道及开/关、hover/focus；不按图片数量扩大测试 |
| JS、频道登记、HTML 入口 | `./scripts/verify-local-navigation.sh`、修改 JS 的 `node --check`、相关业务测试 | 主导航/Hash 改动运行 `node scripts/test-expandable-main-nav.cjs`，验证两条入口路径 |
| 弹窗、共享遮罩/定位、预览 | `node scripts/generate-modal-catalog.cjs --check`、`node scripts/test-popup-preview.cjs` | 登记变化先生成；业务变化加相应 DOM 测试；遮罩/点击必须区分真实浏览器与模拟结果 |
| 发布（已有用户授权） | 核对 diff 和排除清单，运行受影响套件、索引与导航保护 | 涉及多个模块再跑完整业务套件；只提交本次明确范围，不混入试验素材 |

检查通过后不反复执行同一套件。已有测试因资产合法替换而需要更新时保持真实断言；不要新增只复述实现的断言。

### 导航的现场验收

- `工作台.html#/workspace` → 改版频道 → 另一个频道。
- 另一个 HTML 入口 → 改版频道；刷新后仍处于当前 Hash 对应频道。
- 主导航父项只展开/收起；二级项才导航；页面主文档不重载。

菜单的尺寸、原始图标、父子当前态、键盘与滚动层规则以 `knowledge/公共模块/主导航与Hash路由.md` 为准，本文不再复制数值。

### 现有测试依赖

仓库目前没有 package.json/锁文件。以下测试依赖 JSDOM：

`test-expandable-main-nav.cjs`、`test-config-center.cjs`、`test-announcement-management.cjs`、`test-operation-log.cjs`、`test-agent-entry.cjs`。

先检查当前可用依赖。缺失时可在仓库外准备临时测试依赖，避免写入网页运行时；本次验证基准为 `jsdom@26.1.0`。示例仅在确需 DOM 测试时使用：

```sh
gaip_test_deps=$(mktemp -d "${TMPDIR:-/tmp}/gaip-test-deps.XXXXXX")
npm install --prefix "$gaip_test_deps" jsdom@26.1.0 --no-save --no-audit --no-fund
NODE_PATH="$gaip_test_deps/node_modules" node scripts/test-expandable-main-nav.cjs
```

复用该路径运行本次相关套件，不要每个文件重装依赖。临时依赖不是可复现 CI 的替代；锁定开发依赖与标准测试入口列入审计后续建议。

JSDOM 不实现真实点击命中、原生 dialog 顶层和完整渲染。报告中分别列出静态检查、DOM 状态和浏览器结果。不得把 `verify-local-navigation.sh` 的通过文字当成实际跨页浏览证明。

## 弹窗登记细节

- 新增本地业务弹窗的真实源 JS 使用合法 `/* @gaip-modal { ... } */` JSON；必要字段：`id`、`title`、`channel`、`type`、`status`。
- ID 用全项目唯一的小写字母、数字、连字符。可预览非抽屉登记 `category`：`information` / `form` / `confirmation`。
- 直接源预览登记 `invoke.path`、`styles`、`scripts`，并暴露与业务相同的 `open/show/create`。返回未挂载节点使用 `resultMode: "append"`，需要入场类使用 `append-open-class`。
- 新增或迁移操作确认同时登记 `type: "confirm"`、`category: "confirmation"` 并调用 `__GAIP_MODAL_COMPONENT__`；业务不复制标题、关闭、footer 和按钮结构。
- 抽屉用 `type: "drawer"`；明确不展示/不可达项用 `status: "excluded"` 并给原因。AI Agent 主面板不自动纳入。
- 共享 `global-modal-position.css/js` 管理视口定位，`global-modal-mask.css` 管理遮罩；自定义宿主调用 `__GAIP_MODAL_POSITION__.adopt(host)` 或登记到接入器。
- 新本地弹窗不添加到历史 `全局组件/弹窗源登记.js`；生成器输出 `全局组件/弹窗自动索引.generated.js`，不得手改。
- 修改登记运行生成器，再运行 `--check` 与预览测试。共享源码变化同步所有实际消费者的缓存版本；新增 HTML 必须先证明属于入口/预览的必要组成。

## 知识库同步与多任务

修改前给当前变更添加简短条目；完成后写实际文件、检查与剩余事项，并更新 PROJECT_STATE。无新增架构含义的图片或数值更新合并到同一条目，不扩写多份规范。行为/模块关系改变才更新关联模块笔记与索引。

读取与更新 Obsidian Markdown 可以直接操作仓库文本，不以打开 Obsidian 应用为前置条件。双链帮助定位，不自动证明文档新鲜；版本号优先核对源码。只有明确要求操作 Obsidian 界面或 Vault 命令时才需要 CLI。

另一任务使用同一 checkout 时能读到磁盘更新，但不保证正在运行的任务立即重读全部规则；独立 worktree 中的修改需合并后才出现在本地预览。交付时写出所在 Git 根目录及仍未发布的事项，不主动移动用户任务。

发布授权与源码修改授权分别判断。此前任务的“同步 GitHub”不是未来全部任务自动发布授权；同一未完成发布任务内的明确授权无需反复询问。保留当前变更中标记不发布的内容。

## 相关入口

- [项目规则](../AGENTS.md)
- [审计依据与非 Agent/Skill 改进清单](agent-skill-audit-2026-09-07.md)
- [频道 Skill](../.agents/skills/gaip-channel-maintenance/SKILL.md)
- [弹窗 Skill](../.agents/skills/gaip-modal-maintenance/SKILL.md)
