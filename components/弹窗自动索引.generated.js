(function () {
  'use strict';
  if (!window.__GAIP_MODAL_REGISTRY__) throw new Error('请先加载 modal-registry.js');
  window.__GAIP_MODAL_REGISTRY__.registerMany([
  {
    "id": "config-announcement-create",
    "title": "新建公告",
    "channel": "配置中心 / 公告管理",
    "type": "modal",
    "category": "form",
    "status": "ready",
    "height": 800,
    "after": "config-adjust-member-node-confirm",
    "source": "window.__GAIP_ANNOUNCEMENT_MANAGEMENT__.openCreate()",
    "invoke": {
      "path": "__GAIP_ANNOUNCEMENT_MANAGEMENT__.openCreate",
      "args": []
    },
    "styles": [
      "web/umi.c6286171.css",
      "shared/styles/global-font.css?v=20260909-project-font-1",
      "channels/config-center/ant-source.css?v=20260930-local-icons-3",
      "channels/config-center/templates.css",
      "channels/config-center/config-center-content.css?v=20261008-icon-standard-1",
      "channels/config-center/announcement-management.css?v=20261001-merge-3"
    ],
    "scripts": [
      "channels/config-center/announcement-management-view.js?v=20261008-icon-standard-1"
    ],
    "definitionSource": "channels/config-center/announcement-management-view.js"
  },
  {
    "id": "config-announcement-edit",
    "title": "编辑公告",
    "channel": "配置中心 / 公告管理",
    "type": "modal",
    "category": "form",
    "status": "ready",
    "height": 800,
    "after": "config-announcement-create",
    "source": "window.__GAIP_ANNOUNCEMENT_MANAGEMENT__.openEdit()",
    "invoke": {
      "path": "__GAIP_ANNOUNCEMENT_MANAGEMENT__.openEdit",
      "args": []
    },
    "styles": [
      "web/umi.c6286171.css",
      "shared/styles/global-font.css?v=20260909-project-font-1",
      "channels/config-center/ant-source.css?v=20260930-local-icons-3",
      "channels/config-center/templates.css",
      "channels/config-center/config-center-content.css?v=20261008-icon-standard-1",
      "channels/config-center/announcement-management.css?v=20261001-merge-3"
    ],
    "scripts": [
      "channels/config-center/announcement-management-view.js?v=20261008-icon-standard-1"
    ],
    "definitionSource": "channels/config-center/announcement-management-view.js"
  },
  {
    "id": "config-announcement-delete",
    "title": "删除公告确认",
    "channel": "配置中心 / 公告管理",
    "type": "confirm",
    "category": "confirmation",
    "status": "ready",
    "height": 520,
    "after": "config-announcement-edit",
    "source": "window.__GAIP_ANNOUNCEMENT_MANAGEMENT__.openDelete()",
    "invoke": {
      "path": "__GAIP_ANNOUNCEMENT_MANAGEMENT__.openDelete",
      "args": []
    },
    "styles": [
      "web/umi.c6286171.css",
      "shared/styles/global-font.css?v=20260909-project-font-1",
      "channels/config-center/ant-source.css?v=20260930-local-icons-3",
      "channels/config-center/templates.css",
      "channels/config-center/config-center-content.css?v=20261008-icon-standard-1",
      "channels/config-center/announcement-management.css?v=20261001-merge-3",
      "components/modal/global-modal.css?v=20261001-merge-1"
    ],
    "scripts": [
      "components/modal/global-modal.js?v=20261001-merge-1",
      "channels/config-center/announcement-management-view.js?v=20261008-icon-standard-1"
    ],
    "definitionSource": "channels/config-center/announcement-management-view.js"
  },
  {
    "id": "config-organization-log",
    "title": "组织架构操作日志",
    "channel": "配置中心 / 组织架构",
    "type": "modal",
    "category": "information",
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
      "components/table/global-table.css?v=20261009-action-hover-1",
      "components/modal/global-modal.css?v=20261001-merge-1",
      "shared/styles/global-font.css?v=20260909-project-font-1",
      "channels/config-center/ant-source.css?v=20260930-local-icons-3",
      "channels/config-center/templates.css",
      "channels/config-center/config-center-content.css?v=20261008-icon-standard-1",
      "components/filter-bar/global-filter-bar.css?v=20261001-merge-1",
      "channels/config-center/config-center.css?v=20260930-local-icons-3"
    ],
    "scripts": [
      "components/modal/global-modal.js?v=20261001-merge-1",
      "components/table/global-table.js?v=20260929-course-menu-1",
      "shared/config/channels.js?v=20261008-icon-standard-1",
      "shared/scripts/organization-store.js",
      "components/organization-tree/organization-tree.js?v=20261001-merge-1",
      "channels/config-center/source-markup.js?v=20261008-icon-sizing-1",
      "channels/config-center/config-center.js?v=20261008-icon-standard-1"
    ],
    "definitionSource": "channels/config-center/config-center.js"
  },
  {
    "id": "config-bulk-import-members",
    "title": "批量导入成员",
    "channel": "配置中心 / 组织架构",
    "type": "modal",
    "category": "form",
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
      "shared/styles/global-font.css?v=20260909-project-font-1",
      "channels/config-center/ant-source.css?v=20260930-local-icons-3",
      "channels/config-center/templates.css",
      "channels/config-center/config-center-content.css?v=20261008-icon-standard-1",
      "components/filter-bar/global-filter-bar.css?v=20261001-merge-1",
      "channels/config-center/config-center.css?v=20260930-local-icons-3"
    ],
    "scripts": [
      "shared/config/channels.js?v=20261008-icon-standard-1",
      "shared/scripts/organization-store.js",
      "components/organization-tree/organization-tree.js?v=20261001-merge-1",
      "channels/config-center/source-markup.js?v=20261008-icon-sizing-1",
      "channels/config-center/config-center.js?v=20261008-icon-standard-1"
    ],
    "definitionSource": "channels/config-center/config-center.js"
  },
  {
    "id": "config-bulk-import-return-confirm",
    "title": "批量导入返回重新选择确认",
    "channel": "配置中心 / 组织架构 / 批量导入",
    "type": "confirm",
    "category": "confirmation",
    "status": "ready",
    "height": 560,
    "after": "config-announcement-delete",
    "source": "window.__GAIP_CONFIG_DIALOGS__.openBulkImportReturnConfirmation()",
    "previewMode": "config-dialog",
    "invoke": {
      "path": "__GAIP_CONFIG_DIALOGS__.openBulkImportReturnConfirmation",
      "args": []
    },
    "styles": [
      "web/umi.c6286171.css",
      "shared/styles/global-font.css?v=20260909-project-font-1",
      "channels/config-center/ant-source.css?v=20260930-local-icons-3",
      "channels/config-center/templates.css",
      "channels/config-center/config-center-content.css?v=20261008-icon-standard-1",
      "components/filter-bar/global-filter-bar.css?v=20261001-merge-1",
      "channels/config-center/config-center.css?v=20260930-local-icons-3",
      "components/modal/global-modal.css?v=20261001-merge-1"
    ],
    "scripts": [
      "shared/config/channels.js?v=20261008-icon-standard-1",
      "components/modal/global-modal.js?v=20261001-merge-1",
      "shared/scripts/organization-store.js",
      "components/organization-tree/organization-tree.js?v=20261001-merge-1",
      "channels/config-center/source-markup.js?v=20261008-icon-sizing-1",
      "channels/config-center/config-center.js?v=20261008-icon-standard-1"
    ],
    "definitionSource": "channels/config-center/config-center.js"
  },
  {
    "id": "config-adjust-member-node",
    "title": "调整节点",
    "channel": "配置中心 / 组织架构",
    "type": "modal",
    "category": "form",
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
      "shared/styles/global-font.css?v=20260909-project-font-1",
      "channels/config-center/ant-source.css?v=20260930-local-icons-3",
      "channels/config-center/templates.css",
      "channels/config-center/config-center-content.css?v=20261008-icon-standard-1",
      "components/filter-bar/global-filter-bar.css?v=20261001-merge-1",
      "channels/config-center/config-center.css?v=20260930-local-icons-3"
    ],
    "scripts": [
      "shared/config/channels.js?v=20261008-icon-standard-1",
      "shared/scripts/organization-store.js",
      "components/organization-tree/organization-tree.js?v=20261001-merge-1",
      "channels/config-center/source-markup.js?v=20261008-icon-sizing-1",
      "channels/config-center/config-center.js?v=20261008-icon-standard-1"
    ],
    "definitionSource": "channels/config-center/config-center.js"
  },
  {
    "id": "config-adjust-member-node-confirm",
    "title": "调整管理员节点确认",
    "channel": "配置中心 / 组织架构",
    "type": "confirm",
    "category": "confirmation",
    "status": "ready",
    "height": 780,
    "after": "config-adjust-member-node",
    "source": "window.__GAIP_CONFIG_DIALOGS__.openAdjustNodeConfirmation(1)",
    "previewMode": "config-dialog",
    "invoke": {
      "path": "__GAIP_CONFIG_DIALOGS__.openAdjustNodeConfirmation",
      "args": [
        1
      ]
    },
    "styles": [
      "web/umi.c6286171.css",
      "shared/styles/global-font.css?v=20260909-project-font-1",
      "channels/config-center/ant-source.css?v=20260930-local-icons-3",
      "channels/config-center/templates.css",
      "channels/config-center/config-center-content.css?v=20261008-icon-standard-1",
      "components/filter-bar/global-filter-bar.css?v=20261001-merge-1",
      "channels/config-center/config-center.css?v=20260930-local-icons-3",
      "components/modal/global-modal.css?v=20261001-merge-1"
    ],
    "scripts": [
      "shared/config/channels.js?v=20261008-icon-standard-1",
      "components/modal/global-modal.js?v=20261001-merge-1",
      "shared/scripts/organization-store.js",
      "components/organization-tree/organization-tree.js?v=20261001-merge-1",
      "channels/config-center/source-markup.js?v=20261008-icon-sizing-1",
      "channels/config-center/config-center.js?v=20261008-icon-standard-1"
    ],
    "definitionSource": "channels/config-center/config-center.js"
  },
  {
    "id": "learning-course-log",
    "title": "课程管理操作日志",
    "channel": "学习中心",
    "type": "modal",
    "category": "information",
    "status": "ready",
    "source": "window.__GAIP_LEARNING_APP__.openCourseLog()",
    "invoke": {
      "path": "__GAIP_LEARNING_APP__.openCourseLog",
      "args": []
    },
    "styles": [
      "components/modal/global-modal.css?v=20261001-merge-1",
      "components/modal/global-modal-position.css",
      "components/modal/global-modal-mask.css?v=20260910-backdrop-1",
      "components/filter-bar/global-filter-bar.css?v=20261001-merge-1",
      "components/table/global-table.css?v=20261009-action-hover-1",
      "channels/learning-center/learning-center.css?v=20261009-delete-solid-1"
    ],
    "scripts": [
      "components/modal/global-modal.js?v=20261001-merge-1",
      "components/modal/global-modal-position.js",
      "components/filter-bar/global-filter-bar.js?v=20260910-tree-combobox-1",
      "components/table/global-table.js?v=20260929-course-menu-1",
      "shared/scripts/organization-store.js",
      "components/organization-tree/organization-tree.js?v=20261001-merge-1",
      "channels/learning-center/learning-data.js?v=20260922-asset-paths-1",
      "channels/learning-center/learning-app.js?v=20261009-delete-solid-1"
    ],
    "definitionSource": "channels/learning-center/learning-app.js"
  },
  {
    "id": "learning-operation-confirm",
    "title": "课程上架确认",
    "channel": "学习中心",
    "type": "confirm",
    "category": "confirmation",
    "status": "ready",
    "source": "window.__GAIP_LEARNING_APP__.openConfirm(\"course-publish\")",
    "invoke": {
      "path": "__GAIP_LEARNING_APP__.openConfirm",
      "args": [
        "course-publish"
      ]
    },
    "styles": [
      "shared/styles/global-font.css?v=20260909-project-font-1",
      "components/modal/global-modal.css?v=20261001-merge-1",
      "components/modal/global-modal-position.css",
      "components/modal/global-modal-mask.css?v=20260910-backdrop-1"
    ],
    "scripts": [
      "components/modal/global-modal.js?v=20261001-merge-1",
      "components/modal/global-modal-position.js",
      "shared/scripts/organization-store.js",
      "components/organization-tree/organization-tree.js?v=20261001-merge-1",
      "channels/learning-center/learning-data.js?v=20260922-asset-paths-1",
      "channels/learning-center/learning-app.js?v=20261009-delete-solid-1"
    ],
    "definitionSource": "channels/learning-center/learning-app.js"
  },
  {
    "id": "learning-unsaved-confirm",
    "title": "学习中心未保存离开确认",
    "channel": "学习中心",
    "type": "confirm",
    "category": "confirmation",
    "status": "ready",
    "after": "learning-operation-confirm",
    "source": "window.__GAIP_LEARNING_APP__.openUnsaved()",
    "invoke": {
      "path": "__GAIP_LEARNING_APP__.openUnsaved",
      "args": []
    },
    "styles": [
      "shared/styles/global-font.css?v=20260909-project-font-1",
      "components/modal/global-modal.css?v=20261001-merge-1",
      "components/modal/global-modal-position.css",
      "components/modal/global-modal-mask.css?v=20260910-backdrop-1"
    ],
    "scripts": [
      "components/modal/global-modal.js?v=20261001-merge-1",
      "components/modal/global-modal-position.js",
      "shared/scripts/organization-store.js",
      "components/organization-tree/organization-tree.js?v=20261001-merge-1",
      "channels/learning-center/learning-data.js?v=20260922-asset-paths-1",
      "channels/learning-center/learning-app.js?v=20261009-delete-solid-1"
    ],
    "definitionSource": "channels/learning-center/learning-app.js"
  },
  {
    "id": "learning-course-offline-confirm",
    "title": "课程下架确认",
    "channel": "学习中心",
    "type": "confirm",
    "category": "confirmation",
    "status": "ready",
    "source": "window.__GAIP_LEARNING_APP__.openConfirm(\"course-offline\")",
    "invoke": {
      "path": "__GAIP_LEARNING_APP__.openConfirm",
      "args": [
        "course-offline"
      ]
    },
    "styles": [
      "shared/styles/global-font.css?v=20260909-project-font-1",
      "components/modal/global-modal.css?v=20261001-merge-1",
      "components/modal/global-modal-position.css",
      "components/modal/global-modal-mask.css?v=20260910-backdrop-1"
    ],
    "scripts": [
      "components/modal/global-modal.js?v=20261001-merge-1",
      "components/modal/global-modal-position.js",
      "shared/scripts/organization-store.js",
      "components/organization-tree/organization-tree.js?v=20261001-merge-1",
      "channels/learning-center/learning-data.js?v=20260922-asset-paths-1",
      "channels/learning-center/learning-app.js?v=20261009-delete-solid-1"
    ],
    "after": "learning-unsaved-confirm",
    "definitionSource": "channels/learning-center/learning-app.js"
  },
  {
    "id": "learning-course-delete-confirm",
    "title": "删除草稿课程确认",
    "channel": "学习中心",
    "type": "confirm",
    "category": "confirmation",
    "status": "ready",
    "source": "window.__GAIP_LEARNING_APP__.openConfirm(\"course-delete\")",
    "invoke": {
      "path": "__GAIP_LEARNING_APP__.openConfirm",
      "args": [
        "course-delete"
      ]
    },
    "styles": [
      "shared/styles/global-font.css?v=20260909-project-font-1",
      "components/modal/global-modal.css?v=20261001-merge-1",
      "components/modal/global-modal-position.css",
      "components/modal/global-modal-mask.css?v=20260910-backdrop-1"
    ],
    "scripts": [
      "components/modal/global-modal.js?v=20261001-merge-1",
      "components/modal/global-modal-position.js",
      "shared/scripts/organization-store.js",
      "components/organization-tree/organization-tree.js?v=20261001-merge-1",
      "channels/learning-center/learning-data.js?v=20260922-asset-paths-1",
      "channels/learning-center/learning-app.js?v=20261009-delete-solid-1"
    ],
    "after": "learning-course-offline-confirm",
    "definitionSource": "channels/learning-center/learning-app.js"
  },
  {
    "id": "learning-lesson-publish-confirm",
    "title": "课节上架确认",
    "channel": "学习中心",
    "type": "confirm",
    "category": "confirmation",
    "status": "ready",
    "source": "window.__GAIP_LEARNING_APP__.openConfirm(\"lesson-publish\")",
    "invoke": {
      "path": "__GAIP_LEARNING_APP__.openConfirm",
      "args": [
        "lesson-publish"
      ]
    },
    "styles": [
      "shared/styles/global-font.css?v=20260909-project-font-1",
      "components/modal/global-modal.css?v=20261001-merge-1",
      "components/modal/global-modal-position.css",
      "components/modal/global-modal-mask.css?v=20260910-backdrop-1"
    ],
    "scripts": [
      "components/modal/global-modal.js?v=20261001-merge-1",
      "components/modal/global-modal-position.js",
      "shared/scripts/organization-store.js",
      "components/organization-tree/organization-tree.js?v=20261001-merge-1",
      "channels/learning-center/learning-data.js?v=20260922-asset-paths-1",
      "channels/learning-center/learning-app.js?v=20261009-delete-solid-1"
    ],
    "after": "learning-course-delete-confirm",
    "definitionSource": "channels/learning-center/learning-app.js"
  },
  {
    "id": "learning-lesson-offline-confirm",
    "title": "课节下架确认",
    "channel": "学习中心",
    "type": "confirm",
    "category": "confirmation",
    "status": "ready",
    "source": "window.__GAIP_LEARNING_APP__.openConfirm(\"lesson-offline\")",
    "invoke": {
      "path": "__GAIP_LEARNING_APP__.openConfirm",
      "args": [
        "lesson-offline"
      ]
    },
    "styles": [
      "shared/styles/global-font.css?v=20260909-project-font-1",
      "components/modal/global-modal.css?v=20261001-merge-1",
      "components/modal/global-modal-position.css",
      "components/modal/global-modal-mask.css?v=20260910-backdrop-1"
    ],
    "scripts": [
      "components/modal/global-modal.js?v=20261001-merge-1",
      "components/modal/global-modal-position.js",
      "shared/scripts/organization-store.js",
      "components/organization-tree/organization-tree.js?v=20261001-merge-1",
      "channels/learning-center/learning-data.js?v=20260922-asset-paths-1",
      "channels/learning-center/learning-app.js?v=20261009-delete-solid-1"
    ],
    "after": "learning-lesson-publish-confirm",
    "definitionSource": "channels/learning-center/learning-app.js"
  },
  {
    "id": "learning-last-lesson-offline-confirm",
    "title": "最后课节下架限制提示",
    "channel": "学习中心",
    "type": "confirm",
    "category": "confirmation",
    "status": "ready",
    "source": "window.__GAIP_LEARNING_APP__.openConfirm(\"last-lesson-offline\")",
    "invoke": {
      "path": "__GAIP_LEARNING_APP__.openConfirm",
      "args": [
        "last-lesson-offline"
      ]
    },
    "styles": [
      "shared/styles/global-font.css?v=20260909-project-font-1",
      "components/modal/global-modal.css?v=20261001-merge-1",
      "components/modal/global-modal-position.css",
      "components/modal/global-modal-mask.css?v=20260910-backdrop-1"
    ],
    "scripts": [
      "components/modal/global-modal.js?v=20261001-merge-1",
      "components/modal/global-modal-position.js",
      "shared/scripts/organization-store.js",
      "components/organization-tree/organization-tree.js?v=20261001-merge-1",
      "channels/learning-center/learning-data.js?v=20260922-asset-paths-1",
      "channels/learning-center/learning-app.js?v=20261009-delete-solid-1"
    ],
    "after": "learning-lesson-offline-confirm",
    "definitionSource": "channels/learning-center/learning-app.js"
  },
  {
    "id": "learning-lesson-delete-confirm",
    "title": "删除课节确认",
    "channel": "学习中心",
    "type": "confirm",
    "category": "confirmation",
    "status": "ready",
    "source": "window.__GAIP_LEARNING_APP__.openConfirm(\"lesson-delete\", \"示例课节\")",
    "invoke": {
      "path": "__GAIP_LEARNING_APP__.openConfirm",
      "args": [
        "lesson-delete",
        "示例课节"
      ]
    },
    "styles": [
      "shared/styles/global-font.css?v=20260909-project-font-1",
      "components/modal/global-modal.css?v=20261001-merge-1",
      "components/modal/global-modal-position.css",
      "components/modal/global-modal-mask.css?v=20260910-backdrop-1"
    ],
    "scripts": [
      "components/modal/global-modal.js?v=20261001-merge-1",
      "components/modal/global-modal-position.js",
      "shared/scripts/organization-store.js",
      "components/organization-tree/organization-tree.js?v=20261001-merge-1",
      "channels/learning-center/learning-data.js?v=20260922-asset-paths-1",
      "channels/learning-center/learning-app.js?v=20261009-delete-solid-1"
    ],
    "after": "learning-last-lesson-offline-confirm",
    "definitionSource": "channels/learning-center/learning-app.js"
  },
  {
    "id": "learning-study-log",
    "title": "学情管理操作日志",
    "channel": "学习中心",
    "type": "modal",
    "category": "information",
    "status": "ready",
    "source": "window.__GAIP_LEARNING_APP__.openStudyLog()",
    "invoke": {
      "path": "__GAIP_LEARNING_APP__.openStudyLog",
      "args": []
    },
    "styles": [
      "components/modal/global-modal.css?v=20261001-merge-1",
      "components/modal/global-modal-position.css",
      "components/modal/global-modal-mask.css?v=20260910-backdrop-1",
      "components/filter-bar/global-filter-bar.css?v=20261001-merge-1",
      "components/table/global-table.css?v=20261009-action-hover-1",
      "channels/learning-center/learning-center.css?v=20261009-delete-solid-1"
    ],
    "scripts": [
      "components/modal/global-modal.js?v=20261001-merge-1",
      "components/modal/global-modal-position.js",
      "components/filter-bar/global-filter-bar.js?v=20260910-tree-combobox-1",
      "components/table/global-table.js?v=20260929-course-menu-1",
      "shared/scripts/organization-store.js",
      "components/organization-tree/organization-tree.js?v=20261001-merge-1",
      "channels/learning-center/learning-data.js?v=20260922-asset-paths-1",
      "channels/learning-center/learning-app.js?v=20261009-delete-solid-1"
    ],
    "after": "learning-lesson-delete-confirm",
    "definitionSource": "channels/learning-center/learning-app.js"
  },
  {
    "id": "learning-study-detail",
    "title": "学员学习详情",
    "channel": "学习中心",
    "type": "modal",
    "category": "information",
    "status": "ready",
    "styles": [
      "shared/styles/global-font.css",
      "components/modal/global-modal.css?v=20261001-merge-1",
      "components/modal/global-modal-position.css",
      "components/modal/global-modal-mask.css?v=20260910-backdrop-1",
      "components/multi-select/global-multi-select.css?v=20261002-collapse-1",
      "components/organization-tree/organization-tree.css?v=20261008-icon-standard-1",
      "components/filter-bar/global-filter-bar.css?v=20261001-merge-1",
      "components/table/global-table.css?v=20261009-action-hover-1",
      "channels/learning-center/learning-center.css?v=20261009-delete-solid-1"
    ],
    "scripts": [
      "components/modal/global-modal.js?v=20261001-merge-1",
      "components/modal/global-modal-position.js",
      "components/multi-select/global-multi-select.js",
      "shared/scripts/organization-store.js",
      "components/organization-tree/organization-tree.js?v=20261001-merge-1",
      "components/filter-bar/global-filter-bar.js?v=20260910-tree-combobox-1",
      "components/table/global-table.js?v=20260929-course-menu-1",
      "channels/learning-center/learning-data.js?v=20260922-asset-paths-1",
      "channels/learning-center/learning-app.js?v=20261009-delete-solid-1"
    ],
    "source": "window.__GAIP_LEARNING_APP__.openStudyDetail(\"users\")",
    "invoke": {
      "path": "__GAIP_LEARNING_APP__.openStudyDetail",
      "args": [
        "users"
      ]
    },
    "definitionSource": "channels/learning-center/learning-app.js"
  },
  {
    "id": "learning-course-study-detail",
    "title": "课程学习详情",
    "channel": "学习中心",
    "type": "modal",
    "category": "information",
    "status": "ready",
    "styles": [
      "shared/styles/global-font.css",
      "components/modal/global-modal.css?v=20261001-merge-1",
      "components/modal/global-modal-position.css",
      "components/modal/global-modal-mask.css?v=20260910-backdrop-1",
      "components/multi-select/global-multi-select.css?v=20261002-collapse-1",
      "components/organization-tree/organization-tree.css?v=20261008-icon-standard-1",
      "components/filter-bar/global-filter-bar.css?v=20261001-merge-1",
      "components/table/global-table.css?v=20261009-action-hover-1",
      "channels/learning-center/learning-center.css?v=20261009-delete-solid-1"
    ],
    "scripts": [
      "components/modal/global-modal.js?v=20261001-merge-1",
      "components/modal/global-modal-position.js",
      "components/multi-select/global-multi-select.js",
      "shared/scripts/organization-store.js",
      "components/organization-tree/organization-tree.js?v=20261001-merge-1",
      "components/filter-bar/global-filter-bar.js?v=20260910-tree-combobox-1",
      "components/table/global-table.js?v=20260929-course-menu-1",
      "channels/learning-center/learning-data.js?v=20260922-asset-paths-1",
      "channels/learning-center/learning-app.js?v=20261009-delete-solid-1"
    ],
    "source": "window.__GAIP_LEARNING_APP__.openStudyDetail(\"courses\")",
    "invoke": {
      "path": "__GAIP_LEARNING_APP__.openStudyDetail",
      "args": [
        "courses"
      ]
    },
    "definitionSource": "channels/learning-center/learning-app.js"
  },
  {
    "id": "learning-live-editor",
    "title": "新增 / 编辑直播 Banner",
    "channel": "学习中心",
    "type": "modal",
    "category": "form",
    "status": "ready",
    "source": "window.__GAIP_LEARNING_LIVE__.openEditor()",
    "invoke": {
      "path": "__GAIP_LEARNING_LIVE__.openEditor",
      "args": [
        null,
        true
      ]
    },
    "styles": [
      "components/modal/global-modal.css?v=20261001-merge-1",
      "components/modal/global-modal-position.css",
      "components/modal/global-modal-mask.css",
      "shared/styles/global-page-form.css",
      "components/multi-select/global-multi-select.css?v=20261002-collapse-1",
      "components/date-picker/global-date-picker.css?v=20260930-local-icons-3",
      "components/modal-controls/modal-controls.css?v=20261001-merge-1",
      "channels/learning-center/learning-center.css?v=20261008-icon-standard-1"
    ],
    "scripts": [
      "components/modal/global-modal.js?v=20261001-merge-1",
      "components/modal/global-modal-position.js",
      "components/multi-select/global-multi-select.js",
      "components/date-picker/global-date-picker.js",
      "components/modal-controls/modal-controls.js",
      "channels/learning-center/learning-data.js?v=20260922-asset-paths-1",
      "channels/learning-center/learning-live-data.js?v=20261002-live-remock-1",
      "channels/learning-center/learning-live.js?v=20261009-live-delete-1"
    ],
    "definitionSource": "channels/learning-center/learning-live.js"
  },
  {
    "id": "learning-live-publish",
    "title": "直播 Banner 上架确认",
    "channel": "学习中心",
    "type": "confirm",
    "category": "confirmation",
    "status": "ready",
    "source": "window.__GAIP_LEARNING_LIVE__.openConfirm()",
    "invoke": {
      "path": "__GAIP_LEARNING_LIVE__.openConfirm",
      "args": [
        "publish"
      ]
    },
    "styles": [
      "components/modal/global-modal.css?v=20261001-merge-1",
      "components/modal/global-modal-position.css",
      "components/modal/global-modal-mask.css",
      "shared/styles/global-page-form.css",
      "components/multi-select/global-multi-select.css?v=20261002-collapse-1",
      "components/date-picker/global-date-picker.css?v=20260930-local-icons-3",
      "components/modal-controls/modal-controls.css?v=20261001-merge-1",
      "channels/learning-center/learning-center.css?v=20261008-icon-standard-1"
    ],
    "scripts": [
      "components/modal/global-modal.js?v=20261001-merge-1",
      "components/modal/global-modal-position.js",
      "components/multi-select/global-multi-select.js",
      "components/date-picker/global-date-picker.js",
      "components/modal-controls/modal-controls.js",
      "channels/learning-center/learning-data.js?v=20260922-asset-paths-1",
      "channels/learning-center/learning-live-data.js?v=20261002-live-remock-1",
      "channels/learning-center/learning-live.js?v=20261009-live-delete-1"
    ],
    "definitionSource": "channels/learning-center/learning-live.js"
  },
  {
    "id": "learning-live-offline",
    "title": "直播 Banner 下架确认",
    "channel": "学习中心",
    "type": "confirm",
    "category": "confirmation",
    "status": "ready",
    "source": "window.__GAIP_LEARNING_LIVE__.openConfirm()",
    "invoke": {
      "path": "__GAIP_LEARNING_LIVE__.openConfirm",
      "args": [
        "offline"
      ]
    },
    "styles": [
      "components/modal/global-modal.css?v=20261001-merge-1",
      "components/modal/global-modal-position.css",
      "components/modal/global-modal-mask.css",
      "shared/styles/global-page-form.css",
      "components/multi-select/global-multi-select.css?v=20261002-collapse-1",
      "components/date-picker/global-date-picker.css?v=20260930-local-icons-3",
      "components/modal-controls/modal-controls.css?v=20261001-merge-1",
      "channels/learning-center/learning-center.css?v=20261008-icon-standard-1"
    ],
    "scripts": [
      "components/modal/global-modal.js?v=20261001-merge-1",
      "components/modal/global-modal-position.js",
      "components/multi-select/global-multi-select.js",
      "components/date-picker/global-date-picker.js",
      "components/modal-controls/modal-controls.js",
      "channels/learning-center/learning-data.js?v=20260922-asset-paths-1",
      "channels/learning-center/learning-live-data.js?v=20261002-live-remock-1",
      "channels/learning-center/learning-live.js?v=20261009-live-delete-1"
    ],
    "definitionSource": "channels/learning-center/learning-live.js"
  },
  {
    "id": "learning-live-remove",
    "title": "删除直播 Banner 草稿",
    "channel": "学习中心",
    "type": "confirm",
    "category": "confirmation",
    "status": "ready",
    "source": "window.__GAIP_LEARNING_LIVE__.openConfirm()",
    "invoke": {
      "path": "__GAIP_LEARNING_LIVE__.openConfirm",
      "args": [
        "remove"
      ]
    },
    "styles": [
      "components/modal/global-modal.css?v=20261001-merge-1",
      "components/modal/global-modal-position.css",
      "components/modal/global-modal-mask.css",
      "shared/styles/global-page-form.css",
      "components/multi-select/global-multi-select.css?v=20261002-collapse-1",
      "components/date-picker/global-date-picker.css?v=20260930-local-icons-3",
      "components/modal-controls/modal-controls.css?v=20261001-merge-1",
      "channels/learning-center/learning-center.css?v=20261008-icon-standard-1"
    ],
    "scripts": [
      "components/modal/global-modal.js?v=20261001-merge-1",
      "components/modal/global-modal-position.js",
      "components/multi-select/global-multi-select.js",
      "components/date-picker/global-date-picker.js",
      "components/modal-controls/modal-controls.js",
      "channels/learning-center/learning-data.js?v=20260922-asset-paths-1",
      "channels/learning-center/learning-live-data.js?v=20261002-live-remock-1",
      "channels/learning-center/learning-live.js?v=20261009-live-delete-1"
    ],
    "definitionSource": "channels/learning-center/learning-live.js"
  },
  {
    "id": "learning-live-discard",
    "title": "放弃直播 Banner 修改",
    "channel": "学习中心",
    "type": "confirm",
    "category": "confirmation",
    "status": "ready",
    "source": "window.__GAIP_LEARNING_LIVE__.openConfirm()",
    "invoke": {
      "path": "__GAIP_LEARNING_LIVE__.openConfirm",
      "args": [
        "discard"
      ]
    },
    "styles": [
      "components/modal/global-modal.css?v=20261001-merge-1",
      "components/modal/global-modal-position.css",
      "components/modal/global-modal-mask.css",
      "shared/styles/global-page-form.css",
      "components/multi-select/global-multi-select.css?v=20261002-collapse-1",
      "components/date-picker/global-date-picker.css?v=20260930-local-icons-3",
      "components/modal-controls/modal-controls.css?v=20261001-merge-1",
      "channels/learning-center/learning-center.css?v=20261008-icon-standard-1"
    ],
    "scripts": [
      "components/modal/global-modal.js?v=20261001-merge-1",
      "components/modal/global-modal-position.js",
      "components/multi-select/global-multi-select.js",
      "components/date-picker/global-date-picker.js",
      "components/modal-controls/modal-controls.js",
      "channels/learning-center/learning-data.js?v=20260922-asset-paths-1",
      "channels/learning-center/learning-live-data.js?v=20261002-live-remock-1",
      "channels/learning-center/learning-live.js?v=20261009-live-delete-1"
    ],
    "definitionSource": "channels/learning-center/learning-live.js"
  }
], { origin: 'source-annotation' });
}());
