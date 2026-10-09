---
title: 桌面测试项目整站验收
updated: 2026-09-22
status: local-preview-verified-with-known-limits
tags:
  - acceptance
---

# 桌面测试项目整站验收

**本地静态预览通过本次验收；没有迁移文稿、推送 GitHub 或部署。** 业务代码基准为 `27480714d372adcd3bcdffc2e024ba9569e37671`。本次只完善中文说明、迁移准备和测试，不改页面业务或视觉参数。

## 验收环境与范围

- 从该提交用 `git archive` 建立不含未发布候选的干净快照：`outputs/final-acceptance/20260922/clean-preview/`。
- Chrome 119，独立临时浏览器上下文，`file://`；未使用用户日常浏览器配置或修改其课程记录。
- 12 个频道直开/刷新与跨频道过程采用 1440×980；学习参考效果另用 1920×1080，中文目录另验 390/1440px。不是所有页面、所有屏宽和所有深层业务均已验收。
- 等待实际频道内容、字体和首屏图片加载；截图只能证明采集时状态，不代表逐像素全站比较。

## 12 个频道结果

以下每个频道都通过：独立入口打开、刷新保留 Hash、从本地登录进入后切换、从学习中心入口切换。导航期间保持主文档会话，未发生整页重载；已加载图片没有坏图，本地请求没有缺失。

| 频道 | 内容就绪的核验点 | 结果 |
| --- | --- | --- |
| 工作台 | 今日核心行情 | 通过 |
| 客户中心360 | 客户列表 | 通过 |
| 保单列表 | 保单号及列表内容 | 通过 |
| 方案中心 | 生成方案业务入口 | 通过 |
| 产品中心 | 产品详情入口 | 通过 |
| 活动中心 | 本季活动内容 | 通过 |
| 资讯中心 | 文章卡片 | 通过 |
| 财富值中心 | 财富值业务页面 | 通过 |
| 配置中心 | 组织架构批量导入入口 | 通过 |
| 薄荷入职引导 | 培训章节内容 | 通过 |
| 线索中心 | 线索工具栏 | 通过 |
| 学习中心 | 课程网格 | 通过 |

主回归：`scripts/test-final-site-browser.cjs`；证据 `outputs/final-acceptance/20260922/browser/results.json` 和 12 张频道截图。根 index.html 使用虚构的非空账号/密码实际点击登录并进入工作台；这只验证本地 Mock 登录。

## 关键交互与样式

| 检查 | 本次实际结果 | 测试入口 |
| --- | --- | --- |
| 学习参考效果 | 根入口仍是登录；三列卡片、绿色按钮、白色顶部、浅灰直播卡片与图片；旧保存路径显示兼容且不改写记录 | test-entry-display-browser.cjs |
| 跨频道与弹层 | 父项纯开合、组织日志宽度及关闭、子页刷新、前进后退、提示弹窗关闭后点击和窄屏关闭 | test-standardized-navigation-browser.cjs |
| 资讯 | 双入口详情打开/关闭/重开/Esc、搜索空结果/重置、精选筛选、焦点恢复 | test-news-templates-browser.cjs |
| 财富值与公告 | 双入口子页、关键词弹窗关闭/重开、公告数据、创建/取消/重开 | test-channel-data-browser.cjs |
| 样式分离 | 线索布局、课程进度、树深度、AI 1440/1000/720px 与全屏/最小化/还原、海报主题 | test-style-separation-browser.cjs |
| 中文目录 | 全部本地链接、搜索/空结果/Esc、键盘焦点、390/1440px 无水平溢出 | test-project-directory-browser.cjs |
| 组件目录 | 10 个页签实际点击、对应面板可见、当前态正确，无脚本错误和资源缺失 | components-results.json |
| 静态与 DOM | 完整 npm test 通过；标准、知识、生成器、导航、弹窗、配置、公告、日志、AI 检查 | tests.log |

日志在 `outputs/final-acceptance/20260922/`，上述专项的截图/JSON 在干净快照自身 outputs 中。学习课程拖拽和直播 480/1440px 专项在同一业务基准的上一轮已经通过，见 `outputs/channel-consolidation/20260922/`；本轮没有把它们写成重新执行的测试。

本轮发现并修正的是测试时序：学习测试尚有字体在加载时就主动刷新，导致字体请求被取消。现在先等 `document.fonts.ready` 再刷新，资源缺失断言仍严格保留；修正后重跑通过。初次失败日志保留在 test-entry-display-browser.cjs.log，最终结果在 entry-display-final.log。

## 已知边界仍然保留

- 原站 WebGL 在 file-origin 下的既有错误仍存在，按同版本 Chrome 的精确错误基线区分；不写成控制台零错误。AI 视频播放、WebGL 动效完整性没有因面板交互通过而被标为通过。
- 真实后台、文件上传、直播播放地址及后台调度未接入。筛选、弹窗和示例数据通过不代表线上业务通过。
- 原站 React/Umi 完整源工程尚未恢复；仍有编译运行时样式例外，不能宣称全部运行时 HTML/JS 已彻底去除样式。
- AOCI 正式索引仍未完成，既有 rc14 素材判定流程阻塞见 [[docs/aoci-integration-blocker]]。
- Obsidian 双链与属性检查通过，不等于已在 Obsidian 应用中逐页验收渲染。
- 未发布的视频实验及其他候选继续排除，不纳入本次“正式页面通过”的结论。

## 日常使用与回退

从根 index.html 登录；中文频道目录在 app/project-index/index.html；每个正式频道 README 现在按“改样式 / 改交互 / 改结构 / 生成文件”说明入口。无需为普通改版打开全部 CSS/JS。

业务回退基准为上面的完整提交；本验收说明所在本地提交保存文档与测试成果。恢复时先保护新增未提交工作，在独立目录核验所需版本，不使用清理候选或硬重置代替备份。文稿迁移只能按照 [[docs/desktop-to-documents-migration|迁移准备清单]] 单独进行，不能用桌面目录直接覆盖文稿。

[[目录说明]] · [[docs/source-file-inventory]] · [[docs/desktop-to-documents-migration]] · [[knowledge/INDEX]]
