# 全局表格

统一表头、操作按钮和分页。内容少时自然收拢，达到可用高度后数据区域独立滚动。

此目录保存组件唯一实现，业务与 [组件预览](../index.html) 共用。登记源为 [components-registry.js](../components-registry.js)，修改 API 后同步该登记。

入口：`window.__GAIP_TABLE__.mount(root, config)`。触发方式：显式挂载。

- [接入规范](../../docs/table-spec.md)

输入、事件及销毁以源 API 和上述规范为准；有 mount 返回实例的组件在宿主卸载时调用其 destroy（如果提供），常驻单例不得在每次频道切换重复安装。仅展示组件不伪造卸载 API。私有图片/图标归此组件 assets，公共控件图标/字体允许来自 shared/assets。

当前消费者：学习中心的课程、直播、学情统计与详情、课程与直播日志及学情日志；活动中心报名记录弹窗；配置中心组织架构操作日志弹窗；共享操作日志弹窗版；组件目录演示。按频道和具体表格列出的清单维护在 [组件登记](../components-registry.js) 的 `global-table.usages`，与目录展示同源。

边界：共享操作日志页面内联版、组织成员列表和活动主列表尚未接入完整表格；其他旧表格仅采用统一标签，不等同于使用完整表格组件。更多操作通过 `createActionMenu` 显式接入，目前仅课程管理与组件目录使用。

[项目规范](../../docs/project-standardization-spec.md) · [组件知识索引](../../knowledge/组件/组件索引.md)

## 表格标签

`global-table-tag.js` 和 `global-table-tag.css` 统一新旧表格及日志标签；原 `tag()` 接口委托共享工厂。文案分类、六种基础色与推荐金色与范围见[标签规范](../../docs/table-tag-spec.md)，在[分类预览](../index.html?component=table-tags)可搜索文案和筛选颜色。旧页面无需替换 React 节点。

持牌与六种规划方向默认带同源内联 SVG；图标结构维护于 `templates/markup-global-table-tag.html`，修改后运行 `npm run build:templates`。来源许可见 `ICONS-LICENSE.txt`，尺寸及颜色由共享标签 CSS 统一控制。

目录的项目使用位置提供查看按钮：业务页面在新标签页打开，信息弹窗使用已有 `弹窗预览.html?embed=<id>` 真实源入口。组件目录自身的演示按钮留在当前页。

标签组合使用 `__GAIP_TABLE_TAG__.createGroup(items, {label})` 或容器标记 `data-gaip-table-tag-group`。组件预览提供尺寸说明与真实表格行的宽窄列对照；工厂标签超宽时省略并提供可键盘访问的全文提示，旧React节点不重包。
