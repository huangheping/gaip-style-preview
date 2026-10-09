# 轮播切换

活动中心同款圆形箭头与短条指示点；单组隐藏，支持手动循环切换。内容布局与自动播放由业务决定。

此目录保存组件唯一实现，业务与 [组件预览](../index.html) 共用。登记源为 [components-registry.js](../components-registry.js)，修改 API 后同步该登记。

入口：`window.__GAIP_CAROUSEL_CONTROLS__.mount(root, options)`。触发方式：显式挂载。

- [接入规范](../../docs/carousel-controls-spec.md)

输入、事件及销毁以源 API 和上述规范为准；有 mount 返回实例的组件在宿主卸载时调用其 destroy（如果提供），常驻单例不得在每次频道切换重复安装。仅展示组件不伪造卸载 API。私有图片/图标归此组件 assets，公共控件图标/字体允许来自 shared/assets。

当前消费者：活动中心：原 Banner（保留原生指示器与轮播）；学习中心：直播卡片按组切换。

[项目规范](../../docs/project-standardization-spec.md) · [组件知识索引](../../knowledge/组件/组件索引.md)

固定结构片段维护在本目录 templates/markup-*.html，修改后运行 `npm run build:templates`。对应 JS 顶部 @gaip-markup-cache 是生成缓存，不手改；其下保留业务数据和事件。
