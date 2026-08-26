(function () {
  'use strict';

  var rafId = 0;

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
    if (rafId) return;
    rafId = requestAnimationFrame(function () {
      rafId = 0;
      syncCustomerPolicyTags();
    });
  }

  window.__GAIP_SYNC_CUSTOMER_POLICY_TAGS__ = syncCustomerPolicyTags;

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
