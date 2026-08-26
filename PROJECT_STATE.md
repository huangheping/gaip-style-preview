---
type: project-state
project: GAIP 本地静态预览版
updated: 2026-08-26
---

# 当前项目状态

> 所有 Codex 对话的短入口。只记录当前仍然有效的状态；历史细节进入 [[knowledge/变更/变更索引|变更索引]]。

## 当前基线

- 分支：`main`
- 最近已发布功能提交：`6e6fbe0`（Fix news center overlay layout）
- 运行形态：本地静态预览，根目录 HTML 薄壳 + Umi Hash SPA + 本地 Mock
- 频道配置唯一来源：`shared/config/channels.js`
- 原始构建产物：`web/`，默认只读

## 正在进行

- [[knowledge/变更/当前未发布变更|当前未发布变更]]
- 登录页视频英雄图测试入口已完成，但用户明确本次不同步，继续保留本地。
- AI Agent 试验素材和资讯中心参考站分包继续保留本地，不属于正式页面依赖。

## 待验证

- 当前没有已进入正式发布范围但尚未验证的项目。

## 待发布

- 登录页视频英雄图测试入口：`index-login-video-test.html`、`features/login-video-test/`、`assets/login-hero-test/`；用户明确本次不同步。
- 其余本地保留文件见 [[knowledge/变更/当前未发布变更|当前未发布变更]]。

## 已知高风险区域

- [[knowledge/公共模块/主导航与Hash路由|主导航与 Hash 路由]]：不得改为整页跳转。
- [[knowledge/公共模块/频道资源加载|频道资源加载]]：频道改版资源必须从任意入口都可用。
- [[knowledge/公共模块/全局框架与样式|全局框架与样式]]：顶栏、侧栏、面包屑、字体和 AI 入口是跨频道能力。
- [[knowledge/公共模块/本地Mock系统|本地 Mock 系统]]：纯静态预览依赖本地数据拦截，不可当作无用数据删除。

## 下一步

1. 若用户确认需要，再单独发布登录页视频英雄图测试入口。
2. 后续 GitHub 发布继续先核对本文件、当前未发布变更、`git status` 和 `git diff`。
3. 不要误提交本地试验素材或参考站 `web/` 分包。

## 快速入口

- [[knowledge/INDEX|项目知识总索引]]
- [[knowledge/页面/页面索引|页面索引]]
- [[knowledge/公共模块/公共模块索引|公共模块索引]]
- [[knowledge/决策/决策索引|决策索引]]
- [[knowledge/变更/变更索引|变更索引]]
- [[docs/README|运行与目录说明]]
- [[AGENTS|AI 维护规则]]
