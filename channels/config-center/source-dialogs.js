/* @gaip-markup-cache:start */
// Generated from the owned templates/markup-*.html; run npm run build:templates.
var __gaipMarkup_73fb1f22c5 = (function () {
  var templates = {"memberCheckboxControl-1":"<label class=\"ant-checkbox-wrapper ant-checkbox-wrapper-in-form-item css-var-r0 ant-checkbox-css-var css-10wz6x1{{gaip:0}}\"><span class=\"ant-checkbox ant-wave-target css-10wz6x1{{gaip:1}}\"><input id=\"{{gaip:2}}\" data-member-editor-role=\"{{gaip:3}}\" class=\"ant-checkbox-input\" type=\"checkbox\"{{gaip:4}}><span class=\"ant-checkbox-inner\"></span></span><span class=\"ant-checkbox-label\">{{gaip:5}}</span></label>","memberRadioControl-2":"<label class=\"ant-radio-wrapper ant-radio-wrapper-in-form-item css-10wz6x1 css-var-r0 ant-radio-css-var{{gaip:0}}\"><span class=\"ant-radio ant-wave-target{{gaip:1}}\"><input id=\"{{gaip:2}}\" data-member-editor-role=\"clue\" name=\"clueRole\" class=\"ant-radio-input\" type=\"radio\" value=\"{{gaip:3}}\"{{gaip:4}}><span class=\"ant-radio-inner\"></span></span><span class=\"ant-radio-label\">{{gaip:5}}</span></label>","addMemberRoleFields-3":"<div class=\"memberRoleLabel___sY1qM\">管理员</div><div class=\"memberRoleOptions___kP3tN\">{{gaip:0}}{{gaip:1}}</div>","addMemberRoleFields-4":"<div class=\"ant-form-item clueRoleModule___f7R2c css-var-r0 ant-form-css-var css-10wz6x1 ant-form-item-vertical\"><div class=\"ant-row ant-form-item-row css-10wz6x1 css-var-r0\"><div class=\"ant-col ant-form-item-label css-10wz6x1 css-var-r0\"><label for=\"clueRoleNone\" title=\"线索\">线索</label></div><div class=\"ant-col ant-form-item-control css-10wz6x1 css-var-r0\"><div class=\"ant-form-item-control-input\"><div class=\"ant-form-item-control-input-content\"><div class=\"ant-radio-group ant-radio-group-outline typeGroup___cnCo5 clueRoleOptions___Y4mLs css-10wz6x1 css-var-r0 ant-radio-css-var\" id=\"clueRole\">{{gaip:0}}{{gaip:1}}{{gaip:2}}</div><p class=\"clueRoleHint___L8f3v\">线索管理员仅由超级管理员配置，线索跟进人可由超级管理员或线索管理员配置。</p></div></div></div></div></div>"};
  return function (id, values) {
    if (!Object.prototype.hasOwnProperty.call(templates, id)) throw new Error("Missing HTML template: " + id);
    return templates[id].replace(/\{\{gaip:(\d+)\}\}/g, function (_, index) {
      if (!values || !Object.prototype.hasOwnProperty.call(values, index)) throw new Error("Missing HTML binding: " + id + ":" + index);
      return values[index];
    });
  };
}());
/* @gaip-markup-cache:end */
(function () {
  'use strict';

  var source = window.__GAIP_CONFIG_SOURCE__;

  function memberCheckboxControl(id, role, label, checked) {
    return __gaipMarkup_73fb1f22c5("memberCheckboxControl-1", [('' + (checked ? ' ant-checkbox-wrapper-checked' : '')), ('' + (checked ? ' ant-checkbox-checked' : '')), ('' + (id)), ('' + (role)), ('' + (checked ? ' checked' : '')), ('' + (label))]);
  }

  function memberRadioControl(id, value, label, checked) {
    return __gaipMarkup_73fb1f22c5("memberRadioControl-2", [('' + (checked ? ' ant-radio-wrapper-checked' : '')), ('' + (checked ? ' ant-radio-checked' : '')), ('' + (id)), ('' + (value)), ('' + (checked ? ' checked' : '')), ('' + (label))]);
  }

  function addMemberRoleFields(dialog) {
    var adminRow = dialog.querySelector('.adminCheckbox___XXdfO');
    adminRow.classList.add('memberRoleModule___W8rjP');
    adminRow.innerHTML = __gaipMarkup_73fb1f22c5("addMemberRoleFields-3", [('' + (memberCheckboxControl('isAdmin', 'organization', '组织架构管理员（人管）', false))), ('' + (memberCheckboxControl('isCommissionOwner', 'commission', '上级佣金归属人（佣金）', false)))]);
    var referrerItem = dialog.querySelector('#referrerType').closest('.ant-form-item');
    referrerItem.insertAdjacentHTML('afterend', __gaipMarkup_73fb1f22c5("addMemberRoleFields-4", [('' + (memberRadioControl('clueRoleNone', 'none', '无', true))), ('' + (memberRadioControl('clueRoleAdmin', 'clue-admin', '线索管理员', false))), ('' + (memberRadioControl('clueRoleFollower', 'clue-follower', '线索跟进人', false)))]));
  }

  function createMemberDialog() {
    var dialog = document.createElement('dialog');
    dialog.className = source.editorClass + ' gaip-config-editor';
    dialog.innerHTML = source.editor;
    addMemberRoleFields(dialog);
    return dialog;
  }

  function createDepartmentDialog(action) {
    var template = source.departmentUi[action === 'delete' ? 'add' : action];
    var dialog = document.createElement('dialog');
    dialog.className = template.classes + ' gaip-config-editor gaip-department-editor';
    dialog.innerHTML = template.html;
    if (action === 'delete') {
      dialog.dataset.gaipModalId = 'config-delete';
      dialog.querySelector('.ant-modal-title').textContent = '删除部门';
    }
    return dialog;
  }

  window.__GAIP_CONFIG_DIALOG_FACTORY__ = {
    createMemberDialog: createMemberDialog,
    createDepartmentDialog: createDepartmentDialog
  };
}());
