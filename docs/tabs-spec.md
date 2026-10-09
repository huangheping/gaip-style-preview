# 下划线 Tab

产品中心、组织架构、学情统计、薄荷入职引导和方案中心共用 `components/tabs/global-tabs.css` 与 `components/tabs/global-tabs.js`。组件库入口：`components/index.html?component=underline-tabs`，预览直接调用同一组件，不复制业务样式。

## 视觉与布局边界

以组织架构/学情的下划线样式为基准，字号、文字颜色、内边距、选中指示条和状态由共享 CSS 维护；最终参数及首次本地来源只维护在 `design-changes/shared-tabs.json`。学习中心此前的变更基准仍保留在 `design-changes/learning-center.json`，不冒充线上基准。

页面负责 Tab 栏所处位置与工具栏布局。产品中心保留装饰底图和计数，组织架构保留原顶部工具栏，学情统计保留返回栏居中及窄屏布局。不要复制一份页面专用 Tab 皮肤；新页面使用下述 API。

2026-10-08：方案中心旧按钮/状态/下划线/焦点皮肤及共享层的两条专属覆盖已删除；频道CSS仅保留Tab栏横向留白、白底和内阴影分隔线。分隔线不得占用固定高度容器的内容区，否则overflow会裁切指示条。其他历史适配器仍覆盖来源皮肤，本次不是五频道全量清理。

## 新实例

```js
const tabs = window.__GAIP_TABS__.mount(root, {
  label: '统计维度',
  value: 'users',
  items: [
    { key: 'users', label: '学员学习统计', count: 24 },
    { key: 'courses', label: '课程学习统计', count: 0 },
    { key: 'future', label: '待开放', disabled: true }
  ],
  onChange(value) { /* 页面更新对应内容 */ }
});
tabs.getValue();
tabs.setValue('courses'); // 程序同步，不再次触发 onChange
tabs.destroy();          // 清理事件与组件创建的内容
```

`key` 应唯一且稳定，选项标签使用纯文本；`count` 可省略，0 正常显示。初始 value 无效时使用首个可用项。重复点击当前项不会触发 onChange。动态更换整组选项时重新 mount；内容区、数据请求及筛选条件由业务管理。

## 现有页面的增强接入

现有产品按钮和入职章节由 React 管理，不能用 mount 重建。因此共享组件内有六处显式适配器：

| 页面 | 容器 | 选中状态来源 |
| --- | --- | --- |
| 产品中心 | `.productArea___xMLm_ .filterTab___qn4xZ` | 原 `active___Sfjac` 类 |
| 组织架构 | `.gaip-config-original .tabs___U1Hwt` | 原 `tabActive___H5olV` 类 |
| 学情统计 | `.lc-stats-tabs` | 原 `aria-selected` |
| 薄荷入职引导 | `.chapterTabs___nqSpI .chapterTabList___bQyho` | 原 `tabActive___RmAMI`；锁定由 `tabLocked___pmXab` 决定 |
| 方案中心 | `.gaip-proposal-tabs` | 原 `is-active` |
| 产品详情（29） | `.productModal___bp0hy .tabList___YJKIv` | 原 `active___o5iJu` |

入职仅增强顶部章节的原 div 节点；支持方向键、Home/End及Enter/Space，键盘跳过锁定章节，鼠标仍交给原锁定提示逻辑。下方胶囊小节和旁边学习进度不替换。方案数量后缀显式使用 `.gaip-tabs-quantity`，不改变视图切换与记录筛选逻辑。

`enhance(root, {label, selected})` 保留按钮、计数节点与原点击处理器，只接入共享标记、ARIA、键盘及选中状态同步；返回 `sync()` / `destroy()`。六处自动适配器监听相关节点替换和状态类变化，离开页面销毁旧实例，重新渲染后恢复键盘焦点。`get(root)` 用于检查已挂载实例，`refresh()` 用于主动扫描。产品详情仅增强原React按钮，不挂载第二套页签；页面保留工具栏布局，私有页签皮肤已移除。

