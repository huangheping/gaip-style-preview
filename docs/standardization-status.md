---
type: implementation-report
project: GAIP 本地静态预览版
status: implemented-with-verification-limits
updated: 2026-09-26
---

# 项目标准化实施状态

整理最初在桌面测试项目完成；2026-09-23 获用户正式迁移授权，2026-09-25 已将整理结果应用到 `/Users/hhp/Documents/GAIP项目集/样式优化html`。迁移前备份、原项目新增图标保护及正式验收见 [[docs/formal-migration-20260923]]。**仅本地提交，禁止推送或部署**。2026-09-26 已完成本轮目录、HTML/CSS/JS 与固定图片分离、知识和生成器落地，以及 AOCI 正式文本索引补建与治理对齐。下列运行时例外、Obsidian 界面和全分支验收限制仍如实保留，不声称所有软件行为均已验证。

返回 [[knowledge/INDEX|知识索引]]；要求见 [[docs/project-standardization-spec|规范]]，逐项结果见 [[docs/project-standardization-checklist|验收清单]]。

## 已落地

- 根目录收尾已归档 workbuddy、qa 和 design-qa.md 到 docs/archive；初始化备份进入 outputs，逐文件 SHA-256 一致。修复入口生成器误把导航文字别名写成文件的缺陷，误生成文件也归档保留。旧根 HTML 本轮已归档，根目录仅保留 index.html 登录页；中文项目目录独立在 app/project-index/index.html。

- 12 个频道及登录/登录视频测试入口分属 `channels/` 下的 14 个目录，每个目录有自己的 HTML、CSS、JS；频道私有图片、图标、文档和视频进入本频道 assets。
- `components/` 管理真实共享组件、组件私有资产、组件目录及弹窗预览；公共字体、导航、注册器和 Mock 支撑仍在 shared。组件预览与业务使用同一实现。
- 频道 index.html 是入口维护源，根 index.html 是自动生成的登录入口，app/project-index/index.html 是中文目录，实际预览入口均位于频道目录。注册事实以 `shared/config/channels.js` 为准；生成的结构清单不手工维护。
- 活跃 HTML 无 style 属性、style 标签、内联执行脚本或内联事件。配置中心的主体、表单、部门菜单与示例行已抽为 HTML 模板；学习首页已抽为 HTML 模板。由构建脚本生成普通 JS 模板注册文件，以兼容 file://，不在浏览器 fetch 本地 HTML。
- 9 组原站频道分包已拆为频道 index.html 内的 HTML 模板、page.css 与 page.js，原站 web 基线保留不改；本地公共运行时副本位于 shared/runtime，负责兼容已移动的 AI 助手路径。没有假装获得原始 React 工程。
- Obsidian Vault 设置、总索引、页面索引、组件索引、项目约束和 GitHub 本地同步规则留在本项目。新页面/新项目生成器可运行，新项目不依赖本项目路径，也不复制 GAIP 数据和 AOCI baseline。
- 续接完成资讯中心的主体、文章卡片、日期分组与详情 HTML 模板，业务入口和组件预览同源加载；54 项原/新 HTML 与 DOM 对比通过。真实浏览器发现并修复详情焦点缺失，打开聚焦关闭按钮、关闭返回文章按钮，两入口的搜索、筛选、重复开关与 Esc 通过。
- `check:knowledge` 增加 YAML 解析、重复属性、嵌套值、默认列表和有效日期检查，并以实际失败样例验证。最终 102 份 Markdown 中 72 份有可选属性，全部通过；ADR 模板使用 Obsidian 官方日期变量，真实笔记不得遗留未展开日期。

## JS 样式清理（2026-09-22）

已迁出自有脚本的固定样式与 HTML 字符串 style；动态几何/业务值按表达式登记，编译和第三方遗留按文件哈希锁定。新增 AST 检查进入标准检查与新项目模板。详细范围和保留边界见 [[docs/js-style-separation]]；不能据此宣称整个编译框架零运行时 style。

## 验证边界与保留项

