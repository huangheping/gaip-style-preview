---
type: integration-diagnostic
project: GAIP 本地静态预览版
status: resolved-and-aligned
updated: 2026-09-26
---

# AOCI rc14 阻塞与开发分支修复验证

[[docs/standardization-status|返回实施状态]] · [[knowledge/INDEX|知识索引]]

## 结论

历史安装版本 `0.1.0-rc14` 的 Volumes 特殊文件判定会阻塞。2026-09-25 已验证官方开发分支修复，正式项目切换到固定构建；2026-09-26 已完成 762 条正式文本对象语义创作，Verify、Check、Guide 一致证明结构有效、治理对齐、无下一动作。208 个二进制或超大对象属于工具技术跳过，不是已编写语义，也不再是 Pending Curation 阻塞。当前证据见文末；以下诊断时间点保留为历史，不代表现在仍未修复。

2026-09-22 核查官方发布列表，最新发布条目仍是 `v0.1.0-rc14`，标为预发布版，发布时间为 2026-09-18。没有切换非发布构建、修改工具二进制、手工写入 curation 或缩减项目索引范围来绕过阻塞。

## 实测证据

在本项目 `outputs/standardization/20260922/` 内建立隔离最小样例：只有一个 JS 文件及其引用的一张现有 JPG。使用已校验的官方二进制，依次 init（不配置 Agent、不安装 hooks）、scan、Guide、MCP Maintain。结果：

| 步骤 | 实际结果 |
| --- | --- |
| Guide | `authoring_required`，下一步为 `call_no_argument_aoci_maintain_for_current_machine_batch` |
| Maintain | `stopped / blocked`，下一步为 `explicit_orphan_remove_or_resolve_blocker` |
| 待处理对象 | `pending_curation:banner.jpg` |
| 正式索引 | 0 条 |

复现脚本：`outputs/standardization/20260922/reproduce-aoci-curation.py`；结果入口：`aoci-repro-summary.json`。完整命令、初始化和 MCP 回应保存在其记录的隔离目录。复现不改本项目业务源码、不删除素材、不创建提交或远端。

本项目本身的 Verify 返回结构有效但治理未对齐，Check 未通过；结果分别保存在 `aoci-verify-blocked.json` 和 `aoci-check-blocked.json`。这不是页面回归失败，页面本轮 `npm test` 的退出码仍为 0。

续接核验：在同一隔离副本执行官方 `cognition onboard start`，返回 `cognition_onboarding_invalid / onboarding_already_volumes`。该入口也不能用于当前布局；结果为 `aoci-onboard-alternative.json`，未在实际项目重新初始化或改变布局。

## 官方源码定位

以下分析基于实际安装版本的官方 tag，不用当前开发分支代替：

