---
type: project-state
project: GAIP 本地静态预览版
updated: 2026-09-02
---

# 当前项目状态

> 所有 Codex 对话的短入口。只记录当前仍然有效的状态；历史细节进入 [[knowledge/变更/变更索引|变更索引]]。

## 当前基线

- 分支：`main`
- 最近已发布功能提交：`ac68be7`（虚拟频道跨页面刷新路由修复；见 [[knowledge/变更/2026-09-02-虚拟频道刷新路由修复]]）
- GitHub Pages：`https://huangheping.github.io/gaip-style-preview/`
- 运行形态：根目录 HTML 薄壳 + Umi Hash SPA + 本地 Mock；“本地”默认指项目文件和既有 `file://` 预览。
- 主导航为项目级强制契约：新增频道前必须读取 [[knowledge/公共模块/主导航与Hash路由#主导航交互与样式契约|主导航交互与样式契约]]。
- 频道配置唯一来源：`shared/config/channels.js`。
- 原始构建产物：`web/`，默认只读。

## 正在进行

- [[knowledge/变更/当前未发布变更|当前未发布变更]] 仅保留用户明确不发布的登录视频测试入口，以及未被正式页面引用的本地试验素材、财富背景候选图和资讯参考分包。

## 待验证

- 配置中心操作日志弹窗的原生 Esc 与键盘焦点循环仍需真实浏览器手工确认；模块筛选、关闭、内嵌日志页、数据隔离与生命周期已通过自动回归。
- AI Agent 登录后/节点重建入口恢复已通过代码测试；真实登录、跨频道和视频/WebGL 效果继续作为手工视觉验收项。

## 待发布

- 登录页视频英雄图测试入口：`index-login-video-test.html`、`features/login-video-test/`、`assets/login-hero-test/`；用户明确不随本次发布。
- 其余未发布候选文件见 [[knowledge/变更/当前未发布变更|当前未发布变更]]；它们没有进入正式提交 `ac68be7`。

## 已知高风险区域

- [[knowledge/公共模块/主导航与Hash路由|主导航与 Hash 路由]]：不得改为整页跳转。
- [[knowledge/公共模块/频道资源加载|频道资源加载]]：频道改版资源必须从任意入口都可用。
- [[knowledge/公共模块/全局框架与样式|全局框架与样式]]：顶栏、侧栏、面包屑、字体和 AI 入口是跨频道能力。
- [[knowledge/公共模块/本地Mock系统|本地 Mock 系统]]：纯静态预览依赖本地数据拦截，不可当作无用数据删除。

## 下一步

1. 后续发布前继续核对本文件、[[knowledge/变更/当前未发布变更|当前未发布变更]]、`git status` 和 `git diff`。
2. 新增或修改可展开主导航时运行 `node scripts/test-expandable-main-nav.cjs` 与 `./scripts/verify-local-navigation.sh`。
3. 若用户确认需要，再单独发布登录视频测试入口或其他候选素材；未获确认不得误提交。

## 快速入口

- [[knowledge/INDEX|项目知识总索引]]
- [[knowledge/页面/页面索引|页面索引]]
- [[knowledge/公共模块/公共模块索引|公共模块索引]]
- [[knowledge/决策/决策索引|决策索引]]
- [[knowledge/变更/变更索引|变更索引]]
- [[docs/README|运行与目录说明]]
- [[AGENTS|AI 维护规则]]
