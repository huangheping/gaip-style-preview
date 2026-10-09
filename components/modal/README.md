# 共享弹窗

`global-modal.js` 暴露 `window.__GAIP_MODAL_COMPONENT__`。`createConfirm(options)` 创建确认内容，`setConfirmState` 更新状态；`adoptForm`、`adoptClose` 与 `adoptInteriors` 采用真实业务节点。业务方仍负责挂载、showModal、业务回调和关闭/销毁，组件不接管数据提交。

本目录 CSS/JS 管理外壳、遮罩和定位；内置确认不得在频道复制第二套结构。字段反馈返回的实例有 destroy，应随宿主清理。

Ant 信息弹窗的静态外观不依赖CSS结束事件：28—31来源调用显式设置`transitionName: ''`及`maskTransitionName: ''`，27的客户/方案来源调用通过`withoutInformationMotion(Component, React, ConfigProvider)`取得稳定组件，在局部Ant上下文中关闭motion，不修改只读基线或原业务子节点。禁止用CSS零时长模拟可靠结束；宿主显隐仍由原业务open状态和rc-dialog管理。来源回归`node scripts/test-information-modal-lifecycle.cjs`包含旧实现负对照、关闭/遮罩清理/重开及产品晚响应保护，不派发动画结束事件；不能代替浏览器实际命中与焦点验收。

[弹窗维护规则](../../.agents/skills/gaip-modal-maintenance/SKILL.md) · [真实预览](../弹窗预览.html) · [组件索引](../../knowledge/组件/组件索引.md)

固定结构片段维护在本目录 templates/markup-*.html，修改后运行 `npm run build:templates`。对应 JS 顶部 @gaip-markup-cache 是生成缓存，不手改；其下保留业务数据和事件。
