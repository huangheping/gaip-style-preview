'use strict';
// Development-only source audit. Runtime calculations require an exact reviewed entry.
const { parse } = require('acorn');
function property(node) {
  return node && node.type === 'MemberExpression' ? (node.computed ? constant(node.property) : node.property.name) : null;
}
function constant(node) {
  if (!node) return null;
  if (node.type === 'Literal') return node.value;
  if (node.type === 'BinaryExpression' && node.operator === '+') {
    const a = constant(node.left), b = constant(node.right);
    return a !== null && b !== null ? a + b : null;
  }
  if (node.type === 'TemplateLiteral' && !node.expressions.length) return node.quasis[0].value.cooked;
  return null;
}
function isStyle(node) { return property(node) === 'style'; }
function auditSource(source) {
  const ast = parse(source, { ecmaVersion: 'latest', sourceType: 'module', locations: true });
  // Resource manifests also call their URL arrays `styles`. Resolve simple aliases
  // so those stay valid without allowing Ant's semantic-slot CSS objects through.
  const bindings = new Map();
  function collect(node) {
    if (!node || !node.type) return;
    if (node.type === 'VariableDeclarator' && node.id.type === 'Identifier') {
      const name = node.id.name;
      bindings.set(name, bindings.has(name) ? null : node.init);
    }
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) value.forEach(collect);
      else if (value && value.type) collect(value);
    }
  }
  collect(ast);
  function resourceList(node, visited = new Set()) {
    if (!node) return false;
    if (node.type === 'ArrayExpression') return node.elements.every(item => item &&
      (item.type === 'Identifier' || typeof constant(item) === 'string'));
    if (node.type !== 'Identifier' || visited.has(node.name)) return false;
    visited.add(node.name);
    return resourceList(bindings.get(node.name), visited);
  }
  const results = [], seen = new Set();
  const add = (node, kind) => { const key = node.start + ':' + kind; if (!seen.has(key)) { seen.add(key); results.push({kind, line:node.loc.start.line, expression:source.slice(node.start,node.end)}); } };
  function visit(node, parent) {
    if (!node || typeof node !== 'object' || !node.type) return;
    if (node.type === 'AssignmentExpression' || node.type === 'UpdateExpression') {
      const target = node.left || node.argument;
      if (isStyle(target) || isStyle(target.object)) add(node, 'style-write');
      if (['adoptedStyleSheets', 'cssText'].includes(property(target)) && !isStyle(target.object)) add(node, 'css-injection');
    }
    if (node.type === 'CallExpression') {
      const callee = node.callee.type === 'SequenceExpression' ? node.callee.expressions[node.callee.expressions.length - 1] : node.callee;
      const method = callee.type === 'Identifier' ? callee.name : property(callee), args = node.arguments;
      if (['jsx','jsxs','jsxDEV'].includes(method) && constant(args[0]) === 'style') add(node, 'css-injection');
      if (isStyle(node.callee.object) && !['getPropertyValue','getPropertyPriority','item','removeProperty'].includes(method)) add(node, 'style-write');
      if ((method === 'setAttribute' && constant(args[0]) === 'style') || (method === 'setAttributeNS' && constant(args[1]) === 'style')) add(node, 'css-injection');
      if (['createElement','createElementNS'].includes(method) && args.some(a => constant(a) === 'style')) add(node, 'css-injection');
      if (['insertRule','addRule','replaceSync'].includes(method)) add(node, 'css-injection');
    }
    if (node.type === 'NewExpression' && node.callee.name === 'CSSStyleSheet') add(node, 'css-injection');
    // Escaping a style object into an alias/helper is a review point, not an escape hatch.
    if (isStyle(node) && !(parent && (parent.type === 'MemberExpression' && parent.object === node || parent.type === 'AssignmentExpression' && parent.left === node))) add(node, 'style-reference');
    if (node.type === 'Property') {
      const key = node.computed ? constant(node.key) : node.key.name || node.key.value;
      if (key === 'style' || /^(?:body|head|header|footer|content|overlay|mask|wrapper|label|item|dropdown)Style$/.test(key) ||
          key === 'styles' && !resourceList(node.value)) add(node, 'style-object');
    }
    if (node.type === 'BinaryExpression' && node.operator === '+') {
      const text = constant(node);
      if (typeof text === 'string' && /<style\b|\sstyle\s*=/i.test(text)) add(node, 'embedded-style');
    }
    if (node.type === 'Literal' && typeof node.value === 'string' || node.type === 'TemplateElement') {
      const text = node.type === 'Literal' ? node.value : node.value.cooked || node.value.raw;
      if (/<style\b|\sstyle\s*=/i.test(text)) add(node, 'embedded-style');
    }
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) value.forEach(child => visit(child,node));
      else if (value && typeof value === 'object' && value.type) visit(value,node);
    }
  }
  visit(ast,null);
  return results.sort((a,b) => a.line-b.line);
}
function auditStaticMarkup(source) {
  const findings = [];
  function visit(node) {
    if (!node || !node.type) return;
    const value = node.type === 'Literal' ? node.value : node.type === 'TemplateElement' ? node.value.cooked : null;
    if (typeof value === 'string' && /<\/?[a-zA-Z][a-zA-Z0-9:-]*(?:\s|>|\/)/.test(value)) findings.push({line:node.loc.start.line, kind:'static-html'});
    for (const child of Object.values(node)) {
      if (Array.isArray(child)) child.forEach(visit);
      else if (child && child.type) visit(child);
    }
  }
  visit(parse(source, {ecmaVersion:'latest', sourceType:'module', locations:true}));
  return findings;
}
module.exports = { auditSource, auditStaticMarkup };
