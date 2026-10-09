(function () {
  'use strict';
  // Catalogue-only local selection. No business save, request, storage or progress simulation.
  function mount(root, fileMarkup) {
    if (!root || root.__uploadPreview) return;
    root.__uploadPreview = true;
    var cleanup = [];
    root.querySelectorAll('[data-upload-case]').forEach(function (card) {
      var spec = window.__GAIP_UPLOAD_CASES__.find(function (item) { return item.id === card.dataset.uploadCase; });
      var input = card.querySelector('[data-upload-input]'), trigger = card.querySelector('[data-upload-choose]');
      var list = card.querySelector('[data-upload-files]'), error = card.querySelector('[data-upload-error]');
      var visual = card.querySelector('[data-upload-visual]'), emptyVisual = visual && Array.from(visual.childNodes).map(function (node) { return node.cloneNode(true); });
      var selected = [];
      function release(item) { if (item.url) URL.revokeObjectURL(item.url); }
      function render() {
        list.replaceChildren();
        if (visual) visual.replaceChildren.apply(visual, emptyVisual.map(function (node) { return node.cloneNode(true); }));
        selected.forEach(function (item, index) {
          var holder = document.createElement('template'); holder.innerHTML = fileMarkup();
          var row = holder.content.firstElementChild;
          row.querySelector('[data-upload-name]').textContent = item.file.name;
          if (item.url) {
            var image = row.querySelector('img'); image.src = item.url; image.hidden = false;
            if (visual) visual.replaceChildren(image.cloneNode(true));
          }
          row.querySelector('[data-upload-remove]').addEventListener('click', function () {
            release(selected.splice(index, 1)[0]); error.hidden = true; render(); trigger.focus();
          });
          list.appendChild(row);
        });
        card.classList.toggle('has-files', !!selected.length);
      }
      function select(files) {
        var pending = Array.from(files || []);
        if (!pending.length) return;
        var message = '';
        if (!spec.multiple && pending.length > 1) message = '一次只能选择一个文件。';
        if (spec.maxCount && selected.length + pending.length > spec.maxCount) message = '最多选择 '+spec.maxCount+' 张图片。';
        pending.forEach(function (file) {
          var ext = '.' + file.name.split('.').pop().toLowerCase();
          if (!spec.accept.split(',').includes(ext)) message = '文件格式不支持：'+file.name;
          else if (spec.maxMB && file.size > spec.maxMB * 1024 * 1024) message = '文件大小超过限制：'+file.name;
          else if (spec.type === 'image' && file.type && !/^image\/(jpeg|png|webp)$/.test(file.type)) message = '请选择有效的图片文件。';
        });
        error.textContent = message; error.hidden = !message;
        if (message) return;
        if (!spec.multiple) { selected.forEach(release); selected = []; }
        pending.forEach(function (file) {
          selected.push({file:file,url:spec.type==='image' && typeof URL.createObjectURL==='function' ? URL.createObjectURL(file) : null});
        });
        render();
      }
      trigger.addEventListener('click', function (event) { if (event.target !== input) { event.preventDefault(); input.click(); } });
      trigger.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); input.click(); }
      });
      input.addEventListener('change', function () { select(input.files); input.value = ''; });
      card.querySelector('.uploadControl').addEventListener('dragover', function (event) { event.preventDefault(); card.classList.add('is-dragging'); });
      card.querySelector('.uploadControl').addEventListener('dragleave', function () { card.classList.remove('is-dragging'); });
      card.querySelector('.uploadControl').addEventListener('drop', function (event) { event.preventDefault(); card.classList.remove('is-dragging'); select(event.dataTransfer && event.dataTransfer.files); });
      cleanup.push(function () { selected.forEach(release); selected = []; render(); });
    });
    window.addEventListener('pagehide', function () { cleanup.forEach(function (fn) { fn(); }); });
  }
  window.__GAIP_UPLOAD_PREVIEW__ = {mount:mount};
}());
