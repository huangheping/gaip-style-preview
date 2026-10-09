---
type: specification
project: GAIP 本地静态预览版
version: "1.0"
status: partially-implemented
updated: 2026-09-22
tags:
  - engineering/standardization
  - knowledge/project
---

# 项目标准化规范 v1.0

本文记录用户确认的目标与实施契约。目录迁移、模板生成器、本地检查、自有 HTML 结构迁移与正式 AOCI 文本索引对齐均已实施。实际结果和技术跳过、运行时及现场验收边界见 [[docs/standardization-status|实施状态]]，规范本身不证明全场景通过。配套 [[docs/project-standardization-checklist|验收清单]]，上级入口为 [[knowledge/INDEX|项目知识总索引]]。

## 1. 适用范围与已确认要求

1. 每个频道拥有独立目录，包含该频道可维护的 HTML、独立 CSS、独立 JS，以及自己的图片和图标。
2. 用户已明确：HTML 不写 `style` 属性和 `<style>`，允许 `<link rel="stylesheet">` 加载频道目录内的 CSS。外部样式表指独立文件，不代表互联网外链。JS 中也不得隐藏固定样式；动态值和检查边界见 [[docs/js-style-separation]]。
3. 组件库在本项目独立目录管理；共享组件的业务使用与展示使用同一实现。
4. 项目知识采用 Obsidian 兼容笔记、双链和索引，代码认知使用用户指定的 AOCI-CODE：`aoci-spec/aoci-code`。
5. 源码、项目知识、项目规则和正式索引在本项目内保存。GitHub 部分是整理现有本地同步规则，统一见 [[docs/github-sync-rules|本地 GitHub 同步规则]]；本次不要求实际推送或新增远程自动化。项目交付不得依赖其他项目的文件、绝对路径或指向外部项目的软链接。
6. 后续新页面、新项目应遵守本规范。可靠执行依赖模板初始化、规则入口和检查工具；本轮未配置跨项目自动继承，也未修改全局 Codex 设置。

规范不授权自动 commit、push、部署或安装工具。实际任务中的已有明确授权仍然有效，不重复请求。

## 2. 官方依据与项目约定

核对日期：2026-09-22。实施时记录所用工具版本或提交，并复核相关版本文档。以下来源分别约束各自产品；目录名、文件命名和验收组合是本项目约定，不能统称为 OpenAI 官方标准。

