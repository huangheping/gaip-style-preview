---
type: component-spec
updated: 2026-10-09
---

# 上传控件预览

[[knowledge/组件/组件索引|返回组件索引]]

`components/index.html?component=uploads` 只有一个“上传”入口。文件和图片在同一页分组，名称在白色卡片外；卡片内只放选择控件、格式限制、选中结果和校验反馈。不嵌入整页，不启动业务弹窗。

## 展示范围

- 文件7项：成员Excel、客户沟通文档、AI Agent附件、课节视频、音频、PDF、讲义。
- 图片5项：课程封面、直播Banner、线索截图、海报头像、微信二维码。
- 财富导入原控件只有Mock提示，没有文件选择器，本轮不放入功能预览。原13个上传子导航和iframe预览撤回；其他目录入口保留。

## 源码与边界

- `upload-sources.js` 登记12个比较场景的来源、格式、大小与数量，不代表12套独立业务实现。
- `scripts/build-upload-preview.cjs` 从组织架构、学习中心、线索及海报的HTML维护源截取10个有界控件；来源更新后运行 `npm run build:templates`。客户与AI Agent入口原来由React创建，目录用轻量按钮/选择器适配，沿用文案和原图标，不宣称完整复用了React业务逻辑。
- `upload-source-styles.generated.css` 提取原控件CSS，统一限定在 `.uploadCatalog .uploadControl` 内，不加载业务整页样式、布局或媒体查询。`upload-controls.css` 只负责目录卡片/结果区及适配入口的布局；宽屏两列，1100px以下单列，避免侧栏挤压预览。
- `upload-controls.js` 仅实现目录本地文件选择、拖入、校验、更换、移除、缩略图及对象URL释放；不发送网络请求、不写localStorage、不调用真实识别/导入/保存。使用“已选择”结果而不是伪造服务端“上传成功”。
- 所有业务页面原实现保持不变，本轮不建立统一业务上传API、不合并各变体。尺寸未知的客户/Agent不猜加业务大小上限。

## 验收

`npm run test:uploads` 验证生成片段新鲜度及12控件DOM交互；全目录回归复用 `scripts/test-component-preview-layout.cjs`。DOM不证明浏览器像素、原生文件对话框或实际图片解码；这些单列未验证。设计参数见 `design-changes/component-catalog.json`，本轮结果见 [[knowledge/变更/当前未发布变更#上传控件单页预览（2026-10-09）]]。
