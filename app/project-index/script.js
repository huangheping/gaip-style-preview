(function () {
  'use strict';
  var input = document.getElementById('channel-search');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-channel-card]'));
  var count = document.querySelector('[data-result-count]');
  var empty = document.querySelector('[data-empty]');
  if (!input || !count || !empty) return;
  function filter() {
    var query = input.value.trim().toLocaleLowerCase();
    var visible = 0;
    cards.forEach(function (card) {
      card.hidden = card.getAttribute('data-search').toLocaleLowerCase().indexOf(query) === -1;
      if (!card.hidden) visible++;
    });
    count.textContent = query ? '找到 ' + visible + ' 个频道' : '共 ' + visible + ' 个频道';
    empty.hidden = visible !== 0;
  }
  input.addEventListener('input', filter);
  input.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') { input.value = ''; filter(); }
  });
  filter();
}());
