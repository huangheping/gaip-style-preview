# 共享专家目录

产品专家弹窗与入职第 5.2 章共用此目录的数据和原站模块适配器；公开 `window.__GAIP_EXPERT_DIRECTORY__.profile`。头像及二维码在 assets，按当前脚本 URL 解析，避免频道入口改变时错位。

脚本必须在原站对应模块首次求值前安装，由 channels.js 的 bootstrapScripts 统一登记；内部有单例保护。该适配器没有独立 mount/destroy API，不重复安装。

[频道资源加载](../../knowledge/公共模块/频道资源加载.md) · [组件索引](../../knowledge/组件/组件索引.md)
