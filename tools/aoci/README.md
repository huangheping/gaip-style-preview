# 项目内 AOCI-CODE

本项目固定使用官方源码提交 `a24fb8bb802b725379192345b946968e371a3c29` 的 Darwin amd64 开发构建（服务版本报告为 `dev`）。这是未修改官方源码的开发版，不是已发布稳定版。切换原因是 rc14 无法完成 Volumes 特殊素材治理；隔离复现、依赖校验和官方回归证据见 [接入记录](../../docs/aoci-integration-blocker.md)。

来源、二进制 SHA-256、构建工具链与回退位置见 [provenance.json](provenance.json)。原 rc14 和原索引已保存在本项目 outputs/standardization-finish-20260925。禁止仅根据 `dev` 版本名升级到任意其他构建。

在项目根运行 `tools/aoci/aoci --version` 和 `tools/aoci/aoci --repo "$PWD" index agent guide --agent codex --json` 查看真实状态。按实时 Guide 建立/维护索引，语义由模型阅读证据后创作，不能把 scan 或骨架称为完整认知。

二进制与机器绑定的 `.codex/config.toml` 不跟踪；换机器按已固定的官方提交构建、验证并重新配置本项目路径。无需修改全局配置。未启用 hooks、未注册全局 UI、未推送或部署。

[实施状态](../../docs/standardization-status.md) · [固定官方源码](https://github.com/aoci-spec/aoci-code/tree/a24fb8bb802b725379192345b946968e371a3c29)
