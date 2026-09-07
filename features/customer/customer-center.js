(function () {
  'use strict';

  var rafId = 0;
  var confirmationSequence = 0;

  function hasClassPart(element, part) {
    return element && typeof element.className === 'string' && element.className.indexOf(part) !== -1;
  }

  function closestByClassPart(element, part) {
    var current = element;
    while (current && current !== document.documentElement) {
      if (hasClassPart(current, part)) return current;
      current = current.parentElement;
    }
    return null;
  }

  function findClassPart(element, part) {
    var classes = String(element && element.className || '').split(/\s+/);
    for (var index = 0; index < classes.length; index += 1) {
      if (classes[index].indexOf(part) !== -1) return classes[index];
    }
    return '';
  }

  function normalizePolicyTag(tag, tagRow) {
    var siblingTag = tagRow.querySelector('[class*="cTag"]');
    var cTagClass = siblingTag && findClassPart(siblingTag, 'cTag');

    if (cTagClass && tag.className.indexOf(cTagClass) === -1) {
      tag.className = cTagClass;
    }

    tag.removeAttribute('style');
    tag.setAttribute('data-gaip-customer-policy-tag', 'true');
  }

  function finishConfirmationProxy(root, nativePopover, nativeButton) {
    if (root.dataset.gaipClosing === 'true') return;
    root.dataset.gaipClosing = 'true';
    nativeButton.click();
    root.remove();
    window.setTimeout(function () {
      if (!nativePopover.isConnected) return;
      nativePopover.style.visibility = '';
      nativePopover.removeAttribute('aria-hidden');
    }, 400);
  }

  function createMeetingDeleteProxy(nativePopover) {
    var component = window.__GAIP_MODAL_COMPONENT__;
    var nativeCancel = nativePopover.querySelector('.ant-popconfirm-buttons .ant-btn-default');
    var nativeConfirm = nativePopover.querySelector('.ant-popconfirm-buttons .ant-btn-primary');
    var root;
    var dialog;
    var cancel;
    var confirm;
    var close;
    if (!component || !nativeCancel || !nativeConfirm || nativePopover.dataset.gaipConfirmAdapted) return;
    nativePopover.dataset.gaipConfirmAdapted = 'meeting-delete';
    nativePopover.style.visibility = 'hidden';
    nativePopover.setAttribute('aria-hidden', 'true');
    confirmationSequence += 1;
    root = document.createElement('div');
    root.className = 'ant-modal-root css-10wz6x1 css-var-r0 ant-modal-css-var';
    root.dataset.gaipCustomerConfirmProxy = String(confirmationSequence);
    root.innerHTML = '<div class="ant-modal-mask" style="z-index:2100"></div><div class="ant-modal-wrap ant-modal-centered" style="z-index:2100"><div class="ant-modal css-10wz6x1 css-var-r0 ant-modal-css-var" role="alertdialog" aria-modal="true"><div class="ant-modal-content"><button type="button" class="ant-modal-close" data-customer-confirm-close><span class="ant-modal-close-x"></span></button><div class="ant-modal-header"><div class="ant-modal-title">删除沟通纪要</div></div><div class="ant-modal-body"></div><div class="ant-modal-footer"><button type="button" class="ant-btn ant-btn-default" data-modal-cancel><span>取消</span></button><button type="button" class="ant-btn ant-btn-primary" data-modal-confirm><span>删除</span></button></div></div></div></div>';
    document.body.appendChild(root);
    dialog = root.querySelector('.ant-modal');
    component.setConfirmState(dialog, {
      type: 'confirm',
      tone: 'danger',
      title: '删除沟通纪要',
      message: '确定要删除该沟通纪要吗？',
      cancelLabel: '取消',
      confirmLabel: '删除'
    });
    cancel = root.querySelector('[data-modal-cancel]');
    confirm = root.querySelector('[data-modal-confirm]');
    close = root.querySelector('[data-customer-confirm-close]');
    cancel.addEventListener('click', function () { finishConfirmationProxy(root, nativePopover, nativeCancel); });
    close.addEventListener('click', function () { finishConfirmationProxy(root, nativePopover, nativeCancel); });
    confirm.addEventListener('click', function () { finishConfirmationProxy(root, nativePopover, nativeConfirm); });
    root.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') { event.preventDefault(); finishConfirmationProxy(root, nativePopover, nativeCancel); }
    });
    cancel.focus();
  }

  function applyCustomerDeleteState(dialog, component) {
    var modalRoot = dialog.closest('.ant-modal-root');
    var mask = modalRoot && modalRoot.querySelector('.ant-modal-mask');
    var parts;
    dialog.classList.remove('ant-modal-confirm', 'ant-modal-confirm-confirm');
    Array.prototype.slice.call(dialog.classList).forEach(function (className) {
      if (className.indexOf('ant-zoom-') === 0) dialog.classList.remove(className);
    });
    dialog.style.opacity = '1';
    dialog.style.transform = 'none';
    if (mask) {
      Array.prototype.slice.call(mask.classList).forEach(function (className) {
        if (className.indexOf('ant-fade-') === 0) mask.classList.remove(className);
      });
      mask.style.opacity = '1';
    }
    parts = component.setConfirmState(dialog, {
      type: 'confirm',
      tone: 'danger',
      title: '删除客户',
      message: '您确定要删除该客户信息吗？',
      cancelLabel: '取消',
      confirmLabel: '删除'
    });
    if (!parts.close.dataset.gaipCustomerCloseBound) {
      parts.close.dataset.gaipCustomerCloseBound = 'true';
      parts.close.addEventListener('click', function () { parts.cancel.click(); });
    }
  }

  function adaptCustomerDeleteModal(dialog) {
    var component = window.__GAIP_MODAL_COMPONENT__;
    if (!component || dialog.dataset.gaipConfirmAdapted) return;
    dialog.dataset.gaipConfirmAdapted = 'customer-delete';
    applyCustomerDeleteState(dialog, component);
    window.setTimeout(function () {
      if (dialog.isConnected) applyCustomerDeleteState(dialog, component);
    }, 350);
  }

  function queueCustomerDeleteModal(dialog) {
    if (dialog.dataset.gaipConfirmAdapted || dialog.dataset.gaipConfirmPending) return;
    dialog.dataset.gaipConfirmPending = 'true';
    window.requestAnimationFrame(function () {
      window.setTimeout(function () {
        if (!dialog.isConnected) return;
        delete dialog.dataset.gaipConfirmPending;
        adaptCustomerDeleteModal(dialog);
      }, 0);
    });
  }

  function syncCustomerConfirmations() {
    Array.prototype.slice.call(document.querySelectorAll('.ant-popconfirm')).forEach(function (popover) {
      if ((popover.textContent || '').indexOf('确定要删除该沟通纪要吗？') !== -1) createMeetingDeleteProxy(popover);
    });
    Array.prototype.slice.call(document.querySelectorAll('.ant-modal-confirm')).forEach(function (dialog) {
      if ((dialog.textContent || '').indexOf('您确定要删除该客户信息吗？') !== -1) queueCustomerDeleteModal(dialog);
    });
  }

  function syncCustomerPolicyTags() {
    var tags = Array.prototype.slice.call(document.querySelectorAll('span'));

    tags.forEach(function (tag) {
      var card;
      var tagRow;

      if ((tag.textContent || '').trim() !== '已关联保单') return;
      card = closestByClassPart(tag, 'customerCard');
      if (!card) return;
      tagRow = card.querySelector('[class*="cTags"]');
      if (!tagRow) return;

      normalizePolicyTag(tag, tagRow);

      if (tag.parentElement !== tagRow) {
        tagRow.appendChild(tag);
      }
    });
  }

  function scheduleSync() {
    syncCustomerPolicyTags();
    syncCustomerConfirmations();
    if (rafId) return;
    rafId = requestAnimationFrame(function () {
      rafId = 0;
      syncCustomerPolicyTags();
      syncCustomerConfirmations();
    });
  }

  window.__GAIP_SYNC_CUSTOMER_POLICY_TAGS__ = syncCustomerPolicyTags;
  window.__GAIP_SYNC_CUSTOMER_CONFIRMATIONS__ = syncCustomerConfirmations;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleSync, { once: true });
  } else {
    scheduleSync();
  }

  window.addEventListener('hashchange', scheduleSync);
  new MutationObserver(scheduleSync).observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
