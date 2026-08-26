---
type: module
risk: high
---

# 主导航与 Hash 路由

## 职责

- `shared/config/channels.js`：频道名称、路由、入口、图标和类型的唯一来源。
- `shared/scripts/channel-entry-navigation.js`：用 History API 同步地址栏入口文件名，不重新加载页面。
- `shared/scripts/learning-nav.js`：学习中心虚拟频道和主导航图标。
- `features/wealth-center/wealth-nav.js`：财富值中心的可展开一级菜单与三个子频道。
- `features/news-center/news-center.js`：资讯中心虚拟频道入口与主导航项。
- `shared/scripts/global-breadcrumb.js`：全局面包屑。

## 不变量

- 主导航继续使用 Umi Hash SPA。
- 禁止 `location.href`、`location.assign()`、`location.replace()` 进行频道切换。
- Hash 可变，文档不能整页刷新。
- 新增/改名频道先修改频道注册表，不维护第二份映射。
- 虚拟频道统一通过 `gaip-channel` 识别；资讯中心使用 `news`，财富值中心使用 `wealth` 并通过 `gaip-view` 记录子频道。

## 验证

运行 `./scripts/verify-local-navigation.sh`，并从至少两个不同 HTML 入口跨频道切换。

## 关联

- [[../决策/ADR-001-继续使用Hash无刷新路由|ADR-001：继续使用 Hash 无刷新路由]]
- [[频道资源加载]]
- [[docs/channel-structure|频道页面结构命名规范]]
