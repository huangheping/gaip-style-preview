---
type: standardization
status: active
updated: 2026-09-22
---

# JS 中的样式：归属、清理与验收

本页承接 [[docs/standardization-status|标准化状态]]。HTML 没有 style 属性，不等于项目没有 JS 样式。本项目同时检查 HTML 与自有脚本，不把目录迁移当作样式分离完成。

## 现在去哪里改样式

| 内容 | 样式文件 | JS 的职责 |
| --- | --- | --- |
| 线索工具栏、搜索和操作区 | channels/clues/layout-patch.css | 创建结构、更新内容和类名 |
| 专家简介与二维码的间距 | components/expert-directory/expert-directory.css | 给指定专家卡片添加类名 |
| AI 面板宽度、显隐、复制辅助节点 | components/ai-agent/AI Agent.css | 切换全屏、最小化和 hidden 状态 |
| 客户确认框、活动和方案弹窗滚动锁 | 各自频道 CSS | 开关对应状态类 |
| 配置中心表单宽度、日志表宽度和公告溢出 | config-center-content.css、announcement-management.css | 选择表单类型、判断文本是否溢出 |
| 学习课节、财富值比例和组织树缩进 | 各自频道 CSS | 将业务数值交给有名字的 CSS 变量，HTML 字符串不拼 style |
| 表格标签间距、对齐和分页弹出层默认值 | components-preview.css、table/global-table.css | 选择状态，计算列宽和菜单位置 |
| 真实弹窗预览高度 | components/弹窗预览.styles-1.css | 创建 iframe，不写高度样式 |
| 海报主题颜色 | components/海报分享/index.styles-1.css | 切换模板 ID；Canvas 导出读取实际主题颜色 |
| 工作台测量副本、资讯复制辅助节点 | 对应频道 CSS | 执行测量或复制，完成后移除节点 |
| 保留 React 节点的关闭图标遮罩 | components/modal/global-modal.css 与 assets/close.svg | 保留原节点及事件，添加组件类 |

本轮是保持既有视觉参数的重构，没有建立新的设计差异；迁移前源文件与核验输出在 outputs/style-separation/20260922/。实际视觉验证的范围以该目录结果为准。

## 还会不会有运行时 style

会。实时坐标、拖拽尺寸、表格可配置列宽、实际学习进度不能全部写成固定 CSS。本轮保留的写入逐表达式列在 shared/config/runtime-style-exceptions.json，每条包含用途；不是把整个文件放行。

- 自有代码的固定颜色、字号、间距、宽度预设和显隐规则归所属 CSS。状态用 class、data 属性或 hidden 表达。
- CSS 变量只接收确需变化的业务/几何数值；把固定颜色改成一个 JS 变量再写入，不算分离。
- 临时把弹出层坐标归零以测量变换原点属于算法步骤，不属于设计位置；此项保留并单独说明。
- 清除旧运行时属性、读取计算样式和 Canvas 像素绘制不等同于给 DOM 写 CSS。Canvas 导出应与页面显示一致。
- 公共 Umi 运行时、第三方 Lottie 与 page-vendor（水印/Popconfirm）仍包含框架样式处理。3 个文件按精确路径与 SHA-256 锁定；没有整目录忽略，也没有声称这些文件已完成样式抽离。web 原始基线仍只读。

## 自动检查

`npm run check:js-styles` 使用 Acorn 解析自有 JS/MJS/CJS 源码，识别 style 赋值、计算属性、样式对象/别名、setAttribute、CSS 注入及 HTML 字符串内联样式。它已进入 `npm run check:standards` 和 `npm test`。

新增样式写入、改变已审查表达式、保留已删除的例外，以及修改被锁定的编译文件都会报错。清单不提供自动更新命令；必须阅读真实源代码，先迁出固定视觉，再解释确有必要的动态写入。不要为通过检查扩大豁免范围。

这是源代码检查，不是对任意动态执行、混淆字符串或第三方实现的完整证明；代码审阅和真实浏览器验证仍是完成条件。检查器的回归覆盖固定样式、别名、Object.assign、React style、字符串内联、伪造 legacy 路径、例外增量与过期项。

新页面使用当前同一检查。新项目生成器携带同一审计模块并声明 Acorn 开发依赖，首次执行 `npm install --ignore-scripts` 后运行 `npm test`；新项目默认不继承本项目的历史例外。规则仅随项目交付，不修改其他项目或全局配置。

## 2026-09-25 旧频道补齐

9 个 page.js 已进入自有脚本审计，42 处固定样式迁入 page.css；动态例外共 70 项。新增 JSX/jsxs 的 style 元素注入检查；产品富文本不再重新插入 style。详见 [[docs/html-source-restoration-20260925]]。

## 剩余范围复核

2026-09-25 初次补测未识别组件复数 styles 参数（下文已补齐）；检查器同时覆盖嵌套 HTML template、静态字符串拼接隐藏 style、直接 JSX style 元素与 setAttributeNS 写入。此前审计见 [[docs/remaining-standardization-audit-20260925]]。

## 组件语义槽样式补齐（2026-09-25）

追加源码阅读发现活动、线索、产品 page.js 中 7 处 Ant styles 对象，已改为 classNames 并将固定值迁至各频道 page.css。它们之前未被只匹配单数 style 的检查器发现；此前“未发现”仅是当时检查范围的结论。

检查器现在还拒绝复数 styles 对象、简单变量别名和 bodyStyle/overlayStyle 等组件参数；频道资源清单的 CSS 地址数组仍合法。新项目生成器包含同一检查及失败样例。没有增加动态例外，仍为 70 项；第三方锁定文件仍为 3 个。

真实 file 浏览器前后对比覆盖线索分配、转化、详情、新增、产品专家和活动原生报名的正文/标题尺寸、间距和滚动属性。活动报名使用测试账号角色夹具，未修改正式 Mock 权限。Ant Card 海报正文以真实组件验证显隐。保留原 CSS important 优先级，不形成视觉参数变更。测试输出在 outputs/standardization-finish-20260925。