1. **HTML 与运行时边界。** 9 组旧编译页面的视图已拆为 317 个可编辑 HTML 模板，固定样式归 CSS，事件与动态数据留 JS；详见 [[docs/html-source-restoration-20260925]]。剩余自有静态结构已完成 343 份片段迁移（[[docs/markup-source-completion-20260925]]）；React/Ant 组件内部及数据循环仍有动态结构，框架也会产生运行时样式；不能宣称整个项目零 JS 渲染、完整原生 HTML/无障碍重写或恢复原始 TSX 工程。
2. **AOCI 正式文本索引已对齐。** 762 条真实文本对象语义已写入，Verify 结构有效且治理对齐，Check 为 ok/退出码 0，Guide 为 complete/aligned、无下一动作；缺失、过期、孤儿、未绑定和待恢复事务均为 0。另有 208 个工具技术跳过项（188 binary、20 oversize，包括两份 Umi 大运行库），不是已创作 Entry，也不是未裁决的删除候选。未修改受管范围来凑完成率，不能把 762 条表述为全部物理文件均有语义。工具仍为已验证的固定官方 dev 构建，详见 [[docs/aoci-integration-blocker]]。
3. **Obsidian 界面验收。** 双链目标、YAML 属性和配置已静态检查；当前未找到可调用的 Obsidian CLI 或常规安装位置的应用，未在阅读视图、关系图和反向链接面板验收。普通 Markdown 阅读器不原生解析 Wikilink；面向 GitHub 的操作入口保留标准 Markdown 链接。属性与日期模板分别依据 [官方 Properties](https://help.obsidian.md/properties) 和 [Templates](https://help.obsidian.md/plugins/templates)。
4. **全站视觉与真实服务。** Chrome 119 的迁移前基线即有 WebGL file-origin 错误，本次仍保留该已知问题。真实后台、视频直播/上传与全站所有窄屏布局没有因为静态/DOM 检查通过而视为已验收。

## 本地维护命令

本轮收尾证据位于 `outputs/standardization-finish-20260925/`：`aoci-batches/` 保存完整批次申请和写入回执；`verify-current.json`、`check-current.json`、`guide-current.json` 是最终机器结果；`final-standards.log`、`final-knowledge.log`、`final-diff-check.log` 是收尾检查。此前页面恢复、片段和图片的真实浏览器证据仍采用各专题记录，不将本次文档检查冒充重跑全部页面。

| 命令 | 内容 |
| --- | --- |
| `npm run build:templates` | 从频道 HTML 模板生成 file:// 可用的模板注册脚本 |
| `npm run build:entries` | 从目录模板和唯一注册表生成中文目录/结构清单 |
| `npm run check:standards` | 频道文件、资源归属、HTML 分离、HTML/CSS 本地路径及生成物新鲜度 |
| `npm run check:knowledge` | 活跃知识双链目标、全库可选 YAML 属性、真实失败样例；不改历史记录 |
| `npm run test:scaffold` | 新项目可独立运行、拒绝覆盖/越界及实际失败样例 |
| `npm test` | 上述本地检查及既有导航、配置、弹窗、日志、AI 入口 DOM 回归 |
| `npm run new:page -- --id example --title 示例` | 新增标准独立页面骨架，接入 SPA 仍需登记和业务实现 |
| `npm run new:project -- --target /明确的新项目路径 --title 新项目` | 在新目录生成规范/知识/模板/本地检查；拒绝覆盖已有目标 |

以上规则仅约束携带这些文件的项目，没有改动全局 Codex 配置，也不能强制其他项目自动继承。

## 桌面整理历史证据（2026-09-22）

本节保留桌面阶段证据，不代表正式项目当前结果；文稿迁移、HTML、结构片段和图片验收分别见 [[docs/formal-migration-20260923]]、[[docs/html-source-restoration-20260925]]、[[docs/markup-source-completion-20260925]] 与 [[docs/owned-image-assets-20260925]]。

证据统一在 `outputs/standardization/20260922/`，备份及报告不参与 Git 同步。

- `before-files.tar.gz`、`before-sha256.json`、`before-status.txt`：迁移前文件与用户已有修改快照。
- `path-map.json`：移动关系，保留被用户排除的素材，不删除候选。
- `preservation.json`：web 原站基线与已有二进制资产的前后哈希核对。
- `final-tests.log`、`final-tests-result.json`：完整 npm test 通过，退出码 0；覆盖结构、模板、双链、失败样例、导航、配置、弹窗、日志与 AI Agent。静态与 JSDOM 结果不能代替浏览器。
- `browser/entry-results.json`、各频道截图：12 个频道 file:// 直开，记录浏览器版本、图片和资源错误。
- `browser/navigation-results.json`：两个不同入口的父项开合、同文档切换、子页面刷新、前进后退、组织日志关闭和提示弹窗关闭后点击；另核验窄屏提示关闭。
- `browser/baseline-errors.json`：同一 Chrome 在迁移前副本中重现的 WebGL 错误；仅该精确错误列为既有问题，不忽略新错误。
- `browser/components-results.json`：10 个组件目录页签及提示关闭通过，无新增脚本错误、缺失资源或坏图。
- `learning-live-browser.log`：学习直播真实 Chromium UI 在 480/1440px 的表单、日历、列表、日志、发布、轮播、链接弹窗和关闭专项通过。
- `syntax.json`：154 个自有/迁移 JS 文件解析通过；原站 web 与既有二进制资产 335 项哈希一致。
- `aoci-install/verification.json`、`aoci-doctor.json`、`aoci-guide-current.json`：AOCI 基础校验、环境检查与尚未完成的实际状态。
- `continuation/tests.log`：本轮新增模板与知识检查后的完整 npm test 通过；`continuation/news-equivalence.json` 为 54 项抽取前后对比，`continuation/news-browser.json` 为两个真实 file 入口的资讯回归。
- `root-cleanup/moves.json`：根目录归档前后逐文件哈希；`commit-plan.json` 为本地提交范围及 22 个保留候选。`staged-tests.log` 与 `staged-browser.log` 对应拟提交内容的独立副本，排除素材不参与该验证。

截图不是全站逐像素对比；本轮按用户图一确认更新学习中心首页视觉，记入原 learning-center/learning-live 台账；独立中文目录的参数记入 design-changes/project-directory.json。原有台账保留。

## AOCI 版本与边界

当前工具：`tools/aoci/aoci`，服务自报 `dev`；固定官方提交 `a24fb8bb802b725379192345b946968e371a3c29`，Go 1.27.1 构建，源码未修改。二进制 SHA-256 为 `45d47aaea3eb6f878fb6088ce388912d2b9447412c28f32ef3c0e4d03dbf6c64`；构建依据与回退见 [工具说明](../tools/aoci/README.md) 和 [来源记录](../tools/aoci/provenance.json)。这是已验证的开发提交，不冒充稳定发行版。

原始 rc14 发布包与故障证据仅供历史追溯，见 [[docs/aoci-integration-blocker]]。

`.aoci/.gitignore` 使用工具生成的正式资产白名单；根 aoci*.txt、必要 config/baseline 与运行时草稿分开。`.codex/config.toml` 含机器绝对路径，已忽略；换机器需重新生成。工具二进制与下载包不跟踪。没有启用 hooks、外部 API 自动创作或状态面板；面板的用户级缓存注册与本项目输出约束不一致。宿主浏览器/操作系统自己的临时目录不属于项目可承诺的零外部写入范围。

## 桌面根入口与图片修复历史收尾（2026-09-22）

index.html 保持登录页；独立中文目录在 app/project-index/index.html。旧中文根 HTML 已归档，频道统一从自身目录预览。文件夹中文说明见 [[目录说明]]；CSS/JS 数量不等于无用文件，消费关系与保留边界见 [[docs/source-file-inventory]]。

本轮学习中心按用户图一对齐首页视觉，并在渲染层兼容浏览器旧数据中的 assets/learning 图片路径，保存的课程、图片路径和学习进度不改写。证据统一在 outputs/standardization/20260922/root-entry-migration：entry-display-browser.log、browser/entry-display-results.json 为真实登录/直开/跨频道及旧路径回归；directory-browser.log 为独立中文目录；learning-browser.log 为直播专项。不是把原有四列页面作为正确验收基准。

该桌面阶段最终验证：完整 npm test 退出码 0（final-tests.log），最终结构/生成器/静态检查通过（final-static.log），知识检查通过（knowledge-check.log）。AOCI 最终 Maintain 仍返回 stopped/blocked，正式认知语义未写入；具体响应保存在 aoci-maintain.json。文稿参考源码仅只读采样，未对文稿仓库运行写入命令。

## 桌面收尾验收历史

当前业务基准 2748071 的干净快照已完成登录、12 频道直开/刷新及双入口逐频道切换；详细测试范围、原站 WebGL 等限制见 [[docs/final-acceptance-20260922]]。13 个正式频道 README 已补齐中文维护入口；该阶段迁移清单仅准备，随后已经正式应用；历史准备清单见 [[docs/desktop-to-documents-migration]]。

## 2026-09-25 固定图片归属补齐

57 处隐藏在频道 CSS/JS 的固定图片已迁到频道 assets，源文件减少约 759 KiB；12 频道与双入口浏览器验证通过。主导航/弹窗关闭保留 file 兼容的原件一致遮罩缓存，第三方运行时不改。检查器与新项目模板已接入，见 [[docs/owned-image-assets-20260925]]。当时 AOCI 179 条仅为历史创作检查点；当前进度见上文，不以历史数字判定覆盖率。
