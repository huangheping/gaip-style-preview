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
- `features/config-center/config-center.js`：配置中心一级展开菜单、组织架构/公告管理/操作日志二级页面与虚拟频道生命周期。
- `shared/styles/channel-foundation.css`：通过 `gaip-main-menu-*` 统一可展开父项的图标列、文字列、固定右侧箭头、旋转动效与折叠侧栏表现。
- `shared/scripts/global-breadcrumb.js`：全局面包屑。

## 不变量

- 主导航继续使用 Umi Hash SPA。
- 禁止 `location.href`、`location.assign()`、`location.replace()` 进行频道切换。
- Hash 可变，文档不能整页刷新。
- 当前 Hash 是频道识别的唯一权威来源；财富值、资讯、学习等虚拟频道入口只在没有 Hash 时补自己的默认 `gaip-channel`，不得通过入口文件写入持久的 `__GAIP_PAGE_OVERRIDE__`。这样即使 `file://` 无法同步地址栏文件名，刷新也仍保留当前频道。
- 新增/改名频道先修改频道注册表，不维护第二份映射。
- 虚拟频道统一通过 `gaip-channel` 识别；资讯中心使用 `news`，财富值中心使用 `wealth` 并通过 `gaip-view` 记录子频道。配置中心使用 `config`，二级项由注册表 `views` 定义，`gaip-view` 为 `organization` / `announcement-management` / `operation-log`。
- 带 `[data-gaip-main-menu-toggle]` 的一级父项只切换子菜单，不能改变 Hash，也不能触发其他虚拟频道的 `closeForNavigation()`；真实导航只发生在一级叶子项或二级项。

## 主导航交互与样式契约

本节是所有新增频道、二级导航和主导航修复的项目级基准。频道代码只能补充频道数据、原始图标和子页面内容，不得复制或改写公共导航行为。

### 导航类型与点击行为

- 一级叶子项：点击后通过 Umi Hash SPA 切换频道，不刷新主文档。
- 一级可展开父项：必须带 `[data-gaip-main-menu-toggle]`，点击只切换 `is-open`、`aria-expanded` 和子菜单 `hidden` / `aria-hidden`，不得改变 Hash、打开默认子页或调用任何频道的离开方法。
- 二级项：点击后才进行真实频道/视图导航，并根据 Hash 设置当前态。
- `is-open` 只表示子菜单是否展开；`is-current` 只表示该组内有当前二级项。两者不得互相代替，收起子菜单不能清除父项当前态。
- 其他频道的捕获监听必须先排除 `event.target.closest('[data-gaip-main-menu-toggle]')`。例如财富值二级项当前时点击配置中心父项，只展开配置中心，不卸载财富值页面、不改变 Hash。

### 鼠标与键盘

- 父项 hover 使用 `rgba(0, 0, 0, 0.03)` 灰色浅底；普通态文字为 `rgba(0, 0, 0, 0.65)`，hover 为 `rgba(0, 0, 0, 0.88)`。
- Enter 和空格切换父项开合，Esc 收起并把焦点留在父项。
- 父项使用 `role="menuitem"`、`tabindex="0"`、`aria-haspopup="true"` 和实时 `aria-expanded`；子菜单同步 `hidden` 与 `aria-hidden`。
- 箭头固定在父项右侧 `16px`、垂直居中；关闭时向下，`is-open` 时旋转 `180deg`，时长 `180ms`。`prefers-reduced-motion: reduce` 下取消动画。

### 展开侧栏的统一几何

| 项目 | 固定值 |
| --- | --- |
| 一级父项高度 / 行高 | `40px` |
| 父项外边距 | 上下 `4px`，左右 `0` |
| 父项左内边距 | `24px` |
| 左边框占位 | `4px solid transparent` |
| 图标列 | `18px × 18px` |
| 图标与文字间距 | `13px` |
| 二级项左内边距 | `55px` |
| 箭头尺寸 / 右侧位置 | `12px` / `16px` |

