---
name: gaip-modal-maintenance
description: 维护 GAIP 的真实业务弹窗、共享遮罩/定位、关闭后页面点击和全局组件预览。适用于新增弹窗、接入确认组件或弹窗生命周期缺陷；普通页面和纯图片替换不触发，AI Agent 主面板不自动纳入弹窗预览。
---

# GAIP 弹窗维护

目标：业务页面和组件预览使用同一真实弹窗，打开、关闭、再次打开及页面点击均保持正确。

先确认属于包含 `shared/scripts/modal-registry.js` 的 GAIP 仓库。链接相对本 Skill 目录；命令在仓库根运行。

## 找到真实实现

读 [全局框架与样式](../../../knowledge/公共模块/全局框架与样式.md) 的弹窗规则。涉及新增或登记时，再读 [ADR-004](../../../knowledge/决策/ADR-004-弹窗源自登记与自动索引.md) 与 [维护流程](../../../docs/maintenance-workflow.md) 的登记字段。

区分 Ant Modal、原生 dialog、自定义宿主、抽屉和 AI Agent 主面板；后两者不自动接入普通弹窗定位或预览。找到真实 `open/show/create` 入口、显隐状态和 CSS 所属文件，再决定修复位置。

## 处理与验证

- 复用共享确认组件、遮罩和定位；业务只提供内容、参数及操作回调。需要用户指定的新视觉时在对应共享源修改，不在预览页复制外壳。
- 检查初始关闭 → 打开 → 关闭 → 再次打开。重点检查内联 `display:none`、`hidden`、`inert`、遮罩命中、Esc 与焦点恢复；布局规则不能强行显示已关闭宿主。
- 排查重复监听、未清理观察器和 React 管理节点被外部删除的风险，用证据区分具体成因，不把每次点击故障都归于同一个旧问题。
- 登记变化时运行 `node scripts/generate-modal-catalog.cjs`；不手改 generated 文件。所有弹窗任务运行 `node scripts/generate-modal-catalog.cjs --check` 与 `node scripts/test-popup-preview.cjs`，再按维护流程选受影响的业务测试。
- 对层级、点击和布局问题优先做允许的真实浏览器验证。源码/DOM 模拟通过只能说明相应层面的结果；工具拒绝 file 访问时明确剩余验证项。

变更记录关联真实源码、消费者及验证结果。用户仅要求诊断时输出成因与建议，不因 Skill 自动实现或发布。
