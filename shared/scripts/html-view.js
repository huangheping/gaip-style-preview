(function () {
  'use strict';
  if (window.__GAIP_HTML_VIEW__) return;
  var templates = Object.create(null);
  function nodeView(node, runtime, bindings) {
    if (Object.prototype.hasOwnProperty.call(node, 'text')) return node.text;
    if (node.slot) return bindings[node.slot]();
    var factory = runtime[node.kind];
    var type = node.component ? bindings[node.component]() : node.tag;
    var props = Object.assign({}, node.props, node.propsBinding ? bindings[node.propsBinding]() : {});
    if (node.childrenType) {
      var children = node.children.map(function (child) { return nodeView(child, runtime, bindings); });
      props.children = node.childrenType === 'array' ? children : children[0];
    }
    return node.key ? factory(type, props, bindings[node.key]()) : factory(type, props);
  }
  window.__GAIP_HTML_VIEW__ = {
    register: function (values) {
      Object.keys(values).forEach(function (key) {
        if (templates[key]) throw new Error('Duplicate HTML view: ' + key);
        templates[key] = values[key];
      });
    },
    render: function (key, runtime, bindings) {
      if (!templates[key]) throw new Error('Missing HTML view: ' + key);
      return nodeView(templates[key], runtime, bindings);
    }
  };
}());
