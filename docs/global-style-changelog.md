# 全局样式修改记录

用于记录需要同步给前端的全局视觉调整。每次修改全局字体、字重、颜色、滚动条或
其他跨页面样式后，在这里补一条即可。

## 已完成

| 日期 | 调整项 | 调整内容 | 前端实现位置 |
| --- | --- | --- | --- |
| 2026-07-31 | 全局面包屑 | 统一为“工作台总览 / 当前频道 / 当前详情”层级；工作台首页不重复显示根节点；名称与路由来自频道注册表，当前节点补充 `aria-current`，学习中心不再维护独立面包屑结构 | `shared/scripts/global-breadcrumb.js`、`features/learning-center/learning-center.js`、`shared/styles/channel-foundation.css` |
| 2026-07-31 | 频道配置规范 | 9 个频道的标准名称、别名、Hash 路由、独立入口、图标和页面类型统一由一个频道注册表维护，主导航、入口同步和结构标识共用同一数据源 | `shared/config/channels.js`、`shared/scripts/learning-nav.js`、`shared/scripts/channel-entry-navigation.js`、`shared/scripts/channel-regions.js` |
| 2026-07-31 | 频道首页基础规范 | 建立全局顶栏 `56px`、主导航侧栏 `212px` 以及颜色、间距、圆角、控件高度等基础变量；现阶段只接入安全的结构约束，不强制覆盖各频道业务布局；移除学习中心私有滚动条规则，统一继承全局滚动条 | `shared/styles/channel-foundation.css`、`features/learning-center/learning-center.css`、`docs/channel-home-standard.md` |
| 2026-07-31 | 全局字体变更 | 全局字体由 `Alibaba PuHuiTi 3` 改为 `HarmonyOS Sans SC`，使用 `HarmonyOS_Sans_SC_Regular.ttf`；继续只注册真实 `Regular 400` | `shared/styles/global-font.css`、`assets/fonts/` |
| 2026-07-30 | 全局字体 | 全局字体改为 `Alibaba PuHuiTi 3`，使用 `AlibabaPuHuiTi-3-55-Regular.woff2`；当前注册字重为 `400` | `shared/styles/global-font.css`、`assets/fonts/` |
| 2026-07-30 | 全局字重 | 所有文字统一使用字体文件自带的真实 `Regular 400`；不设置多级字重，并通过 `font-synthesis: none` 禁止浏览器模拟粗体 | `shared/styles/global-font.css` |
| 2026-07-30 | 全局字号 | 以 `14px` 为基础字号，常规字号统一为 `10 / 12 / 14 / 16 / 18px`；原 `11 / 13 / 15 / 17px` 分别归并到相邻的 `12 / 14 / 16 / 18px` | `shared/styles/global-font.css`、各频道 CSS |
| 2026-07-30 | 全局滚动条 | 所有页面及内部组件统一使用 `8px` 中性灰滚动条，轨道透明、滑块圆角 `4px`，悬停时加深；覆盖原构建包的 `4px / 6px / thin` 和绿色等组件级样式，避免 macOS 默认悬浮滚动条平时不可见 | `shared/styles/global-font.css` |
| 2026-07-30 | 主导航图标 | 主导航统一替换为新版 `18 × 18px` SVG 图标，并通过蒙版继承菜单文字颜色，保证默认态和选中态一致；源文件集中存放在 `assets/navigation/`，页面样式使用内嵌 Data URI，兼容直接双击 HTML 的 `file://` 预览方式 | `shared/scripts/learning-nav.js`、`shared/styles/learning-nav.css`、`assets/navigation/` |

## 全局字号使用规则

| 字号变量 | 数值 | 建议用途 |
| --- | --- | --- |
| `--gaip-font-size-micro` | `10px` | 极少量空间受限的行情更新时间等微型信息 |
| `--gaip-font-size-small` | `12px` | 辅助说明、时间、标签和次要状态 |
| `--gaip-font-size-base` | `14px` | 正文、导航、表格、表单和常规按钮 |
| `--gaip-font-size-large` | `16px` | 重要文字、较大按钮和次级标题 |
| `--gaip-font-size-title` | `18px` | 卡片、模块和常规页面标题 |

- 常规界面不再使用 `11 / 13 / 15 / 17px`。
- `20px` 及以上字号继续用于页面主标题、核心指标和特殊展示，不纳入本次归并。

## 全局字重使用规则

- 页面正文、标题、按钮、导航、表格及数据均使用 `Regular 400`，组件不再通过
  `500 / 600 / 700` 区分层级。
- 标题和重点内容使用字号、颜色、间距、边框或背景区分，不依赖模拟加粗。
- 当前只加载 `HarmonyOS_Sans_SC_Regular.ttf`；字体目录中的 HarmonyOS 其他字重和
  之前的 Alibaba PuHuiTi 字体文件继续保留，但全局样式不加载。
- 原始构建包中的字重声明不直接改写，由全局样式统一覆盖为 `400`。

## 后续记录格式

新增记录时写清四件事：日期、调整项、最终数值或规则、对应代码文件。尚未确定的修改
先放在“待调整”，确定并落地后再移到“已完成”。
