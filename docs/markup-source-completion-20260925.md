---
title: 剩余 HTML 结构迁移
updated: 2026-09-25
tags:
  - maintenance
  - templates
---

# 剩余 HTML 结构迁移

基准 db615ee；正式目录为文稿 GAIP 项目。关联 [[docs/remaining-standardization-audit-20260925|迁移前审计]]、[[docs/html-source-restoration-20260925|旧编译页面视图]]、[[docs/js-style-separation|样式边界]]。

后续源码复核还补迁了 7 处 Ant 组件复数 styles 参数，并完成浏览器前后对比，见 [[docs/js-style-separation#组件语义槽样式补齐（2026-09-25）]]。HTML 结构检查不能代替 CSS 参数检查。

## 维护入口

28 个业务/组件脚本中的 343 份静态 HTML 结构片段已迁入所属目录的 templates/markup-*.html，共 29 个 HTML 文件。产品 Mock 详情维护在 channels/product/templates/mock-detail.html，公共加载器结构留在 shared/scripts/templates。财富工作台、记录与明细，学习管理/编辑/学情/直播，配置及公告弹窗，方案/活动/工作台适配，组件目录/弹窗预览/日志/AI 提示均纳入。

JS 仍负责数据、显隐状态、条件、循环、事件、转义以及动态节点。HTML 使用 {{gaip:编号}} 绑定，编号对应同名渲染调用的参数；不要在 HTML 放 JS 表达式。若需新增变量，在 JS 中按上下文转义后传入。渲染器不二次解析参数内容，不执行代码，也不自动改变已有转义策略。

构建入口 npm run build:templates。shared/config/markup-templates.json 只登记源码与缓存对应关系；生成器将模板缓存写入各原 JS 顶部 @gaip-markup-cache 边界，边界外的业务代码保持手工维护。缓存不手改。这样不增加运行时 JS 文件和请求，file:// 无需 fetch HTML，不改变注册表的加载顺序。配置 source-dialogs 的生成缓存会随原有构建进入 source-markup.js。

HTML 片段包括表格行、SVG、可选属性和组合式片段；生成时逐字保留，不通过 DOM 解析重写，以免浏览器自动补全 table/tbody、实体和空白导致回归。它们是结构维护源，不是可以独立双击使用的页面入口。

## 检查与边界

- check:standards 检查生成缓存与 HTML 一致，固定 CSS、内联事件和执行脚本仍禁止；新增静态结构归属检查阻止业务 JS 再写 HTML 字符串。新项目生成器也继承静态结构检查。
- HTML 动态资源绑定不当作字面路径；静态资源按真实消费页面的 base 校验。组件目录和海报分享各有自己的相对路径基准。
- XLSX 导出的 styles.xml 是文档格式，保留；原始 web、锁定的第三方运行时和 70 处经审查的动态几何/业务样式保持既有边界，不宣称整个 React/Ant 内核零动态 DOM/style。
- 本次未合并业务职责不同的脚本；正式运行目录仍为 48 CSS / 88 JS。新文件主要是用户要求的 HTML 结构维护源，而非额外运行脚本。

## 验证

标准检查、生成物校验、导航/弹窗登记、模板参数与实体/空白保持测试，以及配置/公告/表单/日志/AI 等既有 DOM 回归纳入本地验证。

真实 Chrome file:// 验证：双入口 Hash 导航、刷新与组织弹窗；财富值三个子视图和关键词重复开关；公告创建/取消/重开；学习直播管理、课程编辑的上传/排序/拖动/关闭、学情与导出。学习首页截图已核验图片正常、桌面三列布局保持。

13 个频道/登录页面与本轮之前的 Git 快照对比。12 页采样节点、文字、尺寸和样式一致；活动页 6 个 Ant 选择器测量节点宽度相差约 1px，其他采样一致，复测仍保留该差异，不报告全站像素完全相同。Chrome119 的 WebGL 基线错误、原生 dialog 内嵌 popover 限制与真实后台缺席仍单列，不把 DOM 测试当作线上联调。

证据保存在 outputs/standardization-finish-20260925。仅本地提交，不推送。AOCI 完整索引进度独立见 [[docs/aoci-integration-blocker]]。
