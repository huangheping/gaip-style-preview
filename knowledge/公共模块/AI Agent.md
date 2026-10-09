---
type: module
risk: medium
---

# AI Agent

## Web 语音与停止生成（2026-10-08）

共享面板从线上复用麦克风/停止 SVG、录音状态 CSS 和 Canvas 波形绘制；用户明确要求仅模拟，本地不调用麦克风、WebSocket 或 ASR。点击麦克风启动模拟波形/计时，再点确认将固定示例文字追加到现有草稿；录音时发送可直接发送模拟文字。Esc、最小化或切换会话取消待完成转写。模板拥有结构、CSS 拥有外观，Mock 用 class/data/hidden 切换。

生成期间以线上黑圆白方块停止按钮替代原发送按钮。Mock 保存活动 SSE 控制器，停止/AbortSignal/reader cancel 清理定时器并立即结束流；历史保留已生成部分，无文本时显示“已停止生成。”，之后可继续发送。正常历史/发送清除遗留空会话隐藏标记。原生 runtime 和两版方案选择保留。证据与验收范围见 [本轮验收](../../outputs/agent-voice-stop-20261008/acceptance.md)。

## Web 做方案临时过渡版（2026-10-08）

标题彩蛋：侧栏「GAIP Agent助手」使用外观不变的 button；点击/键盘切换内存中的版本，不刷新或持久化。先通过原生外部 mousedown 关闭浮层、调用技能标签原生移除，下一帧切换接管，避免退场时 toggle 反向重开；方案/客户选择重置，对话/草稿保留。两模式都返回相同平台技能预览数据，供 React 挂载缓存后的切换复用。刷新默认过渡版，显式参数仍有效。实际往返/选中清除/刷新验证见 [彩蛋验收](../../outputs/agent-plan-picker-easter-egg-20261008/acceptance.md)。

默认 `agentPlanPickerDefaultVersion = 'transition'`。链接加 `?agentPlanPicker=current` 可恢复保留的对话内方案/客户卡片模式，参数放在 Hash 前；非法值回退默认值，不持久化。永久停用过渡版时只需切换默认值并同步入口版本。配置及点击接管位于 `components/ai-agent/AI Agent本地Mock.js`。

过渡版将点击交还原生 React/Ant 技能浮层，保留 React 图标节点，复用既有 CSS 与五个方案的预览数据；两个原生配置技能继续显示。原生组件维护选中、技能标签、输入前缀、清除、外部关闭及发送请求 skillName。当前卡片函数、模板和 CSS 保留，独立 H5 不变。

具体切换说明见 [组件说明](../../components/ai-agent/README.md)，验证范围及两版截图见 [本轮验收](../../outputs/agent-plan-picker-20261008/acceptance.md)。

过渡版原生浮层显示/隐藏及技能标签选择/清除同步共享按钮选中类，复用当前卡片版深色底、白色图标和文字。两版按钮右侧 X 由共享 CSS 反白。弹层仅观察原生显示类变化，关闭面板后不继续恢复状态；两版按钮复检见 [验收记录](../../outputs/agent-plan-picker-selected-20261008/acceptance.md)。

续修：按钮 X 不再使用装饰伪元素，改为 HTML 模板的独立 button。捕获阶段阻止选择器再次触发；过渡版调用 React 原生技能标签关闭处理，不直接删除 React DOM 或改写 runtime；current 清空方案/客户并关闭卡片。键盘 Enter/Space 在 X 上使用按钮原生点击，主按钮键盘委托跳过此子按钮。见 [清除验收](../../outputs/agent-plan-picker-clear-20261008/acceptance.md)。

## Web输入提示（2026-10-09）

- 对照独立移动H5的现有文案与滚动节奏，空输入依次展示“有问题，随时问我…”与“输入 / 以查看可用方案技能”；原版及过渡版共用，选择方案不替换提示。动态偏好设为减少时固定展示技能提示。
- 模板叠层仅作视觉提示，aria-hidden且不拦截点击；原生textarea保留静态placeholder。输入/清空、草稿还原、发送清空和React重挂载时同步显隐，局部观察器恢复被React重设的placeholder，保持幂等。
- 原输入节点、输入/变化事件和原生斜杠技能查询保留。状态/重挂载回归为 `scripts/test-agent-composer-hint.cjs`；样式参数见 `design-changes/ai-agent-composer-hint.json`。DOM通过不等于实际Umi视觉验收。

