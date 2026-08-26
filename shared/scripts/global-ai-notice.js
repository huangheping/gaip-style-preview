(function () {
  'use strict';

  var rootSelector = '[data-gaip-ai-notice-root]';

  function root() {
    var node = document.querySelector(rootSelector);
    if (node) return node;
    node = document.createElement('div');
    node.className = 'gaip-ai-notice-root';
    node.setAttribute('data-gaip-ai-notice-root', 'true');
    node.addEventListener('click', function (event) {
      var close = event.target.closest('[data-gaip-ai-notice-close]');
      if (close && (!event.target.closest('[data-gaip-ai-notice-panel]') || close.matches('button'))) {
        hide();
      }
    });
    node.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') hide();
    });
    document.body.appendChild(node);
    return node;
  }

  function render(options) {
    var title = options && options.title || '重要提示';
    var subtitle = options && options.subtitle || '请阅读并确认以下 Al 内容使用声明';
    var warning = options && options.warning || 'Al 生成内容可能存在偏差，仅供参考，不构成投资、保险或财务建议。';
    var content = options && options.content || '内容借助AI工具整理生成，可能存在偏差，仅供参考，不构成对于任何投资、保险、金融产品或财务安排之招揽、邀约或任何建议。本公司不就使用此AI内容或其所载的任何言论、意见或预测而导致的任何直接或间接的后果或损失承担任何责任，亦不会对其分析准确性或完整性作出承诺或保证。投资者应根据个人的情况决定理财方案是否切合个人的财务需求、财政状况、负担能力、投资经验、投资目标，及承受风险能力等，不应依赖于本AI内容作任何投保、投资或理财决定。金融产品涉及风险，如有疑问，请咨询专家的意见。持牌经纪人或顾问须复核AI所生成的内容。本内容只供于其分发、传递为合法的国家、地域分发、传递。本内容并非向禁止本文件的任何国家、地域的任何人士（因其国籍、居民身份或其他原因）发出。';
    var okText = options && options.okText || '我已了解并同意';

    return '<div class="gaip-ai-notice-backdrop" role="presentation" data-gaip-ai-notice-close>' +
      '<article class="gaip-ai-notice modalWrapper___DNmrY" role="dialog" aria-modal="true" aria-labelledby="gaipAiNoticeTitle" data-gaip-ai-notice-panel>' +
        '<div class="ant-modal-content gaip-ai-notice-surface">' +
          '<div class="ant-modal-body">' +
            '<div class="body___wfC2V gaip-ai-notice-body">' +
              '<h1 class="title___YOalC" id="gaipAiNoticeTitle">' + escapeHtml(title) + '</h1>' +
              '<p class="subTitle___mPEaw">' + escapeHtml(subtitle) + '</p>' +
              '<p class="alert___ITMfZ">' + escapeHtml(warning) + '</p>' +
              '<div class="content___wbXbd gaip-ai-notice-copy">' + escapeHtml(content) + '</div>' +
              '<button class="confirm___XphDd" type="button" data-gaip-ai-notice-close>' + escapeHtml(okText) + '</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</article>' +
    '</div>';
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function show(options) {
    root().innerHTML = render(options || {});
  }

  function hide() {
    var node = document.querySelector(rootSelector);
    if (node) node.innerHTML = '';
  }

  var api = {
    show: show,
    hide: hide
  };

  window.__GAIP_AI_NOTICE__ = api;
  window.__GAIP_AGENT_AI_NOTICE__ = api;

  document.addEventListener('click', function (event) {
    var agentTrigger = event.target && event.target.closest && event.target.closest('.aiTip___fSvnI .action___o7v5z');
    var globalTrigger = event.target && event.target.closest && event.target.closest('[data-gaip-ai-notice-trigger]');
    if (!agentTrigger && !globalTrigger) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    show();
  }, true);

  document.addEventListener('gaip-ai-notice:open', function (event) {
    show(event && event.detail || {});
  });
  document.addEventListener('gaip-agent-ai-notice:open', function (event) {
    show(event && event.detail || {});
  });
}());
