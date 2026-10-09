# 日期选择器

统一使用 Ant Design 日历样式，选择条保留现有规范；支持单个日期、日期范围及弹窗日期字段。

此目录保存组件唯一实现，业务与 [组件预览](../index.html) 共用。登记源为 [components-registry.js](../components-registry.js)，修改 API 后同步该登记。

入口：`window.__GAIP_DATE_PICKER__.mount(panel, options)`。触发方式：由现有日期选择条打开。

- [接入规范](../../docs/date-picker-spec.md)

输入、事件及销毁以源 API 和上述规范为准；有 mount 返回实例的组件在宿主卸载时调用其 destroy（如果提供），常驻单例不得在每次频道切换重复安装。仅展示组件不伪造卸载 API。私有图片/图标归此组件 assets，公共控件图标/字体允许来自 shared/assets。

当前消费者：普通弹窗：日期与日期时间字段；学习中心课程管理：共享筛选栏日期组件。

[项目规范](../../docs/project-standardization-spec.md) · [组件知识索引](../../knowledge/组件/组件索引.md)
