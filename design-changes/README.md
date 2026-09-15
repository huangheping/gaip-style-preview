# 视觉样式交付记录

规则：[边修改边记录](../docs/visual-change-workflow.md)。本目录保存视觉参数的增量台账，不保存产品功能变更日志。

- 每个页面一个文件，如 `organization.json`；共享组件单独命名，如 `shared-member-tags.json`。在首次实际修改时从 [_template.json](_template.json) 建立，更新 `page` 和记录字段。
- 同一交付基准下更新原记录；不要按每轮对话或每次试验新建文件。共享参数只维护一份，用 `appliesTo` 写明消费者。
- 仅打开本次相关文件，按 ID/元素定位记录。归档记录放 `archive/`，平时不读取；证据仅在需要时存 `evidence/<baseline-id>/`，不内嵌大段截图或整页源码进 JSON。
- 初始模板的 `records` 为空，表示尚未登记任何历史设计变化。不能把以前的独立包报告、当前 Git HEAD 或本地初始值自动认作同事线上版本。
- 这是一套由编码任务执行的记录约定；目前未安装文件监听、自动截图或页面标注运行时。