| 来源 | 采用内容 | 边界 |
| --- | --- | --- |
| [WHATWG：div](https://html.spec.whatwg.org/multipage/grouping-content.html#the-div-element) | 优先使用有适当语义的元素，普通容器使用 div | 不要求所有元素改成 div |
| [WHATWG：link](https://html.spec.whatwg.org/multipage/semantics.html#the-link-element) | HTML 通过 link 加载独立样式表 | 禁止内联样式是用户的项目约束 |
| [OpenAI：AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md) | 项目指令与按目录发现规则 | 本项目文件不会自动约束其他独立项目 |
| [OpenAI：Skills](https://learn.chatgpt.com/docs/build-skills) | 项目技能放在 .agents/skills，按用途加载 | 不把知识库当作全部自动注入的上下文 |
| [Obsidian：内部链接](https://help.obsidian.md/links) | 支持 Wikilink 与 Markdown 链接 | 本项目选双链；GitHub 阅读兼容另行处理 |
| [Obsidian：反向链接](https://help.obsidian.md/plugins/backlinks) | 从正向引用发现反向关系 | 不要求手工补每一条反向链接 |
| [AOCI-CODE：项目说明](https://github.com/aoci-spec/aoci-code) | 项目内代码索引、MCP 接入及索引一致性验证 | 第三方项目规范，不是 OpenAI 标准；以安装版本的正式格式和 live guide 为准 |
| [GitHub：Workflows](https://docs.github.com/en/actions/concepts/workflows-and-actions/workflows) | 未来单独需要远程检查时的参考 | 本次不要求新增工作流；不能作为本地规则整理的完成条件 |

## 3. 目标目录与归属

以下是结构约定，既有大频道允许按职责保留拆分文件名；实际目录见根 README。只生成实际需要的目录，不以空目录冒充完成。

```text
project/
├── README.md
├── AGENTS.md
├── PROJECT_STATE.md
├── package.json
├── package-lock.json
├── .gitignore
├── .agents/skills/                 项目专用流程
├── .obsidian/                     项目 Vault 设置（选择性同步）
├── app/                           应用入口、挂载与导航适配
├── channels/
│   └── channel-id/
│       ├── index.html
│       ├── styles.css
│       ├── script.js
│       ├── README.md              职责、入口、依赖、运行方法
│       ├── assets/images/
│       ├── assets/icons/
│       └── views/                 有独立子页面时再建立
├── components/
│   ├── component-id/
│   │   ├── template.html
│   │   ├── styles.css
│   │   ├── script.js
│   │   ├── README.md
│   │   └── assets/
│   └── catalog/                   直接使用真实组件的展示入口
├── shared/                        公共字体、设计变量、工具与配置
├── knowledge/                     总索引、页面、组件、决策、变更
├── docs/                          工程规范与操作说明
├── design-changes/                视觉参数唯一手工台账
├── templates/                     后续实施的页面/项目模板
├── scripts/                       后续实施的生成、检查、打包工具
├── tests/
├── tools/                         可选项目内工具，二进制不默认提交
└── outputs/                       构建、截图、报告、独立交付包
```

频道/组件 ID 使用稳定的小写英文与连字符；中文名称用于页面和说明。重命名前同步更新全部调用和索引。HTML、CSS、JS 可以按职责继续拆分，不要求大频道全部塞进三个巨型文件。

### 资产规则

- 频道专属图片、SVG 图标、视频与文档归该频道的 `assets/`；CSS 的资源路径相对 CSS 文件解析，HTML 的资源路径相对文档解析，迁移时分别核验。
- 组件私有资产归组件。公共字体和品牌资产归 `shared/`；页面可以使用共享组件及其资产，但不能直接借用其他频道的私有路径。
- 复用已有合法资产，不凭空重画；正式资源与试验候选分开登记，保留用户明确排除的素材。
- 不以运行时网络请求或机器绝对路径补齐交付资源。代码资源路径必须在交付边界内解析；外部业务链接不是资源依赖，单独说明。

### 独立目录与独立运行

频道目录独立允许依赖本项目 `components/` 和 `shared/`，并不等于复制该目录即可运行。要求单频道独立交付时，在目标项目的 `outputs/standalone/<channel-id>/` 收齐依赖并重写相对路径，脱离源目录后验证。生成副本不得成为第二套手工源码。

## 4. HTML、CSS、JS 契约

- HTML 提供可维护的页面结构，不能只放空挂载节点却声称已完成“频道 HTML”。采用语义化 HTML：布局容器用 div，导航、按钮、输入、表格使用相应原生元素；保留标题层级、表单标签、键盘访问和焦点可见性。
- HTML 不含 `style` 属性和 `<style>`；CSS 文件通过 link 或现有统一资源加载机制加载。静态样式不得藏在 JS 字符串或通过 JS 注入以规避分离要求。
- JS 独立保存，事件通过脚本绑定；模板不写 `onclick` 等内联事件。不把所有页面静态 DOM 都搬入 JS 大字符串。
- CSS 限定频道或组件作用域，共享设计变量集中维护。JS 状态变化优先切换 class、属性或原生状态。确需动态几何计算的实现，在试点中明确方式和验收，不默认放宽 HTML 无内联样式要求。
- 图标文件归属与无障碍名称均可定位。不得依赖易变构建哈希类名作为新页面的公共接口。
- 源码与交付产物分别检查。框架/第三方生成的 DOM 是否带样式属性需单独报告，不能只扫源 HTML 就声称运行时也符合。

## 5. 组件库契约

组件说明记录用途、输入、事件、默认/禁用/错误/加载等适用状态、销毁方式与资源依赖；无交互的组件不伪造 JS 逻辑。展示页调用真实实现，不复制 DOM/CSS 维护演示版。

共享组件不依赖具体频道。组件变更应定位实际消费者，验证受影响页面。GAIP 迁移期间仍沿用真实弹窗 `@gaip-modal` 登记、共享确认组件、共享遮罩/定位及关闭生命周期，详见 [[docs/maintenance-workflow|维护流程]]。

## 6. Obsidian 与项目记忆

以项目根目录为 Vault。`knowledge/INDEX.md` 是知识导航入口；页面笔记链接使用的组件、相关决策和变更，组件笔记说明调用关系。双链不复制源码，反向关系由 Obsidian 解析。

笔记使用有效 YAML 属性，例如 `type`、`project`、`updated`；这些字段是项目约定。新双链优先带 Vault 相对路径，避免同名笔记歧义。项目外链接仅用于来源引用，不能承载本项目唯一知识。

| 文件/目录 | 唯一职责 |
| --- | --- |
| AGENTS.md | 工作边界、读取入口和验证要求 |
| PROJECT_STATE.md | 当前状态、未完成事项、摘要与链接 |
| knowledge/ | 需求语义、页面/组件关系、设计原因和历史决策 |
| design-changes/ | 视觉参数基准与最终目标 |
| AOCI 正式索引 | 代码职责、关系、接口与关键约束 |
| Git 历史 | 文件变更、可追溯提交与恢复依据 |

GitHub 同步的是已提交文件，不是全部聊天记录，也不会自动刷新运行中的 AI 上下文。`.obsidian` 只同步必要的可移植设置，个人布局和临时状态不默认纳入。面向 GitHub 的操作入口使用标准 Markdown 链接；知识笔记保留双链，本轮不增加第二份手工知识库。

## 7. AOCI-CODE 接入边界

按项目官方格式由工具初始化根清单、Meta、Code Volume 和 `.aoci/`；不手写仿制索引。典型文件是 `aoci.txt`、`aoci.meta.txt`、`aoci.code.txt`。GAIP 本轮不接真实数据库，也不为本地 Mock 建立虚构数据库索引。[AOCI 初始化与文件说明](https://github.com/aoci-spec/aoci-code#what-appears-after-initialization)

正式接入按以下门槛执行；安装、init、scan 与本机配置已有证据，完整认知尚未建立：

1. 锁定并验证工具版本，记录官方安装来源；保留现有项目指令，审查 init 新增的托管区块。
2. 核验所有写入位置。官方说明状态面板会在用户缓存目录登记，与“全部项目输出在项目内”存在差异。未经证明可关闭或重定向前不启动面板；其他命令也须检查写入边界，不能仅关闭面板便宣称全隔离。
3. 核验本机项目级 MCP 配置；其中绝对路径配置按工具文档忽略，不直接跨电脑同步。换机器重新生成并验证连接。
4. 明确受管范围，再初始化、扫描、确认 MCP 工具可用，按该版本 live guide 建立基于真实源码的索引；需要刷新宿主时如实说明。
5. 更新通过正式工作流执行，运行 `verify`、`check` 并确认实际状态。目录迁移造成的范围变化也应遵循工具流程，不能以强制扫描覆盖历史状态。

正式索引和允许同步的配置按工具 Git 边界提交；不得把全部 `.aoci/` 状态无差别加入 Git，也不得忽略必需认知资产。具体边界以安装版本生成结果和文档为准。[AOCI 项目文档](https://github.com/aoci-spec/aoci-code)

AOCI 不代替业务回归或人工语义判断。官方工具检查通过只证明其检查覆盖的契约；不能据此声称页面行为或索引描述全部正确。

## 8. 本地 GitHub 同步规则与检查

已有同步流程集中至 [[docs/github-sync-rules|本地 GitHub 同步规则]]；AGENTS 和知识索引只保留入口。本节不再重复维护提交步骤、发布状态或排除清单。整理规则不等于执行同步，也不要求重新建立 GitHub 工作流。

密钥、本机绝对路径配置、依赖安装目录和临时输出不提交。测试报告等保留在项目内指定输出目录；是否选入长期证据按任务决定，不把所有输出自动发布。浏览器缓存、包管理器缓存和工具运行状态的写入位置在实际集成时核验；不要把“交付在项目内”误报成宿主完全不向外写文件。

标准化本地检查覆盖文件结构、源 HTML 分离、资源归属、静态路径、知识链接和相关行为回归。历史动态样式的精确保留片段见 shared/config/runtime-style-exceptions.json，禁止新增未列明的 JS 字符串内联样式。编译包和运行时边界见实施状态。若未来单独要求远程 CI，再复用已验证的本地检查，不将其列为本次必需工作。

## 9. 当前 GAIP 的迁移策略

当前唯一频道源码仍在 `channels/`，资源由 `shared/config/channels.js` 登记并统一加载；根 index.html 是登录入口，app/project-index/index.html 是中文目录，频道 index.html 是薄壳，Hash 优先且频道切换不能重载主文档。参见 [[knowledge/公共模块/频道资源加载|频道资源加载]]、[[knowledge/公共模块/主导航与Hash路由|导航契约]]。

已完成目录迁移、配置/学习/资讯模板、九组旧频道 317 份 HTML 视图和 343 份自有结构片段迁移，分别见 [[docs/html-source-restoration-20260925]] 与 [[docs/markup-source-completion-20260925]]。原 React/Ant 动态组件与 Umi 仍是运行依赖。模板由构建脚本注册，不能通过 file 页面直接 fetch HTML、擅用模块加载或整页跳转绕过已有约束。

| 阶段 | 交付与退出条件 |
| --- | --- |
| 文档基线（本轮） | 本文、验收清单、索引和状态入口；明确待实施项 |
| 试点准备 | 确认目标项目路径、一个正式频道、依赖清单和现有行为证据 |
| 单频道试点 | 页面结构与资源归位，真实浏览器直开、跨入口切换、刷新和相关组件行为通过 |
| 工具接入 | AOCI 写入边界/MCP/索引验证，模板与本地检查可重复执行 |
| 批量迁移 | 逐频道映射、验证、更新索引；无引用且可恢复时再移除旧文件 |
| 发布与复用 | 按实际授权提交/同步；从模板建立新项目并验证不依赖原项目 |

如果任务是抽离或独立交付，来源项目全程只读，连变更日志、快照和工具索引也不得写入；所有复制、改造和验证进入来源项目外的指定目标。尤其不得写入 `/Users/hhp/Documents/GAIP项目集/样式优化html`。目标未明确前不启动抽离。

初始整理在桌面测试副本实施；用户随后明确授权正式迁移，已应用于文稿项目，详见 [[docs/formal-migration-20260923]]。此正式迁移不属于抽离任务。

## 10. 完成定义与后续接入

规范完成不等于实施完成。按 [[docs/project-standardization-checklist|验收清单]] 逐条保存证据；未执行、失败、不适用分别记录，不用空文件、示例命令或 DOM 模拟代替实现和浏览器结果。

后续模板携带规范版本、AGENTS 入口、页面/组件骨架、知识索引及已验证的检查命令；初始化时复制到新项目自身，并生成本机配置。新项目建成后移开原模板目录仍可运行。AOCI 初始化后的索引必须重新建立，不能复制其他项目的 baseline、事务状态或代码认知冒充本项目知识。

本轮已更新 AGENTS 和频道维护 Skill 的路径、生成命令与验证入口，保持同一时点只有一套有效规则。其他项目须通过模板携带自己的规则，不能宣称全局自动生效。
