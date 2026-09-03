(function () {
  'use strict';
  if (!window.__GAIP_MODAL_REGISTRY__) throw new Error('请先加载 modal-registry.js');
  window.__GAIP_MODAL_REGISTRY__.registerMany([
  {
    "id": "config-organization-log",
    "title": "组织架构操作日志",
    "channel": "配置中心 / 组织架构",
    "type": "modal",
    "status": "ready",
    "height": 900,
    "after": "config-admin",
    "source": "window.__GAIP_CONFIG_DIALOGS__.openOrganizationLog()",
    "previewMode": "config-dialog",
    "invoke": {
      "path": "__GAIP_CONFIG_DIALOGS__.openOrganizationLog",
      "args": []
    },
    "styles": [
      "web/umi.c6286171.css",
      "shared/styles/global-font.css",
      "features/config-center/ant-source.css",
      "features/config-center/config-center-content.css",
      "features/config-center/config-center.css"
    ],
    "scripts": [
      "shared/config/channels.js?v=20260903-51",
      "features/config-center/source-markup.js?v=20260902-1",
      "features/config-center/config-center.js?v=20260903-38"
    ],
    "definitionSource": "features/config-center/config-center.js"
  },
  {
    "id": "config-bulk-import-members",
    "title": "批量导入成员",
    "channel": "配置中心 / 组织架构",
    "type": "modal",
    "status": "ready",
    "height": 900,
    "after": "config-organization-log",
    "source": "window.__GAIP_CONFIG_DIALOGS__.openBulkImport()",
    "previewMode": "config-dialog",
    "invoke": {
      "path": "__GAIP_CONFIG_DIALOGS__.openBulkImport",
      "args": []
    },
    "styles": [
      "web/umi.c6286171.css",
      "shared/styles/global-font.css",
      "features/config-center/ant-source.css",
      "features/config-center/config-center-content.css",
      "features/config-center/config-center.css"
    ],
    "scripts": [
      "shared/config/channels.js?v=20260903-51",
      "features/config-center/source-markup.js?v=20260902-1",
      "features/config-center/config-center.js?v=20260903-38"
    ],
    "definitionSource": "features/config-center/config-center.js"
  },
  {
    "id": "config-adjust-member-node",
    "title": "调整节点",
    "channel": "配置中心 / 组织架构",
    "type": "modal",
    "status": "ready",
    "height": 780,
    "after": "config-bulk-import-members",
    "source": "window.__GAIP_CONFIG_DIALOGS__.openAdjustNode(1)",
    "previewMode": "config-dialog",
    "invoke": {
      "path": "__GAIP_CONFIG_DIALOGS__.openAdjustNode",
      "args": [
        1
      ]
    },
    "styles": [
      "web/umi.c6286171.css",
      "shared/styles/global-font.css",
      "features/config-center/ant-source.css",
      "features/config-center/config-center-content.css",
      "features/config-center/config-center.css"
    ],
    "scripts": [
      "shared/config/channels.js?v=20260903-51",
      "features/config-center/source-markup.js?v=20260902-1",
      "features/config-center/config-center.js?v=20260903-38"
    ],
    "definitionSource": "features/config-center/config-center.js"
  }
], { origin: 'source-annotation' });
}());
