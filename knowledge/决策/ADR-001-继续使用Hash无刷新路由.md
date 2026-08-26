---
type: decision
status: accepted
date: 2026-08-13
---

# ADR-001：继续使用 Hash 无刷新路由

## 决定

主导航继续使用 Umi Hash SPA 路由。地址栏中的中文 HTML 文件名仅由 `shared/scripts/channel-entry-navigation.js` 通过 History API 同步，不能触发文档重载。

## 原因

整页导航会重建应用和全局 AI Agent 状态，也会造成不同 HTML 入口之间加载的改版资源不一致。

## 后果

- 频道切换代码不得使用 `location.href` 等整页跳转。
- 所有频道专属资源必须预加载。
- 导航改动必须执行跨入口回归。

## 关联

- [[../公共模块/主导航与Hash路由|主导航与 Hash 路由]]
- [[ADR-003-频道资源统一登记]]
