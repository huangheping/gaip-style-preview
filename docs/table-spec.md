# GAIP 全局表格

首版：2026-09-09。预览入口：`全局组件/index.html?component=global-table`。首个业务消费者是课程管理；其他表格按页面逐步接入。

## 当前实现与 Ant 的关系

当前仓库是静态薄壳、原站 Umi 构建产物和本地 Mock，共享运行时使用原生 DOM，不新增 React/Ant 运行时，也不修改 `web/`。此版本实现 GAIP 的表格视觉和通用行为规范。正式 React 工程可用 Ant Table（关闭内置分页）与受控 Pagination 组合实现同一规范；本次没有交付 React 包或修改 Ant 源码。

## 高度与布局

表格只包含表头、数据滚动区和分页底栏；不包含业务标题、数量摘要行或页面工具栏。少量记录自然收拢；总高度达到视口或指定容器的可用底边后，只有数据滚动区收缩并滚动。可见表头置于竖向滚动区外，随数据区同步横向滚动；固定列保留自身背景与正确层级；分页不参加内容滚动。分页本身不使用 position: fixed。

通过 ResizeObserver 监测宿主、父级和邻接区域，窗口变化或筛选区域改变时重新计算高度。默认视口底部留 24px；课程管理使用其 main 内容边界及该 main 的底部 padding。极矮窗口至少保留 100px 滚动区，必要时由外层滚动，避免内容和分页互相遮挡。

## 使用

按顺序加载 `shared/styles/global-table.css` 和 `shared/scripts/global-table.js`。课程管理资源通过 `shared/config/channels.js` 登记；组件目录加载同一份文件。

```js
const table = window.__GAIP_TABLE__.mount(root, {
  title: '课程列表',
  rows: [{ id: 'c1', name: '课程名称' }],
  columns: [{ key: 'name', label: '课程名称', width: 240 }],
  pageSize: 10,
  pageSizes: [10, 20, 50],
  boundary: pageMain,
  bottomGap: 0,
  emptyText: '暂无符合条件的记录'
});
table.setRows(filteredRows, true); // 筛选更新并返回第一页
table.destroy(); // 离开视图时释放观察器、事件和动画帧
```

- `columns`：key、label、width、align；fixed 为 left/right，多个固定列须传累计 offset；当前不提供表头排序，数据沿用业务传入顺序。
- `rowVerticalAlign`：`'middle'`（默认）或`'top'`，仅设置正文单元格垂直对齐，表头不变；未知值回退middle。课程日志使用top，其他实例保留默认。配置由共享表格输出，页面无需覆盖td样式。
- `pagination:false`：不生成分页底栏，完整渲染传入的行数组，页码收敛为 1；直播 Banner 管理按产品要求使用。省略此项仍默认每页 10 条，课程和学情等既有消费者不变；大量数据仍应由业务选择分页，不提供虚拟列表。
- 普通值通过 textContent 渲染；render 返回文本或 DOM 节点。renderHTML 只允许应用内部已转义的可信模板，禁止直接传用户输入。课程管理沿用其原有转义模板与 data-lc 业务事件。
- 页面顶栏属于业务页面，使用 gaip-table__button / gaip-table-tools 共享按钮皮肤；表格内不生成标题或工具栏。行操作使用 gaip-table__row-actions，危险操作使用 is-danger，禁用使用原生 disabled。
- `setState('ready'|'loading'|'error')`：加载中/失败时禁用分页；onRetry 接收实例。无数据根据 rows 自动展示。
- `setPage`、`getState`、`refresh`、`setRows`、`destroy`；同一宿主重复挂载自动销毁旧实例。
- 当前分页针对传入的完整本地数组：支持页码、上一页/下一页、10/20/50 条；改变条数回第一页，删除或筛选后的页码自动收敛。异步服务端 total/分页请求、选择行与批量操作尚未实现，后续按实际业务接入。

## 课程管理边界

字段、原排序、课程状态、权限和新增/编辑/上下架/删除逻辑保留；筛选仍由全局筛选栏维护。首列和操作列固定，宽表横向滚动。课程日志、学情两维度统计/详情抽屉/学情日志现已显式接入同一组件，编辑页不变。学情统计固定首列和操作列，详情固定首列；两种日志启用rowVerticalAlign:'top'，其余保持默认middle。各页独立提供字段与数据，不将业务统计放入组件。

## 验证

- `node scripts/test-learning-course-manage.cjs`：字段/业务动作、筛选和分页、取消确认、视图切换和销毁。
- `node scripts/test-learning-v11.cjs`：领域规则、权限和学习流程回归。
- `node scripts/test-global-table-browser.cjs`：依赖 playwright-core 与 Chromium，可通过 PLAYWRIGHT_MODULE、CHROME_PATH 指定本地已有依赖。真实 file 组件目录，课程控制器使用隔离页面壳；检查少量/长列表/宽表、表头与固定列、页码/条数/单页简化、空态/加载/错误重试、缩放及筛选收拢。
- 视觉参数和首次本地依据见 `design-changes/global-table.json`；修改前快照位于来源仓库外的 `本地回退备份/全局表格-20260909-140946`。

