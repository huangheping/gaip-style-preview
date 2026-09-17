(function () {
  'use strict';
  if (window.__GAIP_CAROUSEL_CONTROLS__) return;
  var instances = new WeakMap();
  function mount(host, options) {
    if (instances.has(host)) return instances.get(host);
    var o = options || {}, state = {count: 0, index: 0}, destroyed = false;
    var arrowHost = o.arrowHost || host, dotHost = o.dotHost || host;
    host.classList.add('gaip-carousel-controls');
    function arrow(direction, label) {
      var b = document.createElement('button'); b.type = 'button';
      b.className = 'gaip-carousel-arrow gaip-carousel-arrow--' + direction;
      b.setAttribute('aria-label', label); b.dataset.carouselControl = direction;
      b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + (direction === 'previous' ? 'M15 18 9 12l6-6' : 'm9 18 6-6-6-6') + '"/></svg>';
      arrowHost.appendChild(b); return b;
    }
    var previous = arrow('previous', o.previousLabel || '上一组'), next = arrow('next', o.nextLabel || '下一组');
    var dots = null;
    if (!o.externalDots) {
      dots = document.createElement('nav'); dots.className = 'gaip-carousel-dots';
      dots.setAttribute('aria-label', o.label || '内容切换'); dotHost.appendChild(dots);
    }
    function navigate(index) {
      if (destroyed) return;
      if (o.getState) update(o.getState());
      if (state.count < 2) return;
      index = o.loop === false ? Math.max(0, Math.min(state.count - 1, index)) : (index + state.count) % state.count;
      if (index !== state.index && o.onChange) o.onChange(index);
    }
    function onPrevious(e) { e.preventDefault(); e.stopPropagation(); if (o.getState) update(o.getState()); navigate(state.index - 1); }
    function onNext(e) { e.preventDefault(); e.stopPropagation(); if (o.getState) update(o.getState()); navigate(state.index + 1); }
    function onDot(e) {
      var b = e.target.closest('[data-carousel-index]'); if (!b || !dots.contains(b)) return;
      e.preventDefault(); e.stopPropagation(); navigate(Number(b.dataset.carouselIndex));
    }
    previous.addEventListener('click', onPrevious); next.addEventListener('click', onNext);
    if (dots) dots.addEventListener('click', onDot);
    function update(value) {
      if (destroyed) return;
      state.count = Math.max(0, Math.floor(Number(value.count) || 0));
      state.index = Math.max(0, Math.min(state.count - 1, Number(value.index) || 0));
      previous.hidden = next.hidden = state.count < 2;
      previous.disabled = o.loop === false && state.index === 0;
      next.disabled = o.loop === false && state.index >= state.count - 1;
      if (!dots) return;
      dots.hidden = state.count < 2;
      if (dots.children.length !== state.count) {
        dots.replaceChildren();
        for (var i = 0; i < state.count; i++) {
          var b = document.createElement('button'); b.type = 'button'; b.className = 'gaip-carousel-dot';
          b.dataset.carouselIndex = i; b.dataset.carouselControl = 'dot-' + i;
          b.setAttribute('aria-label', '切换到第 ' + (i + 1) + ' 组'); dots.appendChild(b);
        }
      }
      Array.from(dots.children).forEach(function (b, i) { b.setAttribute('aria-current', i === state.index ? 'true' : 'false'); });
    }
    var api = {update: update, destroy: function () {
      if (destroyed) return; destroyed = true;
      previous.removeEventListener('click', onPrevious); next.removeEventListener('click', onNext);
      if (dots) { dots.removeEventListener('click', onDot); dots.remove(); }
      previous.remove(); next.remove(); host.classList.remove('gaip-carousel-controls'); instances.delete(host);
    }};
    instances.set(host, api); update(o.getState ? o.getState() : o);
    return api;
  }
  window.__GAIP_CAROUSEL_CONTROLS__ = {mount: mount};
})();
