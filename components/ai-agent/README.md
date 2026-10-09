# AI 助手组件

Web 语音/停止预览沿用 2026-10-08 线上原 SVG、CSS 与波形绘制；用户要求仅模拟，确认后追加固定示例文字，不调用麦克风或 ASR。录音期间可直接发送；Esc/最小化/切换会话取消转写。生成停止即时结束本地 SSE 并保留已生成内容。新增 SVG 维护源在 `shared/assets/icons/operations/ai-agent/`。见 [验收](../../outputs/agent-voice-stop-20261008/acceptance.md)。

- `AI Agent.css`：唯一正式 CSS；依次保留基础样式、动画、面板覆盖、悬浮入口。只在这里改样式。
- `AI Agent本地Mock.js`：本地对话、附件、复制和面板业务逻辑。
- `AI Agent入口动效.js`：入口挂载、动效、显隐和生命周期。
- `素材/`：本组件拥有的图片、图标和媒体；未发布候选仍按项目清单排除。

频道入口加载同一份组件。CSS 保持独立，JS 通过 class/data/hidden 切换状态；动态值按项目样式分离规则审查。

旧的 8 月原版已移到 [历史源码归档](../../docs/archive/历史源码/README.md)。合并前四份正式 CSS 可从本地 Git 提交 `5d275e0` 恢复，归档的 8 月原版不是合并前版本。

[CSS/JS 数量说明](../../docs/source-file-inventory.md) · [JS 样式分离约束](../../docs/js-style-separation.md)

固定结构片段维护在本目录 templates/markup-*.html，修改后运行 `npm run build:templates`。对应 JS 顶部 @gaip-markup-cache 是生成缓存，不手改；其下保留业务数据和事件。

## 做方案版本切换

Web 默认临时使用最早的原生技能浮层，复用已有 React/Ant 组件和 CSS。平台技能预览数据复用现有五个方案，原生两个配置技能继续保留。选择、输入框技能标签与前缀、清除、外部点击关闭和发送请求里的 skillName 均由原生组件维护。

- `index.html?agentPlanPicker=transition#/workspace`：过渡版。
- `index.html?agentPlanPicker=current#/workspace`：保留的当前对话内方案/客户卡片版。
- 参数位于 `#` 前；不写参数默认过渡版，不保存到 localStorage。
- 点击侧栏「GAIP Agent助手」标题，可在过渡浮层与原版卡片间即时往返切换；标题外观不变，也支持键盘 Enter/Space。选择器及方案/客户选择重置，对话和当前输入保留；本页生命周期有效，刷新仍按默认过渡版（或显式 URL 参数）启动。
- 永久切回时，将 `AI Agent本地Mock.js` 中 `agentPlanPickerDefaultVersion` 从 `transition` 改为 `current`，并同步入口脚本版本。现有卡片函数、模板与 CSS 完整保留。

本次不修改独立 H5 项目。验证见 [过渡版验收](../../outputs/agent-plan-picker-20261008/acceptance.md)。

过渡浮层打开或原生技能已选中时，按钮复用卡片版的深色选中态；关闭浮层且清除技能后恢复默认描边。两版按钮右侧关闭标记均反白。验证见 [选中按钮验收](../../outputs/agent-plan-picker-selected-20261008/acceptance.md)。

右侧 X 为独立按钮：过渡版调用原生技能标签移除并关闭已打开浮层；current 清除方案/客户选择并关闭卡片，不将 X 点击交给整个选择器。清除复检见 [修复验收](../../outputs/agent-plan-picker-clear-20261008/acceptance.md)。

彩蛋切换使用同一组预览技能数据，避免原生组件挂载时缓存造成后切入浮层缺少方案。原生两个配置技能保留。见 [彩蛋验收](../../outputs/agent-plan-picker-easter-egg-20261008/acceptance.md)。