1. Guide 对 Volumes 直接采用治理状态并签发作者化批次，缺少该分支的 Curation 操作命令。[index_agent_guide.go](https://github.com/aoci-spec/aoci-code/blob/v0.1.0-rc14/internal/cli/index_agent_guide.go#L289)
2. Maintain 将特殊文件 Pending 列表拼为 `pending_curation:<path>`，加入 `OrphanRemovals`；列表非空即返回 stopped。[tools_maintain_volumes.go](https://github.com/aoci-spec/aoci-code/blob/v0.1.0-rc14/internal/mcptools/tools_maintain_volumes.go#L257)
3. 现有 `index agent curation stage` 调用 `loadIndexForCLI`；该函数明确拒绝 Volumes v1。此项为源码核对结论，没有在实际项目中伪造 Curation Plan 或调用删除来试探。[Curation Stage](https://github.com/aoci-spec/aoci-code/blob/v0.1.0-rc14/internal/cli/index_agent_curation_stage.go#L93)、[CLI 布局限制](https://github.com/aoci-spec/aoci-code/blob/v0.1.0-rc14/internal/cli/index.go#L41)
4. 官方文档规定新式布局走 Guide → Maintain → Update，不能退回 Legacy-only 的 agent plan，也不支持随意重写现有 Root/Meta。[Volumes 文档](https://github.com/aoci-spec/aoci-code/blob/v0.1.0-rc14/docs/cognition-volumes.md)

## 初次诊断时的恢复条件与保留边界（历史）

初次诊断的恢复条件是官方提供修复路径。文末已在官方开发分支验证该路径；后续应固定工具来源、完成正式项目逐项语义创作及验收。无需重复 init/scan，也不应删除 aoci 文件、清理用户素材、手写正式判定文件或把所有图片排除来制造 aligned。

本轮未提交任何 Entry，Root、Meta、Code 的 SHA-256 与调用前一致；没有待恢复事务、第三方冲突或业务文件删除。已经保存本地问题说明草稿，**未向 GitHub 发 issue 或消息**。

Obsidian 的双链与 YAML 属性校验已接入本地检查；实际界面验收暂缺环境：当前 PATH 未找到 obsidian，`/Applications` 和用户 Applications 常规位置未发现 Obsidian.app。没有安装应用。只读检索 Desktop 与 Documents/GAIP项目集 未找到原始 React/Umi 的 TSX/JSX/source map；资讯中心等可编辑 JS 的结构仍可逐项抽取，但不能把它等同于原始编译页面已全部恢复。

## 2026-09-25 续接核查

正式文稿项目重新读取规则和当前 Guide，仍指向无参数 Maintain。已核查官方发布列表及 main 的对应实现：未找到可用于本仓库 Volumes 特殊素材判定的已发布修复路径。初次诊断 Maintain 返回 stopped/blocked，179 个 pending_curation 项，正式索引仍为 0 条。没有修改工具或删除素材，没有向外发送 issue。当前 Guide 与工具诊断保存于 outputs/standardization-completion-20260925；页面恢复任务独立继续，不以索引阻塞停止业务源码整理。

9 组页面结构恢复进度现见 [[docs/html-source-restoration-20260925]]，不再需要把它们整体保留为不可审查的 legacy 文件。

## 后续：官方开发分支已验证可解除阻塞

固定官方提交为 `a24fb8bb802b725379192345b946968e371a3c29`，构建源与下载的官方归档逐文件一致，未修改工具源码。发布列表核查仍以 rc14 为最新发布条目；开发分支不是已发布稳定版。[官方发布列表](https://github.com/aoci-spec/aoci-code/releases)

新代码统一分类不可读/二进制/空/超限对象，并将其作为可说明的技术跳过项；不再伪装成孤儿删除候选。原素材仍保留，不是手工缩减索引范围。[固定提交源码](https://github.com/aoci-spec/aoci-code/blob/a24fb8bb802b725379192345b946968e371a3c29/internal/volumegovernance/facts.go)

### 已执行验证

- 本项目 outputs 内下载官方 Go 工具链并核验发布 SHA-256，隔离编译未修改的官方源码。官方依赖代理超时，源码直连仅完成部分依赖；后使用临时 GOPROXY 镜像完成下载，保留官方 go.sum 和校验设置，`go mod verify` 通过。没有全局安装或修改 Go 配置。
- 官方 volumegovernance 与 mcptools 的 Held/Skipped/Curation 相关回归通过；真实孤儿阻塞检查仍保留。
- 相同最小样例：JS 引用一张 JPG。rc14 Maintain 返回 stopped/blocked 和 pending_curation；开发版进入 authoring_required，不要求删除图片。
- 阅读样例的真实三个候选与正式 Meta，由模型独立创作并提交 `.gitattributes`、`AGENTS.md`、`index.js` 三条完整语义。Update 已写入三条，但其返回仍含一个旧 pending_curation 提示；按返回的下一步再调用 Maintain 后得到 aligned=true。随后 Verify、Check 退出码均为 0，Guide complete=true/stage=aligned。该额外返回差异保留在证据中，未忽略。
- 文稿全量隔离副本（包含保留在本地的排除候选）Guide 进入 authoring_required：698 个待创作对象，每批最多 20 个；179 个特殊对象作为跳过项说明，未删除素材。

### 隔离验证结束时的未完成项（历史）

正式项目仍使用原 rc14 二进制，Root、Meta、Code 和 baseline 字节保持原状。698 条只是当前副本的待办数量，不是已生成条目数；不能将 scan/Guide 或小样例通过称为正式完整索引完成。正式索引需要在已验证工具路径下逐批阅读真实证据、由模型创作完整条目，最终通过 Verify、Check、Guide，再完成正式项目的完整认知读取与校验。不得用脚本按文件名批量编造 F/R/A/S。

证据：`outputs/remaining-audit-20260925/aoci-validation-summary.json`、`aoci-isolated-proof.json`、`aoci-official-tests.log`、`main-rpc/`、`project-candidate-guide.json`。隔离工具 SHA-256 为 `45d47aaea3eb6f878fb6088ce388912d2b9447412c28f32ef3c0e4d03dbf6c64`，官方源码压缩包、工具链归档及依赖校验/测试日志保存在同一输出目录；临时解压目录与构建缓存已清理。未向 GitHub 提交问题或推送项目。

### 构建输出收尾

正式项目的 scope 规则将部分测试文件列为观察对象，即使它们位于 Git 忽略的 outputs 内。因此隔离编译产生的依赖测试源码一度出现为额外 observed_new，导致 rc14 在特殊素材判定前先停止。已仅清理本轮生成的解压工具链、源码及 Go 缓存；保留下载归档、可执行文件、测试日志和隔离样例，未修改范围规则或业务文件。后续构建应及时清理展开的第三方依赖，不能把这类工具输出误写成项目知识条目。

## 完整续作结果（2026-09-26）

已按用户完整处理授权将已验证开发构建安装至原 tools/aoci/aoci 路径，来源和校验见 tools/aoci/provenance.json。原 rc14 与原索引备份在 outputs/standardization-finish-20260925；前述 0 条/未替换描述为此前诊断事实。

- 正式 Code Volume 为 762 条，覆盖工具当前可作者化文本对象；源码、测试、配置、知识和原站依赖均按实际证据由宿主模型创作。批次请求与完整写入回执在 outputs/standardization-finish-20260925/aoci-batches/。
- 970 个业务受管对象中，188 个 binary、20 个 oversize 被官方工具说明为技术跳过，包含图片、字体、文档、视频和两份 Umi 大运行库；原件及 scope 策略不变，不以缩小范围或编造图片语义换取通过。
- Verify 为 structure_valid=true、governance_aligned=true；Check 为 ok=true、exit_code=0；Guide 为 complete=true、stage=aligned、executable_targets=0、next_action=none。missing、stale、orphan、unbaselined、pending_transactions 均为空或 0，无 Recovery 或第三方冲突。
- 完整认知曾按机器分块交付并通过严格 Challenge；这与机器治理对齐是不同证据，旧交付收据不能代替以后任务的新上下文加载。索引文本维护完成也不表示掌握所有运行分支或所有二进制内容。
- 最终机器证据为同目录 verify-current.json、check-current.json、guide-current.json；收尾文档变更再次经机器签发批次维护后重新核验。没有 push、部署、GitHub issue 或外部消息。
