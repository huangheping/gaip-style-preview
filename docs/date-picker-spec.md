# 全局日期选择器

本地实现按用户提供的 Ant Design 日历参考统一结构，配色使用项目现有品牌深绿、交互青色与中性色；输入选择条保留各自现有共享样式、日历图标和高度。运行时不新增 CDN 或 React 依赖。

- 源：`shared/scripts/global-date-picker.js`、`shared/styles/global-date-picker.css`。
- 目录：`全局组件/index.html?component=date-picker`，使用真实筛选控件演示单日期与日期范围。
- 筛选栏：`global-filter-bar.js` 的 `date` / `dateRange` 都调用同一日历。范围保留两条既有选择条；开始/结束日期含当天，空的一端不限制。反向范围沿用原字段错误反馈，不触发有效查询。清除移到选择条原有清除图标位置。
- 课程管理：新增“更多筛选 → 创建日期”。按列表显示所使用的浏览器本地日期比较，保持原名称、状态、群组、必修筛选。筛选更新结果并回到第 1 页，重置清空日期。该时间口径是本次未收到用户偏好前采用的默认值。
- 普通弹窗：原生 date / datetime-local 字段由 `modal-controls.js` 调用同一面板；时间列和确定校验仍由原适配器负责。Ant 字段保留真实组件与事件，只给有明确弹窗归属的 Portal 加 `.gaip-ant-date-popup` 以复用日历视觉，语言仍由原应用 locale 提供。抽屉、页面表单与独立纯时间选择器不自动改造。
- 原生字段仍保留 min/max/step、禁用与只读校验；清除使用现有字段尾部图标。单日期点击即生效；日期时间选择日期后仍需确认完整时间。
- 月视图固定周一到周日、6 行日期，显示相邻月份。双箭头翻年、单箭头翻月；标题切换年/月选择。“今天”遵守禁用范围。方向键可跨月，Esc 只关闭日期层；弹窗关闭/筛选隐藏/销毁清理浮层。

## 接入 API

先加载共享 JS/CSS，然后由现有弹层容器调用：

```js
const calendar = window.__GAIP_DATE_PICKER__.mount(panel, {
  value: '2026-09-09',
  isDateEnabled: value => value >= '2026-01-01',
  onSelect: value => { /* 更新原字段、触发原事件并关闭弹层 */ },
  onLayout: () => { /* 切换年月后重定位现有弹层 */ }
});
calendar.destroy();
```

组件仅拥有传入容器内的日历，不复制输入条，不拥有业务状态、外层 Portal 或接口。`parse` / `format` 使用本地日期，输出 `YYYY-MM-DD`。原生弹窗和筛选浮层使用 Popover top layer 防止被父层 overflow 裁切。

资源在所有现有共享弹窗入口和直接源预览中同步加载；学习频道依赖由 `shared/config/channels.js` 登记，跨入口继续复用同一份源码。精确视觉参数唯一记录于 `design-changes/shared-date-picker.json`。

## 验证

- `node scripts/test-filter-bar.cjs`：值、清除、范围、状态、销毁和目录复用。
- `node scripts/test-learning-course-manage.cjs`：创建日期含当天/单边范围筛选与原业务隔离。
- `node scripts/test-date-picker-browser.cjs`：真实 file 目录、原生 dialog、原客户 Ant 组件及学习入口。浏览器依赖使用 `PLAYWRIGHT_MODULE` / `CHROME_PATH` 配置。
- `node scripts/test-filter-bar-browser.cjs`：1440/1100/800/480px 控件溢出与浮层边界。
- 项目导航保护、弹窗目录与表单回归照常执行。未发布。
