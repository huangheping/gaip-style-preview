# 有官方依据的工程基线

核对日期：2026-09-07。范围仅为开发环境、验证及多任务隔离；不是 Agent/Skill 改版，不改变双击 HTML、本地 Mock 或 Hash 导航。

## 官方要求与项目选择分开记录

| 官方来源 | 原文明确支持的内容 | 本项目落地与边界 |
| --- | --- | --- |
| [OpenAI：Local environments](https://learn.chatgpt.com/docs/environments/local-environment) | setup scripts 安装所需依赖；Actions 执行常用测试命令；设置界面生成的配置可放入仓库共享 | 提供下方 setup/检查命令；未伪造未公开的环境配置格式，未更改应用设置 |
| [npm：npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci/) | 根据现有锁文件安装；清单不匹配时失败；不更新清单和锁文件 | 使用 `npm ci` 安装开发测试依赖；注意它会清理所在项目已有的 node_modules |
| [npm：package-lock.json](https://docs.npmjs.com/cli/v11/configuring-npm/package-lock-json/) | 锁文件记录依赖树，适合提交到源码仓库以复现安装 | 新增 package.json、npm 生成的锁文件；不手工修改锁文件里的完整性数据 |
| [OpenAI：Prompting Codex](https://learn.chatgpt.com/docs/prompting#prompting-codex) | 明确复现步骤和约束，修复后重跑复现，运行最小相关检查并报告结果 | 标准检查命令保留现有断言；真实点击用独立清单记录，不能用静态结果替代 |
| [Playwright：Best Practices](https://playwright.dev/docs/best-practices) | 测试用户可见行为，隔离测试状态，使用可重试断言 | 浏览器清单聚焦真实点击、关闭/再开和刷新；未安装或声称已执行 Playwright 自动化 |
| [OpenAI：Worktrees](https://learn.chatgpt.com/docs/environments/git-worktrees) | 并行任务可在独立工作树执行，之后通过 Handoff 在 Local 与 Worktree 之间转移 | 新大任务建议从实际 Git 项目选择 Worktree；本任务不替用户创建分支、迁移任务或集成 |

OpenAI 没有规定 GAIP 必须使用 npm、JSDOM 26.1.0、Node 24 或某个共享资源清单。这里选 npm/JSDOM 是因为仓库现有五个 DOM 测试已依赖 JSDOM；固定版本延续此前审计基准，不声称它是最新版或官方推荐版本。Node 24 / npm 11 是本机已验证的开发工具主版本范围，不自动修改用户系统版本。

共享资源清单、惰性加载、框架迁移和 CI 部署不属于本轮“有明确官方依据”的实施范围。原审计中的这些内容继续作为项目工程建议，不能标为 OpenAI 强制规范。

## 安装与标准命令

在包含 package.json 的 `样式优化html` Git 根目录运行（macOS / Linux，需 Node 24、npm 11、POSIX sh）：

```sh
npm ci --include=dev --ignore-scripts --no-fund
npm test
```

`--include=dev` 确保开发测试依赖不因生产环境设置而被省略；`--ignore-scripts` 禁止依赖包安装时的生命周期脚本，目前这些测试不需要它们。`npm test` 仍会显式运行所指定的测试命令。

| 命令 | 范围 |
| --- | --- |
| `npm run test:static` | 导航源码保护、虚拟入口刷新检查、弹窗自动索引与预览登记 |
| `npm run test:dom` | 主导航、配置中心、公告、操作日志、AI 入口的五个 DOM 套件 |
| `npm run test:navigation` | 主导航 DOM 回归 |
| `npm run test:config` | 配置中心 DOM 回归 |
| `npm run test:announcements` | 公告管理 DOM 回归 |
| `npm run test:logs` | 共享操作日志 DOM 回归 |
| `npm run test:agent` | AI 入口版本/节点重建回归 |

命令按顺序运行，任一失败即返回非零并停止后续步骤；不能把尚未执行的项目当成通过。已知 AI 入口回归没有从总检查中移除，也没有修改断言。`npm test` 的范围只有静态/DOM，不包含真实浏览器、视觉、视频或 WebGL。

仅预览网站无需 Node/npm，不需要先安装依赖。没有添加构建服务器、线上 API、生产依赖、CI 或部署脚本。node_modules 不进入 Git；本轮不改现有发布方式，后续若打包上传目录，也应排除开发依赖和测试输出。

## Codex 本地环境接入

按官方说明，在应用的 Local environments 设置中为实际 Git 项目配置：

- Setup：`npm ci --include=dev --ignore-scripts --no-fund`
- Action「静态检查」：`npm run test:static`
- Action「DOM 回归」：`npm run test:dom`
- Action「全部代码检查」：`npm test`

保存后检查应用生成的 `.codex` 文件，再决定纳入版本控制。此处给出了可运行的命令，但没有声称设置按钮已经配置成功；没有修改全局设置。

## 并行任务接入

官方 Worktree 机制是可选能力，不是要求所有小修改都新建工作树。对会修改共享源码、根入口或维护记录的大任务：在实际 Git 项目的新任务界面选择 Worktree、选择起点并配置上述 setup。完成验证和差异审查后，再使用官方 Handoff 流程或经授权的 Git 集成；不要手工让同一分支同时在两处检出。

独立工作树中的文件不会自动出现在当前 Local 预览；未跟踪的试验素材也不能假定会复制过去。本项目暂不需要复制凭据的 `.worktreeinclude`，不新增它。

## 本轮验证状态

- 在 macOS、Node `24.14.1`、npm `11.11.0` 下生成锁文件，并执行 `npm ci --include=dev --ignore-scripts --no-fund` 成功；39 个依赖包均为开发依赖，根包 `private: true`，无生产 dependencies。
- 安装时 npm 审计返回 0 个已知漏洞；间接依赖 `whatwg-encoding@3.1.1` 有弃用提示。未自动升级 JSDOM 主版本，0 个已知漏洞不等于不存在任何安全问题。
- `npm test` 本轮退出码为 0：导航静态保护、弹窗索引/预览，以及五个 DOM 套件均通过。AI 入口的 direct / header-first / entry-first 本轮均通过。
- 历史审计的 AI 入口间歇性失败尚未定位；本次未修改测试或业务源码，一轮通过不足以宣布该问题已经修复。
- package.json 与锁文件的依赖一致性、实际安装版本、开发依赖标记、本轮相对 Markdown 链接及 `git diff --check` 通过。
- 后续用户已手工确认刷新保留工作台、关闭日志后导航、Esc 关闭与再开、登录及跨频道 AI 版本切换；详见 [浏览器清单](browser-regression-checklist.md)。自动化受 file URL 策略限制；无刷新、焦点恢复及视频/WebGL 等仍未核验。Local environments 的应用设置和新 Worktree 创建未操作；CI/发布未启用。
- 本轮改动仍在本地，未 commit / push。网站业务文件及 Agent/Skill 文件无本次差异。

相关：[浏览器验收清单](browser-regression-checklist.md)、[维护流程](maintenance-workflow.md)、[历史审计](agent-skill-audit-2026-09-07.md)。
