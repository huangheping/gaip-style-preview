---
title: 旧频道 HTML 源码维护说明
updated: 2026-09-25
tags:
  - maintenance
  - standardization
---

# 页面结构、样式和业务现在分别在哪里

本轮处理工作台、客户、保单、方案、产品、活动、入职引导、线索和登录共 9 组旧编译页面。页面视图已抽为频道 index.html 内的 317 个 HTML 模板；page.css 保存基础及状态样式，page.js 保存业务状态、数据请求、事件和组件绑定。旧频道 legacy 中的 18 个 JS/CSS 已被对应文件替代；web 原站基线未改。

[[docs/standardization-status|标准化状态]] · [[docs/js-style-separation|样式边界]] · [[knowledge/公共模块/频道资源加载|资源加载契约]]

## 日常修改方法

1. 打开对应频道 README，根据中文用途找文件。
2. 结构和静态文字修改 index.html 的 `@gaip-page-views` 区段；样式修改 page.css；数据、条件和事件修改 page.js 的业务区段。
3. HTML 的 `data-component` 绑定原 React/Ant 组件类型，`data-props` 绑定动态属性，`data-slot` 接收业务数据；这些绑定名对应 page.js。组件占位标签不额外渲染 div；段落内的组件占位使用 span，以符合 HTML 解析规则。
4. 修改模板后运行 `npm run build:templates`，入口修改后运行 `npm run build:entries`。只生成 page.js 顶部有边界标记的模板缓存，业务区段保持不变。根 index.html 始终由登录入口生成，中文目录位于 app/project-index/index.html。
5. 运行 `npm test`，并按实际改动验证直接打开、跨频道进入和相关交互。

模板使用浏览器 HTML 解析规则，允许标准 void 元素和命名实体；不允许 style/script 或内联事件。模板元素的 data-kind/data-children 保留原 React 子节点与数组契约，维护时不可随意删除。新增页面仍使用项目生成器，不要求新页面继承旧 Webpack 模块写法。

## 为什么仍需要运行时和缓存

file:// 预览不依赖 fetch 本地 HTML。构建器从 HTML 生成页面描述缓存，由共享 html-view.js 转为原 React 节点，保留事件、ref、key、条件和组件身份。HTML 是结构维护源，缓存不手工修改；没有另外复制一套业务 JS。原 Webpack 模块编号和 Umi Hash 路由仍保留，因此不能把这次交付称为恢复原始 React/TSX 工程或彻底移除框架。

固定样式迁出 42 处；状态颜色、图表层级与动画延迟改用 CSS/data 属性。工作台仅新增保留 4 个已逐表达式审查的动态几何写入（柱高、文本行数、行高、最大高度）。全项目动态例外为 70 项。第三方水印和 Popconfirm 原模块独立在 shared/runtime/page-vendor.js；连同 Umi、Lottie 共 3 个文件按 SHA-256 锁定，不再豁免整份频道业务脚本。

产品详情的富文本渲染移除了 style 标签和 style 属性；本地 Mock 已使用 class。后续导入含样式的富文本，需将样式迁入产品频道 CSS，不能依赖嵌入 CSS。本轮之后，Mock 富文本和既有适配器的固定结构也已迁入 HTML 模板，见 [[docs/markup-source-completion-20260925]]；动态数据及第三方组件仍由 JS 渲染，未进行全站无障碍重建。

## 验证证据与保留边界

本轮证据在 `outputs/standardization-completion-20260925/`，不提交大体积测试截图。基准为本地提交 f7c2ecc，baseline.tar 保留改前追溯。

- 9 个页面首页的可见 DOM 数量、文字、几何与抽样计算样式对比一致。
- 13 条真实弹窗入口对比一致；两处遮罩在等待入场动画结束后复核一致。
- 线索新增输入/取消/重开、详情关闭，客户介绍编辑/取消/重开、需求图六档高度和动画延迟，保单空搜索恢复，产品详情重复开关专项通过。
- 隔离副本与文稿正式路径完整 npm test 退出码均为 0；正式路径页面交互专项通过。
- 12 个频道 file:// 直开/刷新、登录与两个入口全频道切换通过：没有整页刷新、缺失本地资源或已加载坏图。
- 编译器测试覆盖绑定事件/ref 身份、延迟求值次序、数组/null/false、key、重复模板、样式/脚本拒绝、缓存过期、严格模式与保留业务区段。源文件样式审计新增 JSX style 元素注入检查。

保持原视觉参数，本轮不产生新的视觉设计差异。Chrome 119 已有 WebGL file-origin 错误仍存在；真实后台、直播上传与所有窄屏/所有业务组合未因此视为完成。原 rc14 阻塞已在后续固定官方开发提交中解决；完整索引的实际补齐状态见 [[docs/standardization-status]]，故障追溯见 [[docs/aoci-integration-blocker]]。仅本地提交，不推送、不部署。
