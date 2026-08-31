# GAIP 全局组件目录

此目录用于集中预览和登记项目中的全局组件。预览页直接加载 `shared` 目录中的真实组件文件，不维护独立的演示版样式。

## 文件结构

- `index.html`：可直接通过本地文件打开的组件目录。
- `components-registry.js`：组件名称、来源、调用方式和使用位置清单。
- `components-preview.js`：目录渲染和真实组件预览动作。
- `components-preview.css`：仅负责组件目录页面的布局样式。
- `海报分享/`：文章海报分享的独立组件项目、模板图片和导出实现。
- `../shared/scripts/global-multi-select.js`：折叠式多选下拉的真实共享逻辑。
- `../shared/styles/global-multi-select.css`：折叠式多选下拉的真实共享样式。

## 新增规则

1. 全局组件实现继续放在 `shared/scripts`、`shared/styles` 或对应的共享资源目录中。
2. 在 `components-registry.js` 中登记组件、真实来源文件和项目使用位置。
3. 在 `components-preview.js` 的 `runPreview` 中接入真实组件的预览动作。
4. 预览页不得复制组件实现或单独维护一套组件样式。

## 当前组件

| 组件 | 全局入口 | 当前使用位置 |
| --- | --- | --- |
| AI 内容重要提示 | `window.__GAIP_AI_NOTICE__.show(options)` | AI Agent、资讯中心 |
| 折叠式多选下拉 | `window.__GAIP_MULTI_SELECT__.mount(root, options)` | 活动中心筛选视觉标准、其他多选筛选场景 |
| 文章海报分享 | `window.__GAIP_POSTER_SHARE__.open(article)` | 资讯中心列表、文章详情、全局组件目录 |