## 2026-09-09 简化与 Ant 参考结论

用户明确移除“课程列表＋记录数量”标题行、暂不提供排序。title 配置只作无障碍名称，不生成可见业务标题。

固定列边缘不画竖线；左侧存在已滚过的内容时显示左固定组右边阴影，右侧仍有未展示内容时显示右固定组左边阴影。到达相应端点、变宽到无溢出或切换为空表时移除不需要的阴影。只有固定组的边界列显示，阴影不接收点击。保留横向行分割线。

滚动条沿用 `shared/styles/global-font.css` 的原生宽度与透明轨道；表格内将全局变量 --gaip-scrollbar-thumb 局部覆盖为 rgba(47,54,64,.18)，其他页面保持 .32。竖向滚动条只属于数据正文，表头不在竖向滚动容器内。

参考来源：
- [Ant 表格文档](https://ant.design/components/table-cn/)：默认 bordered=false；固定表头/列、自动高度、单元格省略与提示、空态、分页配置均可独立使用。
- [固定列官方样式](https://github.com/ant-design/ant-design/blob/master/components/table/style/fixed.ts)：使用固定列伪元素内阴影、边界显示状态和 pointer-events:none。GAIP 本轮采用这一表现方式，保留自己的颜色及尺寸。
- [Ant 分页文档](https://ant.design/components/pagination-cn/)：默认页码32px；当前页白底与主题色文字，支持条数选择、快速跳页、单页隐藏、响应式及总数。

分页已按用户要求精简：普通页码无边框，当前页白底绿框；条数选择放在页码后；去掉跳转框和按钮。只有一页时仍显示白底绿框的页码1，隐藏无效的上一页/下一页，保留总数和条数选择；页数多时保留省略号。

可继续采用的细节：长文本省略后提供完整内容提示；标准/紧凑两档密度；数字和时间统一对齐；空态区分“暂无数据”和“无筛选结果”。拖拽、树表、编辑单元格、虚拟列表按实际需要加入，不纳入本轮。

本轮验证：Chromium148确认表格滚动条为原生auto与18%灰色，表格外保持32%；竖向滚动区顶边与表头底边对齐，横向滚动后所有表头与正文列对齐。Chrome119不支持标准颜色时按项目规则原生回退。

无障碍：数据表仍保留视觉隐藏的语义表头；外部可见表头副本设置aria-hidden，避免屏幕阅读器重复播报列标题。

## 表头通栏与自定义每页条数

表头外层底色贯穿整个表格宽度，覆盖竖向滚动条上方的角落；内部表头仍预留正文原生滚动条的占位，保持全部列对齐。

条数选择为自定义combobox，复用 shared/assets/control-down.svg。展开时图标旋转；面板使用白底、淡边框、阴影，当前项浅绿底。面板挂载到body避免被表格裁切，按空间向上/向下展开。点击选项切换条数并回第一页，焦点返回触发器；上下/Home/End移动选项，Enter选择，Esc关闭并返回焦点，Tab/外点关闭；视图重绘、隐藏和销毁清理面板及其监听器。无原生select菜单。

Chromium148已验证通栏宽度、单页1、下拉选中/切换、视口边界、Esc与外点关闭、销毁清理，以及表头与正文对齐。样式记录在 design-changes/global-table.json。

## 无外框、字号与表头高度

表格外圈无边框；表头高度56px、上下内边距16px；表头、正文、时间、行操作和分页文字统一14px；紧凑标签使用独立规格。当前页悬停保留绿色文字与边框，仅背景变为#edf6f3。

Chromium148验证组件目录全部场景、固定列与表头对齐、分页及1440/1100/800视口；完整学习中心课程管理确认表头56px、全部文本14px、四周边框0px和当前页独立hover。1000px视口分页底边976px，正文紧接表头下方滚动。

## 表格内标签

`__GAIP_TABLE__.tag(text, { tone })` 返回静态 span，可直接用于列的 `render`；`tone` 支持 `neutral`（默认）、`success`、`highlight`。非法 tone 回退 neutral，文本用 textContent 写入，不解析 HTML。标签不是按钮，不带关闭或选中交互。

```js
{ key: 'status', label: '状态', render: row =>
  __GAIP_TABLE__.tag(row.statusText, { tone: row.active ? 'success' : 'neutral' }) }
```

标签 CSS 仅在 `.gaip-table` 内生效；课程管理状态与精选标签、组件目录示例共用此入口。课程卡片/详情原有标签及组织架构保持原实现。尺寸和文字排版参考实际加载的 `features/config-center/config-center-content.css` 中的成员标签及其最终覆盖规则（非 organization-source.css 旧快照）；标签使用紧凑字号，作为正文统一字号的例外，颜色取当前课程管理标签，不采用组织架构配色。参数统一记于 `design-changes/global-table.json` 的 tag 记录。

## 待定配色方案

用户要求保留的完整文案与颜色映射见[表格标签五色映射方案v1](table-tag-color-mapping-v1.md)。该方案尚未应用；后续调整另存新版本，保留v1，不将存档视为实施授权。
