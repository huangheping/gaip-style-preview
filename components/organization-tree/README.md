# 组织选择树

入口为 `window.__GAIP_ORG_TREE__.mount(root, options)`，节点渲染入口为 `node`。挂载实例提供 search、setValue、destroy；destroy 移除事件并清空宿主。点击箭头展开，点击节点选择；保留方向键、Home/End 和 Enter/Space 操作。

节点数据由消费者提供，组织数据存储位于 shared/scripts/organization-store.js。文件夹图片和图标在本目录 assets，不再借用配置中心的私有素材。

[筛选栏接入规范](../../docs/filter-bar-spec.md) · [组件索引](../../knowledge/组件/组件索引.md)

固定结构片段维护在本目录 templates/markup-*.html，修改后运行 `npm run build:templates`。对应 JS 顶部 @gaip-markup-cache 是生成缓存，不手改；其下保留业务数据和事件。
