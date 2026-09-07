/* Local DOM regression for the two expandable sidebar parents.
   Use the same temporary jsdom NODE_PATH as test-operation-log.cjs. */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '..');
const tick = () => new Promise(resolve => setTimeout(resolve, 80));
const source = file => fs.readFileSync(path.join(root, file), 'utf8');

async function main() {
  const dom = new JSDOM('<!doctype html><div id="root"><div class="ant-pro-layout"><header data-gaip-region="app-header"></header><aside class="ant-layout-sider"><div class="ant-layout-sider-children"><div class="ant-pro-sider-logo"></div><div style="flex:1;overflow:hidden auto"><ul class="ant-menu ant-menu-root ant-pro-sider-menu"></ul></div><div class="layoutMenuFooter___test"><a><img alt="GLORY百宝箱"></a><p class="txt___test">Glory Advisor Intelligence Platform</p></div></div></aside><main class="ant-pro-layout-content"></main></div></div>', {
    url: 'file://' + root + '/index.html#/workspace?gaip-channel=wealth&gaip-view=my-wealth',
    runScripts: 'outside-only',
    pretendToBeVisual: true
  });
  const w = dom.window;
  const d = w.document;
  const nativeAnimationFrame = w.requestAnimationFrame.bind(w);
  const pendingFrames = new Set();
  w.requestAnimationFrame = callback => {
    const id = nativeAnimationFrame(time => {
      pendingFrames.delete(id);
      callback(time);
    });
    pendingFrames.add(id);
    return id;
  };
  let wealthClosed = 0;
  let wealthOpened = 0;

  w.__GAIP_WEALTH_CENTER__ = {
    isOpen() { return new URLSearchParams(w.location.hash.split('?')[1] || '').get('gaip-channel') === 'wealth'; },
    closeForNavigation() { wealthClosed++; },
    open(view) {
      wealthOpened++;
      w.location.hash = '#/workspace?gaip-channel=wealth&gaip-view=' + view;
    }
  };
  w.__GAIP_OPERATION_LOG__ = { mount() { return { destroy() {} }; } };

  for (const file of [
    'shared/config/channels.js',
    'shared/scripts/channel-regions.js',
    'features/wealth-center/wealth-nav.js',
    'features/config-center/source-markup.js',
    'features/config-center/config-center.js'
  ]) w.eval(source(file));
  await tick();

  const wealthGroup = d.querySelector('.gaip-wealth-menu-group');
  const configGroup = d.querySelector('.gaip-config-menu');
  const sidebarScroll = d.querySelector('.ant-layout-sider-children > .gaip-sidebar-nav-scroll');
  const sidebarHub = d.querySelector('.ant-layout-sider-children > .gaip-sidebar-hub');
  const wealthToggle = wealthGroup && wealthGroup.querySelector('[data-gaip-main-menu-toggle]');
  const configToggle = configGroup && configGroup.querySelector('[data-gaip-main-menu-toggle]');
  assert.ok(wealthGroup && configGroup && wealthToggle && configToggle, 'both parents use the shared expandable-menu contract');
  assert.ok(sidebarScroll, 'the shared shell identifies the primary navigation scroll layer');
  assert.ok(sidebarHub, 'the shared shell identifies the sidebar hub background layer');
  assert.equal(sidebarHub.querySelector('p[class*="txt___"]'), null, 'the obsolete English sidebar caption is removed');
  const sidebarHubImage = sidebarHub.querySelector('.gaip-sidebar-hub-image');
  assert.ok(sidebarHubImage, 'the shared shell keeps the sidebar hub image');
  assert.match(sidebarHubImage.getAttribute('src'), /shared\/assets\/sidebar-hub-wide\.20260904\.png\?v=20260904-3$/);
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root, 'shared/assets/sidebar-hub-wide.20260904.png'))).digest('hex'), 'bf187b4e6753ddff16bcdc876fe63985c893f613e86ab3ef4f287af0c3850b57', 'the local shared asset stays byte-identical to the supplied image');
  assert.ok(wealthGroup.classList.contains('is-open'));
  assert.ok(wealthGroup.classList.contains('is-current'), 'a selected wealth child keeps its parent current');
  assert.ok(!configGroup.classList.contains('is-open'));
  assert.equal(wealthGroup.querySelectorAll('.gaip-main-menu-caret-icon').length, 1);
  assert.equal(configGroup.querySelectorAll('.gaip-main-menu-caret-icon').length, 1);
  const configIcon = configGroup.querySelector('.gaip-config-original-icon img');
  assert.ok(configIcon, 'config icon uses the synchronized online SVG asset');
  assert.match(configIcon.getAttribute('src'), /features\/config-center\/assets\/organization\.svg$/);
  assert.equal(configGroup.querySelector('.gaip-config-original-icon svg'), null, 'the online icon path is not redrawn in JavaScript');
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root, 'features/config-center/assets/organization.svg'))).digest('hex'), '1a4d8a89c5db7291afe6aa59cf9078e1715416700698d5aeb9a2198b896d9c59', 'the local icon stays byte-identical to the online bundle asset');

  const wealthHash = w.location.hash;
  configToggle.click();
  assert.equal(w.location.hash, wealthHash, 'config parent never changes the current wealth hash');
  assert.equal(wealthClosed, 0, 'config parent is not treated as leaving wealth');
  assert.equal(configToggle.getAttribute('aria-expanded'), 'true');
  configToggle.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  assert.equal(configToggle.getAttribute('aria-expanded'), 'false');
  assert.equal(w.location.hash, wealthHash);

  wealthToggle.click();
  assert.equal(wealthToggle.getAttribute('aria-expanded'), 'false');
  assert.equal(w.location.hash, wealthHash, 'wealth parent only collapses its children');
  assert.equal(wealthOpened, 0, 'wealth parent never opens a default child');
  wealthToggle.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  assert.equal(wealthToggle.getAttribute('aria-expanded'), 'true');
  wealthToggle.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  assert.equal(wealthToggle.getAttribute('aria-expanded'), 'false');

  wealthGroup.querySelector('[data-wealth-view="import-records"]').click();
  assert.equal(wealthOpened, 1, 'a child item still performs real channel navigation');
  assert.match(w.location.hash, /gaip-channel=wealth&gaip-view=import-records/);

  w.location.hash = '#/workspace?gaip-channel=config&gaip-view=organization';
  await tick();
  assert.ok(d.querySelector('.gaip-config-page'), 'config view mounted');
  assert.ok(configGroup.classList.contains('is-current'), 'a selected config child keeps its parent current');
  assert.ok(!wealthGroup.classList.contains('is-current'), 'only the active child group keeps a current parent');
  const configHash = w.location.hash;
  wealthToggle.click();
  await tick();
  assert.equal(w.location.hash, configHash, 'wealth parent never changes the current config hash');
  assert.ok(d.querySelector('.gaip-config-page'), 'wealth parent is not treated as leaving config');

  const sharedCss = source('shared/styles/channel-foundation.css');
  const configCss = source('features/config-center/config-center.css');
  assert.match(sharedCss, /inset-inline-end:\s*16px\s*!important/);
  assert.match(sharedCss, /translateY\(-50%\) rotate\(180deg\)/);
  assert.match(sharedCss, /prefers-reduced-motion:\s*reduce/);
  assert.match(sharedCss, /column-gap:\s*13px\s*!important/);
  assert.match(sharedCss, /\.gaip-sidebar-nav-scroll[\s\S]*margin-right:\s*-8px/);
  assert.match(sharedCss, /scrollbar-color:\s*rgba\(47, 54, 64, 0\.14\) transparent/);
  assert.match(sharedCss, /\.gaip-sidebar-nav-scroll::?-webkit-scrollbar-thumb[\s\S]*background:\s*rgba\(47, 54, 64, 0\.14\)/);
  assert.match(sharedCss, /\.ant-pro-sider-footer[\s\S]*z-index:\s*0/);
  assert.match(sharedCss, /\.ant-pro-layout\s+\.ant-pro-sider-footer\.gaip-sidebar-hub\s*\{[\s\S]*padding-block-end:\s*0\s*!important/);
  assert.match(sharedCss, /\.gaip-sidebar-hub\s*>\s*p\s*\{[\s\S]*display:\s*none\s*!important/);
  assert.match(sharedCss, /\.gaip-sidebar-hub-link\s*\{[\s\S]*width:\s*100%[\s\S]*margin:\s*0/);
  assert.doesNotMatch(sharedCss, /\.gaip-sidebar-hub-link\s*\{[^}]*border-radius:/, 'the full-width sidebar hub image has no extra corner radius');
  assert.match(sharedCss, /\.gaip-sidebar-hub-image\s*\{[\s\S]*width:\s*100%\s*!important/);
  assert.match(configCss, /border-left:\s*4px solid transparent\s*!important/);
  assert.match(configCss, /background-color:\s*rgba\(0,0,0,\.03\)\s*!important/, 'config parent uses the same gray hover as wealth');
  assert.match(configCss, /padding:\s*0 0 0 55px\s*!important/, 'config children align with ordinary and wealth navigation labels');
  assert.match(configCss, /\.gaip-config-menu\.is-current[\s\S]*background-color:\s*transparent\s*!important/, 'a selected config child colors the parent foreground without a selected parent background');
  assert.match(configCss, /\.gaip-config-menu\.is-current \.gaip-config-original-icon img[\s\S]*filter:/, 'the selected tint keeps the synchronized online img visible');
  assert.doesNotMatch(configCss, /(?:-webkit-)?mask:/, 'the icon does not depend on an external SVG mask');
  const wealthCss = source('features/wealth-center/wealth-center.css');
  assert.match(wealthCss, /\.gaip-wealth-menu-group\.is-current[\s\S]*background-color:\s*transparent\s*!important/, 'a selected wealth child uses the same foreground-only parent state as config');
  assert.match(wealthCss, /\.gaip-wealth-menu-group\s*>\s*\.gaip-wealth-submenu\s*>\s*\.gaip-wealth-subitem\.ant-menu-item-selected[\s\S]*border-left-color:\s*#24d4c9\s*!important/, 'the selected wealth child owns the green background and left border');

  pendingFrames.forEach(id => w.cancelAnimationFrame(id));
  // Do not call window.close(): the production child-list observer sees jsdom's
  // teardown removals and schedules one final frame against the closed document.
  console.log('PASS: shared parent contract, pure toggle clicks, fixed caret contract, keyboard behavior, child navigation and wealth/config cross-channel isolation.');
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
