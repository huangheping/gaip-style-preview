(function () {
  'use strict';

  var firstBanner = {
    src: './web/static/GA0119.c101ae4c.jpg',
    alt: '兑现之年 · 全球配置新程'
  };
  var secondBanner = {
    src: './web/static/GA0120.cfaa5328.jpg',
    alt: '全球视野 · 香港站'
  };
  var modal = null;
  var previouslyFocused = null;

  function bannerFor(image) {
    var src = image.getAttribute('src') || '';
    if (src.indexOf('US_ACT2') >= 0 || src.indexOf('GA0120') >= 0) return secondBanner;
    if (src.indexOf('US_ACT') >= 0 || src.indexOf('GA0119') >= 0) return firstBanner;
    return null;
  }

  function syncBanners(root) {
    var scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll('[class*="carouselItemWrapper___"] > img').forEach(function (image) {
      var banner = bannerFor(image);
      if (!banner) return;
      if (image.getAttribute('src') !== banner.src) image.setAttribute('src', banner.src);
      if (image.alt !== banner.alt) image.alt = banner.alt;
      image.dataset.gaipActivitySynced = 'true';
    });
  }

  function changeSlide(carousel, step) {
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.slick-dots li'));
    if (!dots.length) return;
    var current = dots.findIndex(function (dot) { return dot.classList.contains('slick-active'); });
    if (current < 0) current = 0;
    var target = (current + step + dots.length) % dots.length;
    var trigger = dots[target] && dots[target].querySelector('button');
    if (trigger) trigger.click();
  }

  function arrowMarkup(direction) {
    var isPrevious = direction === 'previous';
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'gaip-carousel-arrow gaip-carousel-arrow--' + direction;
    button.setAttribute('aria-label', isPrevious ? '上一张活动' : '下一张活动');
    button.innerHTML = isPrevious
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18 9 12l6-6"/></svg>'
      : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>';
    return button;
  }

  function injectCarouselControls(root) {
    var scope = root && root.querySelectorAll ? root : document;
    var carousels = [];
    if (scope.matches && scope.matches('[class*="carousel___"]')) carousels.push(scope);
    scope.querySelectorAll('[class*="carousel___"]').forEach(function (carousel) {
      carousels.push(carousel);
    });

    carousels.forEach(function (carousel) {
      if (carousel.dataset.gaipArrowControls === 'true' || !carousel.querySelector('.slick-dots')) return;
      var previous = arrowMarkup('previous');
      var next = arrowMarkup('next');
      previous.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        changeSlide(carousel, -1);
        if (event.detail > 0) previous.blur();
      });
      next.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        changeSlide(carousel, 1);
        if (event.detail > 0) next.blur();
      });
      carousel.appendChild(previous);
      carousel.appendChild(next);
      carousel.dataset.gaipArrowControls = 'true';
    });
  }

  function closeModal() {
    if (!modal) return;
    var closing = modal;
    modal = null;
    closing.classList.remove('is-open');
    window.setTimeout(function () {
      closing.remove();
    }, 180);
    document.body.style.removeProperty('overflow');
    if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
      previouslyFocused.focus();
    }
  }

  function toast(message) {
    var notice = document.createElement('div');
    notice.className = 'gaip-activity-toast';
    notice.setAttribute('role', 'status');
    notice.textContent = message;
    document.body.appendChild(notice);
    window.setTimeout(function () { notice.remove(); }, 1800);
  }

  function createSignupModal(activityName) {
    var overlay = document.createElement('div');
    overlay.className = 'gaip-activity-modal';
    overlay.innerHTML = [
      '<section class="gaip-activity-modal__panel" role="dialog" aria-modal="true" aria-labelledby="gaip-activity-modal-title">',
      '  <header class="gaip-activity-modal__header">',
      '    <button class="gaip-activity-modal__close" type="button" aria-label="关闭">×</button>',
      '    <h2 class="gaip-activity-modal__title" id="gaip-activity-modal-title">填写报名信息</h2>',
      '    <p class="gaip-activity-modal__subtitle">正在报名： <span></span></p>',
      '  </header>',
      '  <form class="gaip-activity-modal__form">',
      '    <div class="gaip-activity-modal__body">',
      '      <div class="gaip-activity-modal__form-grid">',
      '        <div class="gaip-activity-modal__field">',
      '          <label class="gaip-activity-modal__label" for="gaip-customer-name">客户姓名</label>',
      '          <input id="gaip-customer-name" name="customerName" type="text" maxlength="50" placeholder="请输入客户姓名" required>',
      '        </div>',
      '        <div class="gaip-activity-modal__field">',
      '          <label class="gaip-activity-modal__label" for="gaip-intention-business">意向业务</label>',
      '          <input id="gaip-intention-business" name="intentionBusiness" type="text" maxlength="100" placeholder="请输入意向业务" required>',
      '        </div>',
      '        <div class="gaip-activity-modal__field">',
      '          <label class="gaip-activity-modal__label" for="gaip-intention-premium">意向首保（万/美元）</label>',
      '          <input id="gaip-intention-premium" name="intentionPremium" type="number" min="0" max="999999999" placeholder="请输入意向首保（万/美元）" required>',
      '        </div>',
      '        <div class="gaip-activity-modal__field">',
      '          <label class="gaip-activity-modal__label" for="gaip-payment-term">交费年限</label>',
      '          <input id="gaip-payment-term" name="paymentTerm" type="text" maxlength="50" placeholder="请输入交费年限" required>',
      '        </div>',
      '        <div class="gaip-activity-modal__field gaip-activity-modal__field--full">',
      '          <span class="gaip-activity-modal__label">签约包是否提交</span>',
      '          <div class="gaip-activity-modal__radios">',
      '            <label class="gaip-activity-modal__radio"><input type="radio" name="packageSubmitted" value="yes" required> 是</label>',
      '            <label class="gaip-activity-modal__radio"><input type="radio" name="packageSubmitted" value="no"> 否</label>',
      '          </div>',
      '        </div>',
      '        <div class="gaip-activity-modal__field gaip-activity-modal__field--full">',
      '          <label class="gaip-activity-modal__label" for="gaip-remark">备注信息</label>',
      '          <textarea id="gaip-remark" name="remark" maxlength="500" placeholder="请输入" required></textarea>',
      '        </div>',
      '      </div>',
      '    </div>',
      '    <footer class="gaip-activity-modal__footer">',
      '      <button class="gaip-activity-modal__button gaip-activity-modal__cancel" type="button">取 消</button>',
      '      <button class="gaip-activity-modal__button gaip-activity-modal__button--primary" type="submit">提 交</button>',
      '    </footer>',
      '  </form>',
      '</section>'
    ].join('');

    overlay.querySelector('.gaip-activity-modal__subtitle span').textContent = activityName || firstBanner.alt;
    overlay.querySelector('.gaip-activity-modal__close').addEventListener('click', closeModal);
    overlay.querySelector('.gaip-activity-modal__cancel').addEventListener('click', closeModal);
    overlay.addEventListener('click', function (event) {
      if (event.target === overlay) closeModal();
    });
    overlay.querySelector('form').addEventListener('submit', function (event) {
      event.preventDefault();
      toast('模拟提交成功，未发送任何数据');
      closeModal();
    });

    return overlay;
  }

  function openModal(activityName) {
    if (modal) closeModal();
    previouslyFocused = document.activeElement;
    var overlay = createSignupModal(activityName);

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    modal = overlay;
    window.requestAnimationFrame(function () {
      overlay.classList.add('is-open');
      var firstInput = overlay.querySelector('input');
      if (firstInput) firstInput.focus();
    });
  }

  document.addEventListener('click', function (event) {
    var target = event.target;
    var button = target && target.closest ? target.closest('button[class*="signUp___"]') : null;
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
    var wrapper = button.closest('[class*="carouselItemWrapper___"]');
    var image = wrapper && wrapper.querySelector('img');
    openModal(image ? image.alt : firstBanner.alt);
  }, true);

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && modal) closeModal();
  });

  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      mutation.addedNodes.forEach(function (node) {
        if (node.nodeType !== 1) return;
        syncBanners(node);
        injectCarouselControls(node);
      });
    });
  });

  function start() {
    syncBanners(document);
    injectCarouselControls(document);
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }

  window.__GAIP_ACTIVITY_SYNC__ = {
    createSignupModal: createSignupModal
  };
})();
