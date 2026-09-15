# 下划线 Tab

产品中心、组织架构和学情统计共用 `shared/styles/global-tabs.css` 与 `shared/scripts/global-tabs.js`。组件库入口：`全局组件/index.html?component=underline-tabs`，预览直接调用同一组件，不复制业务样式。

## 视觉与布局边界

以组织架构/学情的下划线样式为基准，字号、文字颜色、内边距、选中指示条和状态由共享 CSS 维护；最终参数及首次本地来源只维护在 `design-changes/shared-tabs.json`。学习中心此前的变更基准仍保留在 `design-changes/learning-center.json`，不冒充线上基准。

页面负责 Tab 栏所处位置与工具栏布局。产品中心保留装饰底图和计数，组织架构保留原顶部工具栏，学情统计保留返回栏居中及窄屏布局。不要复制一份页面专用 Tab 皮肤；新页面使用下述 API。

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

现有产品按钮由 React 管理，不能用 mount 重建。因此共享组件内有三处显式适配器：

| 页面 | 容器 | 选中状态来源 |
| --- | --- | --- |
| 产品中心 | `.productArea___xMLm_ .filterTab___qn4xZ` | 原 `active___Sfjac` 类 |
| 组织架构 | `.gaip-config-original .tabs___U1Hwt` | 原 `tabActive___H5olV` 类 |
| 学情统计 | `.lc-stats-tabs` | 原 `aria-selected` |

`enhance(root, {label, selected})` 保留按钮、计数节点与原点击处理器，只接入共享标记、ARIA、键盘及选中状态同步；返回 `sync()` / `destroy()`。三处自动适配器监听相关节点替换和状态类变化，离开页面销毁旧实例，重新渲染后恢复键盘焦点。`get(root)` 用于检查已挂载实例，`refresh()` 用于主动扫描。

左右方向键循环切换，Home/End 到首尾可用项；跳过禁用项，使用原按钮 click 路径。控件提供键盘焦点框并遵循减少动态效果偏好。父页面不应再次处理同一方向键。栏目本身不定义业务内容面板 ID，内容关联由页面按需要补充。

三个频道在 `shared/config/channels.js` 使用完全相同的资源 URL，加载器去重，跨 HTML / Hash 切换沿用同一份源码。只读 `web/` 样式快照及配置中心旧基线不改写；共享规则在增强标记存在时优先，未接入区域不受影响。

## 无动画切换与节点生命周期

下划线切换不播放过渡或动画，选中文字与普通文字同色，仅当前项复用全局粗体，非当前项使用全局常规字重。未选中项的 hover 反馈、计数色及指示条几何保持原样；具体参数见视觉台账。共享 Tab 局部覆盖全局字重变量，不改变其他组件字体。

切换当前选项仍只更新选中状态和下方内容，不替换或临时移除 Tab 容器/按钮。离开频道、销毁页面时才释放实例；保留稳定节点以维持焦点和事件，不因为取消动画撤销原生命周期修复。

学情 `renderStats()` 保留返回栏及 Tab，重挂载下方筛选/表格，维度切换仍清空筛选并回到第一页。组织 `renderOrganization()` 保留头部，刷新树及成员区，搜索控件替换且批量导入按钮不重复。产品原 React 按钮使用稳定分类 key，仅更新选中类，保持原路径。

## 验证边界

- `test-tabs-browser.cjs`：独立浏览器中加载三处真实 CSS，比较计算样式、两种样式加载顺序、原产品按钮与事件、计数、禁用、键盘、节点替换、减少动态效果及窄屏。
- `test-learning-study-browser.cjs`：真实学情控制器的 Tab 无中间宽度、稳定实例、快速反向切换及原业务交互回归。
- `test-config-organization-shared.cjs`：真实组织控制器的渠道切换/键盘焦点、稳定 Tab、无重复头部控件（DOM）。
- `test-config-tabs-animation-browser.cjs`：真实组织控制器无过渡帧、稳定实例、快速反向切换、键盘及树内容更新。三个浏览器测试复用 `tabs-animation-check.cjs`（保留历史文件名），检查没有 transitionrun 且各帧宽度直接到目标值；产品采用原结构/原类切换的独立夹具，非完整 React 页面验收。
- `test-component-preview-layout.cjs`：目录登记、真实组件挂载与示例切换（DOM）。

上述独立测试不等于完整本地页面视觉验收；完整 file 入口受浏览器访问策略限制，需在用户现有本地页面刷新确认。仅本地修改，未部署。
