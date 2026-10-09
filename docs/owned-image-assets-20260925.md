---
type: standardization
status: locally-verified
updated: 2026-09-25
---

# 固定图片归属补齐

本轮在文稿正式项目将 57 处固定内嵌图片引用迁为频道 assets 中的独立文件。原始字节不变，页面排版和交互不变；13 个 CSS/JS 源文件合计减少 776,785 字节（约 759 KiB），未增加 CSS/JS 文件。上级：[[docs/standardization-status]]。

| 频道 | 独立资源数 |
| --- | ---: |
| 产品中心 | 14 |
| 线索中心 | 13 |
| 客户中心 | 12 |
| 方案中心 | 7 |
| 活动中心 | 4 |
| 工作台 | 4 |
| 入职引导 | 3 |

方案五张封面使用方案 ID 命名；其余历史编译图标保留内容哈希名称，避免猜测含义或覆盖不同原图。图片归 assets/images，图标归 assets/icons；引用关系和字节摘要见 outputs/standardization-finish-20260925/asset-extraction/manifest.json，迁移前源码在同目录 before。

## file 兼容边界

主导航 10 个图标和全局弹窗关闭图标已有独立 SVG 原件，分别在 shared/assets/main-nav 与 components/modal/assets/close.svg。CSS mask 直接引用 file 地址会被 Chrome 拦截，因此保留现有内嵌缓存；检查器逐字节核对原件，不允许把它当第二份手工图源。最初直接改外部 mask 的尝试已撤回，未带入最终改动。

字节锁定的 shared/runtime/umi.0b0663b5.js 内仍有第三方编译图片，不修改原运行时，不声称全仓库完全没有 data URI。用户上传后产生的图片数据、Canvas 导出和 SVG 动态图形不是本轮固定文件抽离对象。

## 防回归及验证

- 标准检查拒绝自有 HTML/CSS/JS 中新增固定 data:image，并验证上述两处遮罩缓存与各自 SVG 一致；新项目模板不继承这些历史例外。
- 原图解码字节与独立文件 SHA-256 一致；57 个文件均通过真实 Chrome 的 file:// 图片解码。
- 12 个频道直开无新增错误、缺失请求或破图；双入口的无刷新导航、刷新、前进后退、弹窗关闭后点击通过。
- 方案中心五张封面加载、附件图标和预览打开关闭通过；截图已核对。
- check:standards、test:static、生成器回归及知识库检查结果保存于 outputs/standardization-finish-20260925/asset-*。原有 WebGL file-origin 报错单独作为已知基线，不计作通过的渲染能力。

仅本地修改与提交，未推送或部署。AOCI 全量创作尚未结束，页面资源验收不代表正式索引已完成。
