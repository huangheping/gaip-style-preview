(function () {
  'use strict';

  var popupId = window.__GAIP_POPUP_PREVIEW__;
  if (!popupId) return;

  var timeout = 45000;
  var pollInterval = 120;

  function notifyParent(status, message) {
    if (window.parent === window) return;
    window.parent.postMessage({
      type: 'gaip-popup-preview',
      id: popupId,
      status: status,
      message: message || ''
    }, '*');
  }

  function normalize(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function visible(element) {
    if (!element || !element.isConnected) return false;
    var style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
    var rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function waitFor(test, label) {
    var startedAt = Date.now();
    return new Promise(function (resolve, reject) {
      function check() {
        var result;
        try { result = test(); } catch (_) { result = null; }
        if (result) {
          resolve(result);
          return;
        }
        if (Date.now() - startedAt >= timeout) {
          reject(new Error('未找到真实触发入口：' + label));
          return;
        }
        window.setTimeout(check, pollInterval);
      }
      check();
    });
  }

  function interactiveNode(element) {
    return element && (element.closest('button, a, [role="button"], [role="menuitem"], [tabindex], tr, li') || element);
  }

  function textNode(text, options) {
    options = options || {};
    var exact = options.exact !== false;
    var selector = options.selector || 'button, a, span, div, p, h1, h2, h3, h4, li';
    var candidates = Array.prototype.slice.call(document.querySelectorAll(selector)).filter(function (element) {
      if (!visible(element)) return false;
      var content = normalize(element.textContent);
      return exact ? content === text : content.indexOf(text) !== -1;
    });
    candidates.sort(function (left, right) {
      return normalize(left.textContent).length - normalize(right.textContent).length;
    });
    return candidates[options.index || 0] || null;
  }

  function selectorNode(selector, index, includeHidden) {
    var nodes = Array.prototype.slice.call(document.querySelectorAll(selector));
    if (!includeHidden) nodes = nodes.filter(visible);
    return nodes[index || 0] || null;
  }

  function clickNode(node) {
    node = interactiveNode(node);
    if (!node) return false;
    node.scrollIntoView({ block: 'center', inline: 'center' });
    node.click();
    return true;
  }

  function clickText(text, options) {
    return waitFor(function () {
      var node = textNode(text, options);
      return node && clickNode(node);
    }, text);
  }

  function clickSelector(selector, index) {
    return waitFor(function () {
      var node = selectorNode(selector, index);
      return node && clickNode(node);
    }, selector);
  }

  function clickExistingSelector(selector, index) {
    return waitFor(function () {
      var node = selectorNode(selector, index, true);
      return node && clickNode(node);
    }, selector);
  }

  function waitText(text, options) {
    return waitFor(function () { return textNode(text, options); }, text);
  }

  function pause(milliseconds) {
    return new Promise(function (resolve) { window.setTimeout(resolve, milliseconds); });
  }

  function selectFirstCustomer() {
    return clickSelector('[class*="customerList___"] [class*="customerCard___"] [class*="cName___"]');
  }

  function customerTab(label) {
    return clickText(label, { selector: '[role="tab"], .ant-tabs-tab, button, span' });
  }

  function popupSurface(title) {
    var selectors = [
      '.ant-modal-wrap',
      '.ant-popover',
      '.ant-modal-confirm',
      'dialog[open]',
      '[role="dialog"]',
      '[class*="modalWrapper___"].is-open',
      '[class*="expertModal___"]'
    ].join(',');
    var candidates = Array.prototype.slice.call(document.querySelectorAll(selectors)).filter(function (element) {
      return visible(element) && normalize(element.textContent).indexOf(title) !== -1;
    });
    candidates.sort(function (left, right) {
      var leftRect = left.getBoundingClientRect();
      var rightRect = right.getBoundingClientRect();
      return leftRect.width * leftRect.height - rightRect.width * rightRect.height;
    });
    return candidates[0] || null;
  }

  function prunePageBehindPopup(surface) {
    var style = document.getElementById('gaip-popup-preview-isolation-style');
    if (!style) {
      style = document.createElement('style');
      style.id = 'gaip-popup-preview-isolation-style';
      style.textContent =
        'html.gaip-popup-preview-isolated,html.gaip-popup-preview-isolated body{background:#f5f7f6!important;}' +
        '.gaip-popup-preview-foreground{z-index:2147483000!important;}' +
        '.ant-modal-root.gaip-popup-preview-foreground,.ant-drawer-root.gaip-popup-preview-foreground{position:relative!important;}';
      document.head.appendChild(style);
    }
    var foreground = surface.closest('.ant-modal-root, .ant-drawer-root, dialog[open]') || surface;
    var branch = foreground;
    while (branch.parentElement && branch.parentElement !== document.body) {
      var parent = branch.parentElement;
      Array.prototype.slice.call(parent.children).forEach(function (child) {
        if (child !== branch) child.remove();
      });
      branch = parent;
    }
    Array.prototype.slice.call(document.body.children).forEach(function (child) {
      if (child !== branch) child.remove();
    });
    foreground.classList.add('gaip-popup-preview-foreground');
    document.documentElement.classList.add('gaip-popup-preview-isolated');
    document.documentElement.setAttribute('data-gaip-popup-preview-pruned', popupId);
  }

  function markOpened(title) {
    return waitFor(function () { return popupSurface(title); }, title + '弹窗').then(function (surface) {
      prunePageBehindPopup(surface);
      document.documentElement.setAttribute('data-gaip-popup-preview-open', popupId);
      notifyParent('opened');
    });
  }

  var flows = {
    'agent-session-rename': async function () {
      await clickSelector('[class*="globalButton___"]');
      await clickExistingSelector('.agentModal___Nxp06 button[aria-label="更多操作"]');
      await clickText('修改名称');
      await markOpened('编辑对话名称');
    },
    'clues-create': async function () {
      await clickText('新增线索');
      await markOpened('新增线索');
    },
    'clues-assign': async function () {
      await clickText('分配', { selector: 'button, a, span' });
      await markOpened('分配线索');
    },
    'clues-detail': async function () {
      await clickText('详情', { selector: 'button, a, span' });
      await markOpened('基础信息');
    },
    'clues-terminal': async function () {
      await clickText('转化', { selector: 'button, a, span' });
      await markOpened('标记已转化');
    },
    'customer-intro': async function () {
      await selectFirstCustomer();
      await waitText('客户资料介绍');
      await clickText('编辑', { selector: 'button, a, span' });
      await markOpened('编辑-客户资料介绍');
    },
    'customer-meeting': async function () {
      await selectFirstCustomer();
      await customerTab('沟通纪要');
      await clickText('新增沟通纪要');
      await markOpened('沟通纪要');
    },
    'customer-meeting-delete': async function () {
      await selectFirstCustomer();
      await customerTab('沟通纪要');
      await clickText('删除', { selector: 'button, a, span' });
      await markOpened('确定要删除该沟通纪要吗？');
    },
    'customer-delete': async function () {
      await selectFirstCustomer();
      await clickText('删除客户');
      await markOpened('您确定要删除该客户信息吗？');
    },
    'customer-proposal-detail': async function () {
      await selectFirstCustomer();
      await waitText('历史方案', { exact: false });
      await clickText('查看详情', { selector: 'button, a, span' });
      await markOpened('方案详情预览');
    },
    'activity-record': async function () {
      await clickSelector('[class*="signUpContainer___"]');
      await markOpened('报名记录');
    },
    'product-detail': async function () {
      await clickSelector('[class*="productCard___"] [class*="moreAction___"]');
      await markOpened('产品详情');
    },
    'product-expert': async function () {
      await clickText('联系产品专家');
      await markOpened('业务线对接专家');
    },
    'induction-complete': async function () {
      var attempts;
      for (attempts = 0; attempts < 24; attempts += 1) {
        var nextButton = await waitFor(function () {
          return selectorNode('[class*="nextBtn___"]');
        }, '入职引导下一步');
        var label = normalize(nextButton.textContent).replace(/\s/g, '');
        clickNode(nextButton);
        if (label === '完成') {
          await markOpened('您已完成所有入职引导');
          return;
        }
        // Ant 按钮会在进度请求完成后才更新。并发预览时必须给 React
        // 足够时间提交下一节，避免重复点击同一个“下一步”节点。
        await pause(650);
      }
      throw new Error('入职引导未能推进到完成步骤');
    },
    'account-switch': async function () {
      await waitText('本地预览用户');
      var storage = window.__GAIP_LOCAL_STORAGE__ || window.localStorage;
      var original = storage.getItem('userInfo');
      var current = {};
      try { current = JSON.parse(original || '{}'); } catch (_) {}
      current.domainAccount = 'gaip_popup_preview_account';
      var changed = JSON.stringify(current);
      storage.setItem('userInfo', changed);
      window.dispatchEvent(new StorageEvent('storage', { key: 'userInfo', oldValue: original, newValue: changed }));
      await pause(100);
      if (original == null) storage.removeItem('userInfo');
      else storage.setItem('userInfo', original);
      await markOpened('检测到账号已切换');
    }
  };

  var flow = flows[popupId];
  if (!flow) return;
  notifyParent('loading');
  Promise.resolve().then(flow).catch(function (error) {
    document.documentElement.setAttribute('data-gaip-popup-preview-error', popupId);
    notifyParent('error', error && error.message ? error.message : '真实入口触发失败');
    console.error('[GAIP popup preview]', popupId, error);
  });
}());
