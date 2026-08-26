(function () {
  'use strict';

  var instances = new WeakMap();
  var nextId = 0;

  function normalizeOptions(options) {
    return (Array.isArray(options) ? options : []).map(function (option, index) {
      if (typeof option === 'string') return { value: option, label: option };
      return {
        value: String(option && option.value != null ? option.value : index),
        label: String(option && option.label != null ? option.label : option && option.value != null ? option.value : index)
      };
    });
  }

  function create(root, config) {
    if (!root || instances.has(root)) return instances.get(root) || null;

    var options = normalizeOptions(config && config.options);
    var selected = new Set((config && Array.isArray(config.value) ? config.value : []).map(String));
    var maxVisible = Math.max(0, Number(config && config.maxVisible) || 2);
    var placeholder = String(config && config.placeholder || '请选择');
    var id = 'gaip-multi-select-' + (++nextId);

    root.classList.add('gaipMultiSelect');
    root.setAttribute('data-gaip-multi-select-ready', 'true');
    root.innerHTML =
      '<div class="gaipMultiSelect__control" role="combobox" tabindex="0" aria-haspopup="listbox" aria-expanded="false" aria-controls="' + id + '">' +
        '<div class="gaipMultiSelect__selection"></div>' +
        '<button class="gaipMultiSelect__clear" type="button" aria-label="清空已选项">×</button>' +
        '<span class="gaipMultiSelect__arrow" aria-hidden="true"></span>' +
      '</div>' +
      '<div class="gaipMultiSelect__dropdown" id="' + id + '" role="listbox" aria-multiselectable="true"></div>';

    var control = root.querySelector('.gaipMultiSelect__control');
    var selection = root.querySelector('.gaipMultiSelect__selection');
    var dropdown = root.querySelector('.gaipMultiSelect__dropdown');
    var clearButton = root.querySelector('.gaipMultiSelect__clear');

    function selectedOptions() {
      return options.filter(function (option) { return selected.has(option.value); });
    }

    function renderSelection() {
      var current = selectedOptions();
      root.classList.toggle('hasValue', current.length > 0);

      if (!current.length) {
        selection.innerHTML = '<span class="gaipMultiSelect__placeholder"></span>';
        selection.firstElementChild.textContent = placeholder;
        return;
      }

      selection.innerHTML = '';
      current.slice(0, maxVisible).forEach(function (option) {
        var tag = document.createElement('span');
        tag.className = 'gaipMultiSelect__tag';
        tag.title = option.label;
        tag.textContent = option.label;
        selection.appendChild(tag);
      });

      if (current.length > maxVisible) {
        var overflow = document.createElement('span');
        overflow.className = 'gaipMultiSelect__overflow';
        overflow.textContent = '+ ' + (current.length - maxVisible) + ' ...';
        overflow.setAttribute('aria-label', '另外 ' + (current.length - maxVisible) + ' 项已选择');
        selection.appendChild(overflow);
      }
    }

    function renderOptions() {
      dropdown.innerHTML = '';
      options.forEach(function (option) {
        var item = document.createElement('button');
        item.type = 'button';
        item.className = 'gaipMultiSelect__option';
        item.setAttribute('role', 'option');
        item.setAttribute('data-value', option.value);
        item.setAttribute('aria-selected', selected.has(option.value) ? 'true' : 'false');
        item.innerHTML = '<span class="gaipMultiSelect__checkbox" aria-hidden="true"></span><span></span>';
        item.lastElementChild.textContent = option.label;
        dropdown.appendChild(item);
      });
    }

    function notify() {
      root.dispatchEvent(new CustomEvent('gaip:multi-select-change', {
        bubbles: true,
        detail: { value: Array.from(selected) }
      }));
      if (config && typeof config.onChange === 'function') config.onChange(Array.from(selected));
    }

    function setOpen(open) {
      root.classList.toggle('isOpen', !!open);
      control.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    function toggleValue(value) {
      if (selected.has(value)) selected.delete(value);
      else selected.add(value);
      renderSelection();
      renderOptions();
      notify();
    }

    function onDocumentClick(event) {
      if (!root.contains(event.target)) setOpen(false);
    }

    control.addEventListener('click', function (event) {
      if (event.target.closest('.gaipMultiSelect__clear')) return;
      setOpen(!root.classList.contains('isOpen'));
    });

    control.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setOpen(!root.classList.contains('isOpen'));
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        setOpen(true);
        var first = dropdown.querySelector('.gaipMultiSelect__option');
        if (first) first.focus();
      } else if (event.key === 'Escape') {
        setOpen(false);
      }
    });

    dropdown.addEventListener('click', function (event) {
      var item = event.target.closest('.gaipMultiSelect__option');
      if (item) toggleValue(item.getAttribute('data-value'));
    });

    dropdown.addEventListener('keydown', function (event) {
      var item = event.target.closest('.gaipMultiSelect__option');
      if (!item) return;
      var items = Array.prototype.slice.call(dropdown.querySelectorAll('.gaipMultiSelect__option'));
      var index = items.indexOf(item);
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        items[(index + 1) % items.length].focus();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        items[(index - 1 + items.length) % items.length].focus();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        control.focus();
      }
    });

    clearButton.addEventListener('click', function (event) {
      event.stopPropagation();
      selected.clear();
      renderSelection();
      renderOptions();
      notify();
      control.focus();
    });

    document.addEventListener('click', onDocumentClick);
    renderSelection();
    renderOptions();

    var api = {
      getValue: function () { return Array.from(selected); },
      setValue: function (value) {
        selected = new Set((Array.isArray(value) ? value : []).map(String));
        renderSelection();
        renderOptions();
      },
      open: function () { setOpen(true); },
      close: function () { setOpen(false); },
      destroy: function () {
        document.removeEventListener('click', onDocumentClick);
        instances.delete(root);
        root.innerHTML = '';
        root.classList.remove('gaipMultiSelect', 'hasValue', 'isOpen');
        root.removeAttribute('data-gaip-multi-select-ready');
      }
    };

    instances.set(root, api);
    return api;
  }

  window.__GAIP_MULTI_SELECT__ = {
    mount: create,
    get: function (root) { return instances.get(root) || null; }
  };
}());
