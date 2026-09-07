(function () {
  'use strict';

  var sequence = 0;
  var managedClasses = [
    'gaip-modal--default',
    'gaip-modal--confirm',
    'gaip-modal--danger',
    'gaip-modal--blocked',
    'gaip-modal--complex'
  ];

  function required(dialog, selector) {
    var element = dialog.querySelector(selector);
    if (!element) throw new Error('标准弹窗缺少必要节点：' + selector);
    return element;
  }

  function requiredButton(dialog, supplied, selector, role) {
    var button = supplied || dialog.querySelector(selector);
    if (!button) throw new Error('标准确认弹窗缺少' + role + '按钮');
    return button;
  }

  function setButtonLabel(button, label) {
    var labelNode = button.querySelector('span');
    (labelNode || button).textContent = label;
  }

  function closeIconMarkup() {
    return '<span role="img" aria-hidden="true" class="anticon anticon-close"><svg viewBox="64 64 896 896" focusable="false" width="1em" height="1em" fill="currentColor"><path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7a16 16 0 0 0-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 0 0 203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1a16 16 0 0 0 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"></path></svg></span>';
  }

  function normalizeAntConfirm(dialog) {
    var content = dialog.querySelector('.ant-modal-content');
    var legacyTitle = dialog.querySelector('.ant-modal-confirm-title');
    var legacyFooter = dialog.querySelector('.ant-modal-confirm-btns');
    var legacyWrapper;
    var header;
    var body;
    var title;
    if (!content || !legacyTitle || !legacyFooter) return;

    legacyWrapper = dialog.querySelector('.ant-modal-confirm-body-wrapper');
    header = Array.prototype.find.call(content.children, function (element) {
      return element.classList.contains('ant-modal-header');
    });
    body = Array.prototype.find.call(content.children, function (element) {
      return element.classList.contains('ant-modal-body');
    });
    if (!header) {
      header = document.createElement('div');
      header.className = 'ant-modal-header';
      content.insertBefore(header, content.firstChild);
    }
    title = header.querySelector('.ant-modal-title');
    if (!title) {
      legacyTitle.classList.remove('ant-modal-confirm-title');
      legacyTitle.classList.add('ant-modal-title');
      header.appendChild(legacyTitle);
    } else if (legacyTitle !== title) {
      legacyTitle.remove();
    }
    legacyTitle.classList.remove('ant-modal-confirm-title');
    if (!body) {
      body = document.createElement('div');
      body.className = 'ant-modal-body';
      content.insertBefore(body, header.nextSibling);
    }
    legacyFooter.classList.add('ant-modal-footer');
    content.appendChild(legacyFooter);
    if (legacyWrapper && legacyWrapper.isConnected) legacyWrapper.remove();
  }

  function ensureCloseButton(dialog) {
    var close = dialog.querySelector('.ant-modal-close');
    var content;
    if (close) return close;
    content = required(dialog, '.ant-modal-content');
    close = document.createElement('button');
    close.type = 'button';
    close.className = 'ant-modal-close';
    close.innerHTML = '<span class="ant-modal-close-x">' + closeIconMarkup() + '</span>';
    content.insertBefore(close, content.firstChild);
    return close;
  }

  function normalizeCloseButton(dialog) {
    var close = ensureCloseButton(dialog);
    var iconBox = close.querySelector('.ant-modal-close-x');
    if (!iconBox) {
      iconBox = document.createElement('span');
      iconBox.className = 'ant-modal-close-x';
    }
    iconBox.innerHTML = closeIconMarkup();
    iconBox.removeAttribute('aria-label');
    iconBox.removeAttribute('title');
    iconBox.setAttribute('aria-hidden', 'true');
    close.replaceChildren(iconBox);
    close.type = 'button';
    return close;
  }

  function removeHashedPresentationClasses(elements) {
    elements.forEach(function (element) {
      Array.prototype.slice.call(element.classList).forEach(function (className) {
        if (className.indexOf('___') !== -1) element.classList.remove(className);
      });
    });
  }

  function resetManagedClasses(dialog) {
    managedClasses.forEach(function (className) {
      dialog.classList.remove(className);
    });
  }

  function adopt(dialog, options) {
    options = options || {};
    if (!dialog || dialog.nodeType !== 1) throw new TypeError('标准弹窗需要有效的 dialog 元素');

    normalizeAntConfirm(dialog);

    var title = required(dialog, '.ant-modal-title');
    var close = normalizeCloseButton(dialog);
    var body = required(dialog, '.ant-modal-body');
    var footer = required(dialog, '.ant-modal-footer');
    var cancel = requiredButton(dialog, options.cancelButton, '.ant-modal-footer [data-modal-cancel], .ant-modal-footer [data-department-cancel], .ant-modal-footer .ant-btn-default', '取消');
    var confirm = requiredButton(dialog, options.confirmButton, '.ant-modal-footer [data-modal-confirm], .ant-modal-footer [data-department-save], .ant-modal-footer .ant-btn-primary', '确认');
    var id = ++sequence;

    var type = options.type || 'default';
    var size = options.size === 'complex' ? 'complex' : 'default';

    removeHashedPresentationClasses([dialog, title, close, body, footer, cancel, confirm]);
    resetManagedClasses(dialog);
    dialog.classList.add('gaip-modal', 'gaip-modal--' + type);
    if (options.tone) dialog.classList.add('gaip-modal--' + options.tone);
    if (size === 'complex') dialog.classList.add('gaip-modal--complex');
    dialog.dataset.gaipModalComponent = 'v1.1.3';
    dialog.dataset.gaipModalSize = size;

    title.classList.add('gaip-modal__title');
    title.id = title.id || 'gaip-modal-title-' + id;
    if (options.title) title.textContent = options.title;
    dialog.setAttribute('aria-labelledby', title.id);

    close.classList.add('gaip-modal__close');
    close.setAttribute('aria-label', options.closeLabel || '关闭' + title.textContent + '弹窗');
    required(close, '.ant-modal-close-x').classList.add('gaip-modal__close-icon');
    body.classList.add('gaip-modal__body');
    footer.classList.add('gaip-modal__footer');
    cancel.classList.add('gaip-modal__button', 'gaip-modal__button--secondary');
    confirm.classList.add('gaip-modal__button', 'gaip-modal__button--primary');

    return { dialog: dialog, title: title, close: close, body: body, footer: footer, cancel: cancel, confirm: confirm };
  }

  function setConfirmState(dialog, options) {
    options = options || {};
    options.type = options.type || 'confirm';
    var parts = adopt(dialog, options);
    var content = document.createElement('div');
    var message = document.createElement('p');
    var describedBy = [];

    content.className = 'gaip-modal-confirm';
    message.className = 'gaip-modal-confirm__message';
    message.id = 'gaip-modal-message-' + sequence;
    message.textContent = options.message || '';
    content.appendChild(message);
    describedBy.push(message.id);

    if (options.description) {
      var description = document.createElement('p');
      description.className = 'gaip-modal-confirm__description';
      description.id = 'gaip-modal-description-' + sequence;
      description.textContent = options.description;
      content.appendChild(description);
      describedBy.push(description.id);
    }

    parts.body.replaceChildren(content);
    dialog.setAttribute('aria-describedby', describedBy.join(' '));
    setButtonLabel(parts.cancel, options.cancelLabel || '取消');
    setButtonLabel(parts.confirm, options.confirmLabel || '确认');
    parts.confirm.disabled = !!options.confirmDisabled;
    dialog.classList.toggle('gaip-modal--blocked', parts.confirm.disabled);
    dialog.dataset.gaipModalState = parts.confirm.disabled ? 'blocked' : 'ready';
    return parts;
  }

  window.__GAIP_MODAL_COMPONENT__ = {
    version: '1.1.3',
    adopt: adopt,
    setConfirmState: setConfirmState
  };
})();
