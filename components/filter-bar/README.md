# 可配置筛选栏

统一单选、输入框直接搜索的组织树下拉、折叠式多选、开关、搜索、日期/数字范围、查询与重置；按页面配置显隐，更多筛选可收起。

此目录保存组件唯一实现，业务与 [组件预览](../index.html) 共用。登记源为 [components-registry.js](../components-registry.js)，修改 API 后同步该登记。

入口：`window.__GAIP_FILTER_BAR__.mount(root, config)`。触发方式：显式挂载，不自动接管旧页面。

- [配置与交互规范](../../docs/filter-bar-spec.md)

输入、事件及销毁以源 API 和上述规范为准；有 mount 返回实例的组件在宿主卸载时调用其 destroy（如果提供），常驻单例不得在每次频道切换重复安装。仅展示组件不伪造卸载 API。私有图片/图标归此组件 assets，公共控件图标/字体允许来自 shared/assets。

当前消费者：学习中心：课程管理与学情管理（组织树同源）；其他页面按需求显式配置，未批量替换。

[项目规范](../../docs/project-standardization-spec.md) · [组件知识索引](../../knowledge/组件/组件索引.md)
