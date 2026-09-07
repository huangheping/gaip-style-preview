(function (global) {
  'use strict';

  if (global.__GAIP_MODAL_REGISTRY__) return;

  var definitions = new Map();
  var origins = new Map();

  function clone(value) {
    if (value == null) return value;
    return JSON.parse(JSON.stringify(value));
  }

  function assertDefinition(definition) {
    if (!definition || typeof definition !== 'object') throw new TypeError('弹窗登记必须是对象');
    ['id', 'title', 'channel', 'type', 'status'].forEach(function (key) {
      if (typeof definition[key] !== 'string' || !definition[key].trim()) throw new TypeError('弹窗登记缺少字段：' + key);
    });
    if (!/^[a-z0-9][a-z0-9-]*$/.test(definition.id)) throw new TypeError('弹窗 id 只能使用小写字母、数字和连字符：' + definition.id);
    if (!['modal', 'confirm', 'drawer', 'popover'].includes(definition.type)) throw new TypeError('未知弹层类型：' + definition.type);
    if (!['ready', 'pending', 'excluded'].includes(definition.status)) throw new TypeError('未知弹窗状态：' + definition.status);
    if (definition.status === 'ready' && definition.type !== 'drawer' && !['information', 'form', 'confirmation'].includes(definition.category)) {
      throw new TypeError('可预览弹窗必须登记用途分类：' + definition.id);
    }
  }

  function orderedList() {
    var list = Array.from(definitions.values()).map(clone);
    list.filter(function (entry) { return entry.after; }).forEach(function (entry) {
      var currentIndex = list.findIndex(function (candidate) { return candidate.id === entry.id; });
      var targetIndex = list.findIndex(function (candidate) { return candidate.id === entry.after; });
      if (currentIndex < 0 || targetIndex < 0 || currentIndex === targetIndex + 1) return;
      list.splice(currentIndex, 1);
      targetIndex = list.findIndex(function (candidate) { return candidate.id === entry.after; });
      list.splice(targetIndex + 1, 0, entry);
    });
    return list;
  }

  function publish() {
    var list = orderedList();
    global.__GAIP_MODAL_SOURCE_CATALOG__ = {
      list: list,
      ready: list.filter(function (entry) { return entry.status === 'ready' && entry.type !== 'drawer'; }),
      pending: list.filter(function (entry) { return entry.status === 'pending' && entry.type !== 'drawer'; }),
      excluded: list.filter(function (entry) { return entry.status === 'excluded'; }),
      excludedDrawers: list.filter(function (entry) { return entry.status === 'excluded' && entry.type === 'drawer'; }),
      excludedOther: list.filter(function (entry) { return entry.status === 'excluded' && entry.type !== 'drawer'; })
    };
    if (typeof global.dispatchEvent === 'function' && typeof global.CustomEvent === 'function') {
      global.dispatchEvent(new CustomEvent('gaip:modal-catalog-updated', { detail: global.__GAIP_MODAL_SOURCE_CATALOG__ }));
    }
  }

  function register(definition, options) {
    assertDefinition(definition);
    var id = definition.id;
    var origin = options && options.origin ? options.origin : 'runtime';
    if (definitions.has(id)) {
      var previous = JSON.stringify(definitions.get(id));
      var next = JSON.stringify(definition);
      if (previous !== next) throw new Error('弹窗 id 重复登记：' + id + '（' + origins.get(id) + ' / ' + origin + '）');
      return clone(definitions.get(id));
    }
    definitions.set(id, clone(definition));
    origins.set(id, origin);
    publish();
    return clone(definition);
  }

  function registerMany(items, options) {
    if (!Array.isArray(items)) throw new TypeError('registerMany() 需要数组');
    items.forEach(function (item) { register(item, options); });
    return orderedList();
  }

  function resolve(path) {
    var normalized = String(path || '').replace(/^window\./, '');
    return normalized.split('.').reduce(function (value, key) {
      return value == null ? undefined : value[key];
    }, global);
  }

  function invoke(entry) {
    if (!entry.invoke || !entry.invoke.path) throw new Error('未登记真实打开入口：' + entry.id);
    var path = entry.invoke.path;
    var parts = String(path).replace(/^window\./, '').split('.');
    var method = parts.pop();
    var owner = resolve(parts.join('.'));
    if (!owner || typeof owner[method] !== 'function') throw new Error('真实打开入口不存在：' + path);
    return owner[method].apply(owner, clone(entry.invoke.args || []));
  }

  function mountResult(entry, result) {
    if (!entry.resultMode) return result;
    if (!result || typeof result !== 'object' || typeof result.nodeType !== 'number') throw new Error('真实源入口没有返回弹窗节点：' + entry.id);
    result.hidden = false;
    document.body.appendChild(result);
    if (entry.resultMode === 'append-open-class') {
      requestAnimationFrame(function () { result.classList.add(entry.openClass || 'is-open'); });
    }
    return result;
  }

  function open(idOrEntry) {
    var entry = typeof idOrEntry === 'string' ? definitions.get(idOrEntry) : idOrEntry;
    if (!entry) throw new Error('未登记弹窗：' + idOrEntry);
    if (entry.status !== 'ready' || entry.type === 'drawer') throw new Error('该项目不是可预览弹窗：' + entry.id);
    if (entry.previewMode === 'route-trigger') throw new Error('正式页面触发项应由路由桥接器打开：' + entry.id);
    return mountResult(entry, invoke(entry));
  }

  global.__GAIP_MODAL_REGISTRY__ = {
    register: register,
    registerMany: registerMany,
    get: function (id) { return definitions.has(id) ? clone(definitions.get(id)) : null; },
    list: orderedList,
    open: open,
    refresh: publish
  };
  publish();
}(window));
