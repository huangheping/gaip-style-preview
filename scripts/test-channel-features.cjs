'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const source = fs.readFileSync(path.join(__dirname, '../shared/scripts/channel-features.js'), 'utf8');

for (const protocol of ['file:///preview/', 'https://example.test/preview/']) {
  const dom = new JSDOM(`<!doctype html><base href="${protocol}">
    <link rel="preload" href="new.css?v=1" as="style">
    <link rel="stylesheet" href="./existing.css?v=1">
    <script defer src="./existing.js?v=1"></script>
    <script src="./shared/scripts/channel-features.js"></script>`, {
    url: protocol + 'channels/workspace/index.html', runScripts: 'outside-only'
  });
  const w = dom.window, d = w.document;
  Object.defineProperty(d, 'currentScript', { value: d.scripts[1] });
  w.__GAIP_CHANNEL_CONFIG__ = { list: [
    { key: 'first', assets: { styles: ['existing.css?v=1', 'new.css?v=1'], scripts: ['existing.js?v=1', 'first.js', 'second.js'] } },
    { key: 'second', assets: { styles: ['./new.css?v=1', 'existing.css?v=2'], scripts: ['./first.js', 'existing.js?v=2'] } }
  ] };
  const existing = d.scripts[0];
  w.eval(source);
  const urls = selector => Array.from(d.querySelectorAll(selector), n => n.href || n.src);
  assert.deepEqual(urls('link[rel="stylesheet"]'), ['existing.css?v=1', 'new.css?v=1', 'existing.css?v=2'].map(p => protocol + p));
  assert.deepEqual(urls('script[data-gaip-feature]'), ['first.js', 'second.js', 'existing.js?v=2'].map(p => protocol + p));
  assert.equal(d.scripts[0], existing, 'existing deferred script is retained, not replaced');
  assert.ok(existing.defer);
  assert.ok(Array.from(d.querySelectorAll('script[data-gaip-feature]')).every(n => n.async === false), 'new scripts preserve dependency order');
  const before = urls('script[src],link[rel="stylesheet"]');
  w.eval(source);
  assert.deepEqual(urls('script[src],link[rel="stylesheet"]'), before, 're-entry must not append resources again');
  d.querySelector('script[data-gaip-feature]').dispatchEvent(new w.Event('error'));
  assert.equal(d.documentElement.dataset.gaipFeatureError, 'first');
  dom.window.close();
}
// The parser cannot see later script tags when the feature loader scans DOM.
const projectRoot = path.join(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(projectRoot, 'shared/config/project-structure.json'), 'utf8'));
for (const entry of [...manifest.channels, ...manifest.extraEntries].filter(entry => !entry.localOnly)) {
  const file = path.join(projectRoot, entry.html || entry.entry);
  const html = fs.readFileSync(file, 'utf8');
  const loader = html.indexOf('shared/scripts/channel-features.js');
  const table = html.indexOf('components/table/global-table.js');
  if (loader !== -1 && table !== -1) assert.ok(table < loader, entry.id + ': shared table must exist before feature-loader discovery');
}
console.log('PASS: channel assets resolve relative/base URLs, deduplicate by type and version, retain script order and remain idempotent.');
