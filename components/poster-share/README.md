# 文章海报分享

统一展示文章海报模板、个人名片设置、精细预览和高清 PNG 导出。

此目录保存组件唯一实现，业务与 [组件预览](../index.html) 共用。登记源为 [components-registry.js](../components-registry.js)，修改 API 后同步该登记。

入口：`window.__GAIP_POSTER_SHARE__.open(article)`。触发方式：data-gaip-poster-share-trigger。



输入、事件及销毁以源 API 和上述规范为准；有 mount 返回实例的组件在宿主卸载时调用其 destroy（如果提供），常驻单例不得在每次频道切换重复安装。仅展示组件不伪造卸载 API。私有图片/图标归此组件 assets，公共控件图标/字体允许来自 shared/assets。

当前消费者：资讯中心：列表与文章详情的“分享”入口；全局组件目录：真实海报数据与模板预览。

[项目规范](../../docs/project-standardization-spec.md) · [组件知识索引](../../knowledge/组件/组件索引.md)

固定结构片段维护在本目录 templates/markup-*.html，修改后运行 `npm run build:templates`。对应 JS 顶部 @gaip-markup-cache 是生成缓存，不手改；其下保留业务数据和事件。