左右方向键循环切换，Home/End 到首尾可用项；跳过禁用项，使用原按钮 click 路径。控件提供键盘焦点框并遵循减少动态效果偏好。父页面不应再次处理同一方向键。栏目本身不定义业务内容面板 ID，内容关联由页面按需要补充。

五个频道在 `shared/config/channels.js` 使用完全相同的资源 URL，加载器去重，跨 HTML / Hash 切换沿用同一份源码。只读 `web/` 样式快照及配置中心旧基线不改写；共享规则在增强标记存在时优先，未接入区域不受影响。

## 无动画切换与节点生命周期

下划线切换不播放过渡或动画，选中文字与普通文字同色。当前项标签复用全局粗体，非当前项常规字重。共享 `mount` 创建的“保险 (24)”中，仅“(24)”后缀通过 `.gaip-tabs-quantity` 使用常规字重，“保险”仍随当前态加粗。产品中心复用原数量外层 `span:has(> .val___uBwax)` 实现同样字重，源非换行空格保留，不重建或搬动 React 节点；新组件用后缀外边距提供标签间隔。未选中项的 hover 反馈、计数色及指示条几何保持原样；具体参数见视觉台账。共享 Tab 局部覆盖全局字重变量，不改变其他组件字体。

切换当前选项仍只更新选中状态和下方内容，不替换或临时移除 Tab 容器/按钮。离开频道、销毁页面时才释放实例；保留稳定节点以维持焦点和事件，不因为取消动画撤销原生命周期修复。

学情 `renderStats()` 保留返回栏及 Tab，重挂载下方筛选/表格，维度切换仍清空筛选并回到第一页。组织 `renderOrganization()` 保留头部，刷新树及成员区，搜索控件替换且批量导入按钮不重复。产品原 React 按钮使用稳定分类 key，仅更新选中类，保持原路径。

## 验证边界

- `test-information-modal-lifecycle.cjs`：29真实产品来源组件的自动接入、字号/栏高/内边距/字重CSS、鼠标和键盘切换、原节点稳定与附件面板、关闭/重开（DOM）。不证明实际像素与命中位置。

- `test-tabs-additional-channels-browser.cjs`：入职章节与方案原页面结构夹具，核对共享样式、旧CSS后加载、数量字重、锁定/解锁、键盘、原节点与点击处理及小节胶囊隔离；追加方案/工作台两个真实file入口在1440/480px的指示条可见高度、栏高、数量字重、两个面板、键盘及同文档检查，不代表完整方案业务验收。
- `test-tabs-browser.cjs`：独立浏览器中加载三处真实 CSS，比较计算样式、两种样式加载顺序、原产品按钮与事件、计数、禁用、键盘、节点替换、减少动态效果及窄屏。
- `test-learning-study-browser.cjs`：真实学情控制器的 Tab 无中间宽度、稳定实例、快速反向切换及原业务交互回归。
- `test-config-organization-shared.cjs`：真实组织控制器的渠道切换/键盘焦点、稳定 Tab、无重复头部控件（DOM）。
- `test-config-tabs-animation-browser.cjs`：真实组织控制器无过渡帧、稳定实例、快速反向切换、键盘及树内容更新。三个浏览器测试复用 `tabs-animation-check.cjs`（保留历史文件名），检查没有 transitionrun 且各帧宽度直接到目标值；产品采用原结构/原类切换的独立夹具，非完整 React 页面验收。
- `test-component-preview-layout.cjs`：目录登记、真实组件挂载与示例切换（DOM）。

独立夹具不等于完整页面验收；2026-10-08已在允许的本地浏览器中验证上述两个file入口的方案顶部Tab。其他范围仍按各次测试证据区分，不把历史访问限制当成永久不可用。仅本地修改，未部署。