## 范围

全局悬浮入口、展开面板、对话交互、推理状态、历史对话、本地 Mock、CSS 动画及图片/视频素材。

## 位置

- 代码：`components/ai-agent/`
- 素材：`components/ai-agent/素材/`
- 本地数据：`components/ai-agent/AI Agent本地Mock.js`

## 当前状态

截至 2026-08-26，正式入口使用 V2 机器人猫视频，并根据空闲、处理、完成和面板最小化状态切换表现；处理态使用独立的“小面罩代码滚动”循环视频。未被正式入口使用的 `creative-8/9` 与 `备份.mp4` 继续只保留在本地。

## 入口生命周期与版本切换

- 唯一脚本为 `components/ai-agent/AI Agent入口动效.js`；15 个根入口统一引用当前共享脚本缓存版本。
- V1/V2 切换仍绑定顶部日期；选择结果使用现有本地存储逻辑，默认 V2，不新增版本按钮。
- 入口不能在首次挂载后停止观察：登录、Hash 路由或 React 重建可能替换入口/顶栏节点，必须重绑并恢复当前版本及处理状态。
- 仅相关结构变化调度检查，挂载保持幂等；旧 WebGL、Lottie、视频及提示定时器在入口被替换或移除时清理。
- 悬浮入口普通状态保留高于虚拟资讯页的层级；可见 Ant 弹窗遮罩期间通过状态属性降至遮罩下并禁用点击。根观察器处理遮罩插入/移除，局部属性观察器仅监听遮罩及其 modal root 的显隐/最小化变化；关闭、最小化及入口重建时重新同步。工作台/资讯页实测与生命周期回归见 [遮罩层级验收](../../outputs/agent-entry-mask-20261008/acceptance.md)。
- `scripts/test-agent-entry.cjs` 覆盖上述生命周期；代码测试通过，真实 Umi 路径与视频/WebGL 效果仍待手工确认。修复 `ee5c3e9` 已发布，详见 [[../变更/2026-08-31-工作台对齐与共享控件修复#AI Agent 登录后入口与版本切换恢复|本次修复]]。

## 附件类型展示

- 待发送及用户消息附件由本地 Mock 增强层按扩展名匹配图片、PDF、Word、Excel 图标（大小写与 doc/xls 兼容）；未知类型保留原回形针。图标资源位于 `components/ai-agent/素材/附件类型/`。
- 沿用面板内的局部观察器，支持附件异步挂载及文件名节点复用；通过 data 属性/CSS 更新外观，保留 React 拥有的 SVG 节点，避免上传中切换原生图标时 removeChild 冲突。
- 回归：`scripts/test-agent-attachment-icons.cjs`，视觉参数见 `design-changes/ai-agent-attachments.json`。

## 消息复制

- 用户文字与 AI 正文下方统一复制入口，使用 `素材/复制文本.svg` 与 `素材/复制成功.svg`，成功后 2 秒恢复，同时浮层显示“消息已复制”或“回答已复制”。纯附件消息无空复制入口；推理过程和附件名不拼入正文。
- 本地增强层复用面板观察器，保留 React 消息节点和原生代码块复制功能；Clipboard API 不可用时回退选择复制，失败时显示提示。
- 回归：`scripts/test-agent-message-copy.cjs`；视觉参数见 `design-changes/ai-agent-message-copy.json`。

## 修改边界

- AI Agent 是跨频道全局模块，不在某个频道目录内复制一份实现。
- 虚拟频道不得对包含 AI Agent 入口的整个主内容节点设置 `inert`、`aria-hidden` 或阻断点击的覆盖层；只能禁用被虚拟页覆盖的业务内容子项，并明确保留全局入口可见、可命中、可点击。
- 不在 `components/ai-agent/` 中新建页面入口 HTML。
- 素材引用保持本地化，删除或移动前必须搜索全部引用。
- 修改入口后验证多个频道直接打开和 Hash 切换后的状态。

## 关联

- [[全局框架与样式]]
- [[本地Mock系统]]
- [[../变更/当前未发布变更|当前未发布变更]]
