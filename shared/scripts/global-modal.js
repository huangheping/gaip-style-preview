(function () {
  'use strict';

  if (window.__GAIP_MODAL_COMPONENT__) return;

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

  // Non-destructive visual adapter: retain React nodes and business listeners.
  // Confirmation and forms obtain the icon from the same closeIconMarkup source.
  function adoptClose(close) {
    if (!close) return null;
    if (!close.classList.contains('gaip-modal__close--preserve')) {
      var svg = closeIconMarkup().match(/<svg[\s\S]*<\/svg>/)[0]
        .replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
      close.style.setProperty('--gaip-modal-close-image', 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")');
      close.classList.add('gaip-modal__close', 'gaip-modal__close--preserve', 'gaip-form-part');
      if (!close.getAttribute('aria-label')) close.setAttribute('aria-label', '关闭弹窗');
      if (close.tagName !== 'BUTTON') {
        close.setAttribute('role', 'button');
        close.tabIndex = 0;
        close.addEventListener('keydown', function (event) {
          if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); close.click(); }
        });
      }
    }
    return close;
  }

  var formSelector = '.ant-modal, .gaip-owner-dialog, .gaip-activity-modal__panel, .gaip-wealth-modal';
  var localFormSelector = '.gaip-config-editor:not([data-gaip-modal-id="config-delete"]), .gaip-bulk-import-dialog, .gaip-adjust-node-dialog, .gaip-announcement-dialog:not(.gaip-announcement-confirm), .gaip-owner-dialog, .gaip-activity-modal__panel, .gaip-wealth-modal, .editIntroModal___beZtT, .modal___wKSui';
  var legacyFormTitles = /^(编辑对话名称|新增线索|分配线索|标记已转化|标记已关闭|标记转化|标记关闭|编辑-客户资料介绍|新增沟通纪要|编辑沟通纪要|沟通纪要)$/;

  function own(dialog, selector) {
    return Array.prototype.filter.call(dialog.querySelectorAll(selector), function (node) {
      return node.closest(formSelector) === dialog;
    });
  }

  function mark(node, name) {
    if (node && !node.classList.contains(name)) node.classList.add(name);
    if (node && name.indexOf('gaip-modal__') === 0 && !node.classList.contains('gaip-form-part')) node.classList.add('gaip-form-part');
    return node;
  }

  // Region contract is semantic only. Never move React-owned nodes or add CSS
  // geometry here. Nested regions take ownership over their containing body.
  function getRegions(dialog) {
    if (!dialog || !dialog.matches('.gaip-modal, .gaip-modal-form')) return null;
    var first = function (selector) { return own(dialog, selector)[0] || null; };
    return {
      surface: first('.ant-modal-content') || dialog,
      header: first('.ant-modal-header, header, .header___EnI5B'),
      body: first('.ant-modal-body, .gaip-owner-list, .gaip-activity-modal__body, .gaip-wealth-modal-body, .gaip-bulk-modal-body, .gaip-adjust-node-body'),
      footer: first('.ant-modal-footer, footer, .footer___UhMLM, .footer___amsp6, .footer___pW89H, .footer___ea4l8'),
      steps: first('.gaip-bulk-steps'),
      toolbar: first('.gaip-owner-search-row, .headerActions___HeDY3'),
      feedback: first('.gaip-bulk-drop-overlay'),
      close: first('.gaip-modal__close')
    };
  }

  function adoptRegions(dialog) {
    var regions = getRegions(dialog);
    if (!regions) return null;
    dialog.setAttribute('data-gaip-modal-regions', 'v1');
    Object.keys(regions).forEach(function (name) {
      var node = regions[name];
      if (!node) return;
      if (name === 'surface') node.setAttribute('data-gaip-modal-surface', '');
      else if (name === 'close') node.setAttribute('data-gaip-modal-control', 'close');
      else node.setAttribute('data-gaip-modal-region', name);
    });
    // Explicitly expose legacy nesting rather than pretending all regions are
    // siblings or that the shared layer already owns their scroll containers.
    var nested = ['header', 'footer'].filter(function (name) {
      return regions.body && regions[name] && regions.body.contains(regions[name]);
    });
    if (nested.length) dialog.setAttribute('data-gaip-modal-nested-regions', nested.join(' '));
    else dialog.removeAttribute('data-gaip-modal-nested-regions');
    return regions;
  }

  // Apply presentation classes only: React still owns values, validation and events.
  function adoptFields(dialog) {
    var excluded = '.ant-select, .ant-picker, .ant-input-number, .ant-tree, [role="tree"], table, .ant-table, [data-gaip-form-field="exclude"]';
    own(dialog, 'input, textarea').forEach(function (control) {
      if (control.closest(excluded) || control.matches('[role="combobox"]')) return;
      if (control.tagName === 'INPUT' && !/^(text|email|tel|url|password|number)$/.test(control.type)) return;
      // Search controls belong to their surrounding picker/toolbar, not field primitives.
      if (control.closest('.gaip-owner-search, .gaip-adjust-node-search, .ant-input-search')) return;
      mark(control, 'gaip-form-control');
      if (control.tagName === 'INPUT' || control.tagName === 'TEXTAREA') {
        var shellSelector = control.tagName === 'TEXTAREA' ? '.ant-input-affix-wrapper, .gaip-announcement-input-wrap, [data-gaip-modal-part~="counted-textarea"], [data-gaip-modal-part~="resizable-textarea"]' : '.ant-input-affix-wrapper';
        var shell = control.closest(shellSelector);
        if (shell && own(dialog, shellSelector).indexOf(shell) !== -1) {
          mark(shell, 'gaip-form-input-shell');
          mark(control, 'gaip-form-control--inner');
          if (control.tagName === 'TEXTAREA') mark(shell, 'gaip-form-textarea-shell');
        }
      }
    });
    own(dialog, '.ant-form-item-label').forEach(function (box) {
      if (box.closest(excluded)) return;
      mark(box.querySelector('label'), 'gaip-form-label');
      if (box.closest('.ant-form-vertical, .ant-form-item-vertical')) mark(box, 'gaip-form-label-stack');
    });
    own(dialog, '.gaip-activity-modal__label, .gaip-announcement-label').forEach(function (label) {
      mark(label, 'gaip-form-label'); mark(label, 'gaip-form-label-block');
    });
    own(dialog, 'label').forEach(function (label) {
      if (label.closest(excluded) || label.matches('.ant-form-item')) return;
      // Preserve compound labels (e.g. wealth's horizontal label/input grid).
      if (label.querySelector('.gaip-form-control') && !label.querySelector('input[type="radio"], input[type="checkbox"]')) mark(label, 'gaip-form-label');
      if (label.htmlFor && own(dialog, '.gaip-form-control').some(function (control) { return control.id === label.htmlFor; })) mark(label, 'gaip-form-label');
    });
    own(dialog, '.ant-form-item-extra, .ant-form-item-explain, .gaip-department-error, .gaip-announcement-form-error').forEach(function (help) {
      mark(help, 'gaip-form-help');
      if (help.matches('.gaip-department-error, .gaip-announcement-form-error')) mark(help, 'gaip-form-help--error');
    });
  }

  // Presentation adapters for reusable interiors. Never move fields/React nodes.
  function adoptFeedback(dialog) {
    // Ant owns its additional/error nodes. Reserve space on the existing control
    // before validation, then let its real additional node occupy that same space.
    own(dialog, '.ant-form-item-control').forEach(function (control) {
      if (control.closest('.gaip-modal, [data-gaip-form-field="exclude"], table')) return;
      mark(control, 'gaip-form-feedback-ant');
      mark(control.closest('.ant-form-item'), 'gaip-form-feedback-field');
    });
    // Local sources keep their hidden error node and all business listeners.
    // An empty pseudo slot is not an error message and is not announced by AT.
    own(dialog, '.gaip-activity-modal__field > .gaip-form-help--error, .gaip-department-error, .gaip-announcement-form-error, .gaip-bulk-file-error, .gaip-adjust-node-error, [data-gaip-modal-part~="field-error"]').forEach(function (error) {
      if (error.closest('.gaip-modal, [data-gaip-form-field="exclude"]')) return;
      mark(error, 'gaip-form-feedback-message');
      mark(error.parentElement, 'gaip-form-feedback-local');
      if (error.parentElement.matches('.gaip-kit-field')) mark(error.parentElement, 'gaip-form-feedback-field');
    });
    own(dialog, '.gaip-kit-field-grid').forEach(function (grid) {
      var fields = Array.prototype.filter.call(grid.children, function (child) { return child.matches('.gaip-kit-field'); });
      // The feedback row now supplies the vertical interval. Do not add the old
      // grid row interval again, or change mixed/non-field grids.
      grid.classList.toggle('gaip-form-feedback-grid', fields.length > 0 && fields.length === grid.children.length && fields.every(function (field) { return field.classList.contains('gaip-form-feedback-field'); }));
    });
  }

  // Business validators supply the message; this helper only owns its feedback
  // node and accessibility binding. Never replace existing controls/React nodes.
  function createFieldFeedback(container, control) {
    var ant = container.matches('.ant-form-item-control');
    var slot = ant ? document.createElement('div') : container;
    if (ant) { slot.className = 'ant-form-item-additional'; container.appendChild(slot); }
    var message = document.createElement('div');
    message.id = 'gaip-field-error-' + (++sequence);
    message.className = 'gaip-form-help gaip-form-help--error' + (ant ? ' ant-form-item-explain' : '');
    if (!ant) message.setAttribute('data-gaip-modal-part', 'field-error');
    message.setAttribute('aria-live', 'polite'); message.hidden = true;
    slot.appendChild(message);
    var previousInvalid = control.getAttribute('aria-invalid');
    var description = control.getAttribute('aria-describedby') || '';
    control.setAttribute('aria-describedby', (description + ' ' + message.id).trim());
    function set(text) {
      text = text || '';
      if (message.textContent !== text) message.textContent = text;
      if (message.hidden !== !text) message.hidden = !text;
      var invalid = text ? 'true' : previousInvalid;
      if (invalid === null) { if (control.hasAttribute('aria-invalid')) control.removeAttribute('aria-invalid'); }
      else if (control.getAttribute('aria-invalid') !== invalid) control.setAttribute('aria-invalid', invalid);
      if (container.classList.contains('gaip-form-invalid') !== !!text) container.classList.toggle('gaip-form-invalid', !!text);
    }
    return { node: message, set: set, destroy: function () {
      set('');
      var refs = (control.getAttribute('aria-describedby') || '').split(/\s+/).filter(function (id) { return id && id !== message.id; }).join(' ');
      if (refs) control.setAttribute('aria-describedby', refs); else control.removeAttribute('aria-describedby');
      if (ant) slot.remove(); else message.remove();
    } };
  }

  // New sources may opt in with data-gaip-modal-part="list", "notice", etc.
  function adoptInteriors(dialog) {
    if (!dialog || !dialog.matches('.gaip-modal, .gaip-modal-form')) return;
    mark(dialog, 'gaip-modal-kit');
    var parts = {
      list: '.gaip-owner-list, .targetList___PWUAa, .gaip-bulk-node-tree, .gaip-adjust-node-tree',
      'list-flat': '.gaip-owner-list, .targetList___PWUAa',
      'list-row': '.gaip-owner-option, .targetItem___jBvkl, .gaip-bulk-node-row, .gaip-adjust-node-row',
      'list-name': '.gaip-owner-option-name, .targetName___fjI_t, .gaip-bulk-node-name, .gaip-adjust-node-name, .memberName___en782',
      'list-meta': '.targetRole___nmdYE, .memberAccount___ZQ6PA, .adminRoleCount___HgN9e, .adminRoleHeading___fR73p p, .adminRoleMode___m71Db',
      'option-card': '.typeGroup___cnCo5 > .ant-radio-wrapper, .typeGroup___cnCo5 > .ant-checkbox-wrapper, .adminMemberCard___2fWc8',
      'option-grid': '.typeGroup___cnCo5, .adminMemberGrid___Vne3q',
      section: '.gaip-bulk-section, .gaip-bulk-result-card, .adminRoleWorkspace___u4P8e',
      'section-pad': '.gaip-bulk-location-section, .gaip-bulk-result-card',
      'section-title': '.gaip-bulk-section-heading h3, .gaip-announcement-section-heading h3',
      'section-heading': '.gaip-bulk-section-heading, .gaip-announcement-section-heading',
      'field-section': '.gaip-announcement-form-section',
      'node-heading': '.gaip-bulk-node-heading, .gaip-adjust-target-heading',
      'node-search': '.gaip-bulk-node-search, .gaip-adjust-node-search',
      'node-tree': '.gaip-bulk-node-tree, .gaip-adjust-node-tree',
      'field-grid': '.gaip-activity-modal__form-grid, .formRow___xgoev',
      field: '.gaip-activity-modal__field, .ant-form-item, .field___liuLu',
      label: '.gaip-form-label, .label___X8DRm, .gaip-bulk-field-label, .gaip-announcement-time-label, .memberRoleLabel___sY1qM, .gaip-adjust-target-heading > label',
      'label-inline': '.memberRoleLabel___sY1qM, .gaip-adjust-target-heading > label',
      help: '.gaip-form-help, .footerTip___Iu6Of, .gaip-bulk-upload-limit, .uploadHint___UFRFL, .gaip-announcement-section-heading p',
      error: '.gaip-department-error, .gaip-bulk-file-error, .gaip-adjust-node-error, .gaip-announcement-form-error, .ant-form-item-explain-error',
      empty: '.gaip-owner-empty, .gaip-bulk-node-empty, .gaip-adjust-node-empty, .adminEmpty___a7CPm, .emptyTip___dcIf2, .ant-empty-description',
      notice: '.gaip-bulk-validation-bar, .gaip-bulk-result-note, .gaip-adjust-current-node, .errorBar___Y__NS, .gaip-modal-confirm__description',
      'notice-error': '.errorBar___Y__NS',
      steps: '.gaip-bulk-steps',
      attachment: '.gaip-bulk-upload-file, .ant-upload-list-item',
      'table-wrap': '.gaip-bulk-table-wrap, .ant-table-container',
      table: '.gaip-bulk-table, .ant-table',
      summary: '.gaip-bulk-summary, .gaip-adjust-member-summary > div',
      'summary-grid': '.gaip-bulk-summary-grid, .gaip-adjust-member-summary',
      result: '.gaip-bulk-result',
      actions: '.gaip-bulk-result-actions, .gaip-modal__actions, .gaip-modal__footer',
      count: '.ant-input-data-count, .gaip-announcement-input-wrap small'
    };
    Object.keys(parts).forEach(function (name) {
      var selector = parts[name];
      dialog.querySelectorAll(selector + ', [data-gaip-modal-part~="' + name + '"]').forEach(function (node) {
        if (node.closest('.gaip-modal, .gaip-modal-form') === dialog && !node.closest('[data-gaip-form-field="exclude"], .gaip-modal-popup')) mark(node, 'gaip-kit-' + name);
      });
    });
    dialog.querySelectorAll('.gaip-form-textarea-shell').forEach(function (shell) {
      if (shell.closest('.gaip-modal, .gaip-modal-form') !== dialog) return;
      if (shell.querySelector('.gaip-kit-count')) {
        mark(shell, 'gaip-kit-counted');
        var area = shell.querySelector('textarea');
        shell.classList.toggle('gaip-kit-counted-no-resize', !!area && ((window.getComputedStyle(area).resize === 'none' && !area.classList.contains('gaip-mc-resize-source')) || area.hasAttribute('data-announcement-autosize')));
      }
    });
    // Native disable/checked state stays authoritative, including role-panel read-only.
    dialog.querySelectorAll('.gaip-kit-option-card').forEach(function (card) {
      card.classList.toggle('gaip-kit-option-disabled', !!card.querySelector('input:disabled') || card.getAttribute('aria-disabled') === 'true');
    });
    dialog.querySelectorAll('.gaip-bulk-result-actions .gaip-bulk-button:not(.is-link)').forEach(function (button) {
      mark(button, 'gaip-modal__button');
      mark(button, button.classList.contains('is-primary') ? 'gaip-modal__button--primary' : 'gaip-modal__button--secondary');
    });
  }

  function adoptForm(dialog) {
    if (!dialog || dialog.matches('.gaip-modal, .agentModal___Nxp06, .ant-drawer')) return null;
    var surface = own(dialog, '.ant-modal-content')[0] || dialog;
    // This legacy editor exposes only two header spans, no native close/footer.
    // Shared buttons delegate to those live handlers; never move React children.
    if (dialog.matches('.editIntroModal___beZtT') && !surface.querySelector('[data-gaip-form-proxy-footer]')) {
      var proxy = document.createElement('footer');
      proxy.dataset.gaipFormProxyFooter = '';
      proxy.className = 'ant-modal-footer';
      mark(proxy, 'gaip-modal__form-footer');
      mark(proxy, 'gaip-modal__actions');
      ['取消', '保存'].forEach(function (label, index) {
        var button = document.createElement('button'); button.type = 'button';
        button.className = index ? 'ant-btn-primary' : 'ant-btn-default';
        mark(button, 'gaip-modal__button');
        mark(button, index ? 'gaip-modal__button--primary' : 'gaip-modal__button--secondary');
        button.textContent = label;
        button.addEventListener('click', function () {
          var action = dialog.querySelectorAll('.editIntroModalActions___xav5R > span')[index];
          if (action) action.click();
        });
        proxy.appendChild(button);
      });
      surface.appendChild(proxy);
      var proxyClose = document.createElement('button'); proxyClose.type = 'button';
      proxyClose.className = 'ant-modal-close';
      proxyClose.addEventListener('click', function () { proxy.firstElementChild.click(); });
      surface.appendChild(proxyClose);
    }
    var header = own(dialog, '.ant-modal-header, header, .header___EnI5B')[0];
    var title = header && (header.querySelector('.editIntroModalHeader___Ucvov > span') || header.querySelector('.ant-modal-title, h2, h3'));
    var close = own(dialog, '.ant-modal-close, .gaip-owner-close, .gaip-activity-modal__close, .gaip-bulk-close, .gaip-adjust-node-close, .closeIcon___OJKYP, header > button[aria-label*="关闭"]')[0];
    var footer = own(dialog, '[data-gaip-form-proxy-footer]')[0] || own(dialog, '.ant-modal-footer, footer, .footer___UhMLM, .footer___amsp6, .footer___pW89H, .footer___ea4l8')[0];
    mark(dialog, 'gaip-modal-form');
    mark(surface, 'gaip-modal__surface');
    mark(header, 'gaip-modal__form-header');
    mark(title, 'gaip-modal__title');
    // Adopt only explicit subtitle semantics; never guess arbitrary header text.
    if (header) {
      own(dialog, '.gaip-owner-subtitle, .gaip-activity-modal__subtitle, [data-gaip-modal-subtitle]').filter(function (node) {
        return header.contains(node);
      }).forEach(function (node) { mark(node, 'gaip-modal__subtitle'); });
    }
    var body = own(dialog, '.ant-modal-body, .gaip-activity-modal__body, .gaip-wealth-modal-body, .gaip-bulk-modal-body, .gaip-adjust-node-body')[0];
    mark(body, 'gaip-modal__form-body');
    if (body) {
      body.classList.toggle('gaip-form-body-after-steps', own(dialog, '.gaip-bulk-steps').length > 0);
      var lead = Array.prototype.find.call(body.children, function (node) {
        return node !== header && node !== footer && !node.hidden && !node.matches('script, style');
      });
      if (lead) mark(lead, 'gaip-form-body-lead');
    }
    adoptClose(close);
    adoptFields(dialog);
    if (footer) {
      mark(footer, 'gaip-modal__form-footer');
      if (dialog.matches('.editIntroModal___beZtT, .modal___wKSui, [data-gaip-form-footer="standard"]')) mark(footer, 'gaip-modal__form-footer--standard');
      var buttons = own(dialog, 'button').filter(function (button) { return footer.contains(button); });
      buttons.forEach(function (button) {
        // Leave auxiliary text links / download / retry actions intact.
        var primary = button.matches('.ant-btn-primary, .is-primary, .gaip-wealth-primary, .gaip-activity-modal__button--primary, .btnConfirm___j71RF, .btnConvert___P7Srn, .btnClose___llxYq, .submitBtn___T1eTe');
        var secondary = button.matches('.ant-btn-default, .is-secondary, .gaip-wealth-secondary, .gaip-activity-modal__cancel, [data-owner-cancel], .btnCancel___BC6q2, .btnCancel___JnnA7, .cancelBtn___mjxUZ');
        if (!primary && !secondary) return;
        mark(button, 'gaip-modal__button');
        mark(button, primary ? 'gaip-modal__button--primary' : 'gaip-modal__button--secondary');
        mark(button.parentElement, 'gaip-modal__actions');
      });
    }
    var regions = adoptRegions(dialog);
    adoptInteriors(dialog);
    adoptFeedback(dialog);
    return { dialog: dialog, title: title, close: close, footer: footer, regions: regions };
  }

  function scanForms(root) {
    if (!root || root.nodeType !== 1) return;
    var candidates = Array.prototype.slice.call(root.querySelectorAll(formSelector));
    if (root.matches(formSelector)) candidates.push(root);
    var parent = root.closest(formSelector);
    if (parent && candidates.indexOf(parent) < 0) candidates.push(parent);
    candidates.forEach(function (dialog) {
      if (adoptSystemWarning(dialog)) return;
      if (dialog.matches('.gaip-modal, .agentModal___Nxp06') || dialog.closest('.ant-drawer')) return;
      var title = own(dialog, '.ant-modal-title')[0];
      if (dialog.matches(localFormSelector) || dialog.classList.contains('gaip-modal-form') ||
          (title && legacyFormTitles.test(title.textContent.trim()))) adoptForm(dialog);
    });
  }

  // 32 is a post-event system warning, not a cancellable decision. Reuse shared
  // visual primitives without normalizing/replacing React's warning DOM/handlers.
  function adoptSystemWarning(dialog) {
    var title = own(dialog, '.ant-modal-confirm-title')[0];
    if (!title || title.textContent.trim() !== '检测到账号已切换' || dialog.closest('.ant-drawer')) return null;
    var content = own(dialog, '.ant-modal-confirm-content')[0];
    var footer = own(dialog, '.ant-modal-confirm-btns')[0];
    var button = footer && footer.querySelector('button.ant-btn-primary');
    if (!content || !button) return null;
    // This path runs inside the class observer. Even adding an existing token
    // emits an attribute mutation, so use guarded marks to let the loop settle.
    mark(dialog, 'gaip-modal');
    mark(dialog, 'gaip-modal--system-warning');
    mark(title, 'gaip-modal__title');
    mark(content, 'gaip-modal-confirm__message');
    mark(footer, 'gaip-modal__footer');
    mark(button, 'gaip-modal__button');
    mark(button, 'gaip-modal__button--primary');
    return { dialog: dialog, title: title, body: content, footer: footer, confirm: button };
  }

  function startForms() {
    scanForms(document.documentElement);
    new MutationObserver(function (records) {
      var roots = new Set();
      records.forEach(function (record) {
        var target = record.target.nodeType === 1 ? record.target : record.target.parentElement;
        var dialog = target && target.closest(formSelector);
        if (dialog) roots.add(dialog);
        Array.prototype.forEach.call(record.addedNodes, function (node) { if (node.nodeType === 1) roots.add(node); });
      });
      roots.forEach(scanForms);
    // React may replace className while updating validation; idempotent marks
    // reattach the adapter without observing values or changing business state.
    }).observe(document.documentElement, { childList: true, characterData: true, attributes: true, attributeFilter: ['class', 'data-gaip-modal-part', 'data-gaip-form-field'], subtree: true });
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
    dialog.dataset.gaipModalComponent = 'v1.2.0';
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

    var regions = adoptRegions(dialog);
    adoptInteriors(dialog);
    return { dialog: dialog, title: title, close: close, body: body, footer: footer, cancel: cancel, confirm: confirm, regions: regions };
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
    adoptInteriors(dialog);
    return parts;
  }

  // New callers supply content/state, not a second copy of the confirmation shell.
  // Mounting, showModal() and business lifecycle remain the caller's responsibility.
  function createConfirm(options) {
    var dialog = document.createElement('dialog');
    dialog.className = 'ant-modal css-10wz6x1';
    dialog.setAttribute('role', 'alertdialog');
    dialog.innerHTML = '<div class="ant-modal-content"><div class="ant-modal-header"><div class="ant-modal-title"></div></div><div class="ant-modal-body"></div><div class="ant-modal-footer"><button type="button" class="ant-btn ant-btn-default" data-modal-cancel><span></span></button><button type="button" class="ant-btn ant-btn-primary" data-modal-confirm><span></span></button></div></div>';
    return setConfirmState(dialog, options);
  }

  window.__GAIP_MODAL_COMPONENT__ = {
    createConfirm: createConfirm,
    adoptSystemWarning: adoptSystemWarning,
    version: '1.2.0',
    adoptClose: adoptClose,
    adoptForm: adoptForm,
    createFieldFeedback: createFieldFeedback,
    getRegions: getRegions,
    adoptRegions: adoptRegions,
    adoptInteriors: adoptInteriors,
    scanForms: scanForms,
    adopt: adopt,
    setConfirmState: setConfirmState
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startForms, { once: true });
  else startForms();
})();
