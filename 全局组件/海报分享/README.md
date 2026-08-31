# 海报分享全局组件

此目录保留完整的海报模板、预览、个人名片和高清 PNG 导出实现，可直接打开 `index.html` 单独预览。

项目页面统一通过以下全局入口调用：

```js
window.__GAIP_POSTER_SHARE__.open({
  title: '文章标题',
  summary: '文章摘要',
  category: '文章分类',
  tags: ['标签一', '标签二'],
  date: '2026-08-26 21:00',
  score: 89,
  featured: true
});
```

共享外壳位于：

- `../../shared/scripts/global-poster-share.js`
- `../../shared/styles/global-poster-share.css`

外壳只创建一次预览实例，后续打开通过消息更新文章数据，避免反复刷新模板页面。