在当前 `208px` 展开侧栏中，菜单行左边为 `8px`，因此图标左边必须为 `36px`；一级文字和二级文字左边必须同为 `67px`。箭头使用绝对定位，不得根据频道名称长度计算位置。侧栏折叠时只保留居中的一级图标，隐藏文字和箭头。

### 当前态归属

- 一级叶子项沿用原 Umi/Ant 当前态。
- 可展开组的二级项当前时，父项只将图标、文字和箭头改为 `#025b52`；父项背景、4px 左边框仍为透明。
- 当前二级项使用文字 `#025b52`、背景 `rgba(36, 212, 201, 0.1)`、左边框 `#24d4c9`。父项不得重复显示这块绿色浅底或绿色左边框。
- 当前父项 hover 时仍显示灰色浅底，但前景保持 `#025b52`。

### 滚动区域与百宝箱底图

- `channel-regions.js` 必须把主菜单的直接滚动父层标记为 `.gaip-sidebar-nav-scroll`；所有频道复用这一滚动层，不在频道 CSS 中查找匿名 `style` 容器或另设滚动条。
- 展开侧栏的左右内边距为 `8px`。滚动层使用 `margin-right: -8px` 抵消右侧内边距，使滚动条右边贴到侧栏 `212px` 边缘；同时保留 `12px` 右内边距，使菜单内容宽度和既有对齐不变。实测菜单右边仍为 `189px`、图标左边 `36px`、文字左边 `67px`。
- 滚动层为 `z-index: 1`；百宝箱所在 `.ant-pro-sider-footer` 为 `z-index: 0`。百宝箱 `335px` 高的上延背景可保持原视觉，但不得覆盖滚动条。
- 滚动条宽 `6px`；默认 thumb 为 `rgba(47, 54, 64, 0.14)`，hover 为 `0.28`，active 为 `0.4`，轨道透明。Firefox 使用 `scrollbar-width: thin` 和同一默认颜色。相关规则需覆盖 `global-font.css` 的全局滚动条值。

### 图标资产

- 优先复用线上构建包或项目已有的原始图标文件/DOM，不凭记忆绘制近似图标。
- 图标容器统一占用 `18px × 18px`，视觉图形可按原资产尺寸呈现，但不得改变图标列宽或文字起点。
- 固定填色的 SVG `<img>` 需要随当前态变色时，原 `<img>` 必须保持 `display`、`visibility` 和 `opacity: 1`，只通过 CSS `filter` 改色。禁止隐藏原图后依赖 `mask` / `-webkit-mask`，避免 `file://` 或浏览器策略导致图标消失。
- 原始内联 SVG 已使用 `currentColor` 时，直接继承父项颜色，不重新写 path。

### 实现与验证清单

1. 在 `shared/config/channels.js` 只登记一份频道、views 和资源。
2. 可展开父项复用 `channel-foundation.css` 的 `gaip-main-menu-*` 契约；频道样式只补原始图标和必要的二级内容差异。
3. 主菜单滚动父层由 `channel-regions.js` 统一标记，频道不得重设滚动条或百宝箱层级。
4. 真实导航仅绑定一级叶子项和二级链接；父项事件必须 `preventDefault()` / `stopPropagation()` 并保持 Hash 不变。
5. 运行 `scripts/test-expandable-main-nav.cjs`，覆盖父项纯开合、键盘、双向频道隔离、图标可见、父子当前态及共享滚动层。
6. 运行 `./scripts/verify-local-navigation.sh`，从至少两个 HTML 入口验证跨频道无刷新。
7. 使用既有 `file://` 入口做最终确认；若自动化受限，可临时使用 HTTP 测试，但不得把临时地址作为交付入口。

## 验证

运行 `scripts/test-expandable-main-nav.cjs` 和 `./scripts/verify-local-navigation.sh`，并从至少两个不同 HTML 入口跨频道切换。

## 关联

- [[../决策/ADR-001-继续使用Hash无刷新路由|ADR-001：继续使用 Hash 无刷新路由]]
- [[频道资源加载]]
- [[docs/channel-structure|频道页面结构命名规范]]
