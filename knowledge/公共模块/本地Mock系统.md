---
type: module
risk: high
---

# 本地 Mock 系统

## 目的

本项目通过 `file://` 直接打开，没有原站会话和后台服务。本地 Mock 是静态预览的运行依赖，不是可随意删除的测试数据。

## 主要文件

- `shared/scripts/local-preview.js`：登录、本地存储兼容、XHR/fetch 拦截和基础响应。
- `features/channel-data/mock-data.js`：工作台、客户、保单、方案、产品和活动等频道数据。
- `features/clues/mock-data.js`：线索中心数据。
- `features/wealth-center/mock-data.js`：财富值导入批次、文件校验、导入记录和个人财富值明细。
- `features/news-center/mock-data.js`：资讯分类、时间分组、文章、详情与分享演示数据。
- `AI Agent/AI Agent本地Mock.js`：AI Agent 对话、历史与状态模拟。

## 修改规则

- 修改字段前先确认原 Umi 页面消费的数据结构。
- 保留加载、空、错误、无权限等需要演示的状态。
- 不能恢复对原站后端的强依赖。

## 关联

- [[../页面/工作台总览]]
- [[../页面/线索中心]]
- [[../页面/财富值中心]]
- [[../页面/资讯中心]]
- [[AI Agent]]
