/* Real navigation controllers in JSDOM; no HTTP server or browser requests. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..');
const source = file => fs.readFileSync(path.join(root, file), 'utf8');
const tick = () => new Promise(resolve => setTimeout(resolve, 60));

async function run(entry) {
  const dom = new JSDOM('<div id="root"><aside class="ant-layout-sider"><ul class="ant-menu ant-menu-root"></ul></aside></div>', {
    url: 'https://preview.invalid/' + encodeURIComponent(entry) + '#/activity',
    runScripts: 'outside-only', pretendToBeVisual: true
  });
  const w = dom.window, d = w.document, menu = d.querySelector('.ant-menu-root');
  w.requestAnimationFrame = callback => w.setTimeout(callback, 16);
  w.cancelAnimationFrame = id => w.clearTimeout(id);
  const key = () => new w.URLSearchParams(w.location.hash.split('?')[1] || '').get('gaip-channel');
  try {
    w.eval(source('shared/config/channels.js'));
    const channels = w.__GAIP_CHANNEL_CONFIG__.list;
    const nativeChannels = channels.filter(channel => !channel.virtual);
    for (const channel of nativeChannels) {
      const item = d.createElement('li');
      item.className = 'ant-menu-item';
      item.innerHTML = '<span class="ant-menu-title-content"><a></a></span>';
      item.querySelector('a').textContent = channel.label;
      item.querySelector('a').href = '#' + channel.route;
      menu.append(item);
    }
    w.__GAIP_LEARNING_CENTER__ = { isOpen: () => key() === 'learning', closeForNavigation() {} };
    w.__GAIP_WEALTH_CENTER__ = { isOpen: () => key() === 'wealth', closeForNavigation() {} };
    for (const file of [
      'shared/scripts/learning-nav.js',
      'features/news-center/mock-data.js', 'features/news-center/news-center.js',
      'features/wealth-center/wealth-nav.js',
      'shared/scripts/organization-store.js', 'shared/scripts/organization-tree.js',
      'features/config-center/source-markup.js', 'features/config-center/config-center.js'
    ]) w.eval(source(file));
    await tick(); await tick();
    const states = [
      ['news'], ['wealth', 'import-workbench'], ['config', 'organization'], ['learning'],
      ['wealth', 'import-records'], ['config', 'announcement-management'],
      ['wealth', 'my-wealth'], ['config', 'operation-log']
    ];
    let redraws = 0;
    for (const [channel, view] of states) {
      w.location.hash = '#/workspace?gaip-channel=' + channel + (view ? '&gaip-view=' + view : '');
      w.dispatchEvent(new w.CustomEvent('gaip:learning-change'));
      await tick(); await tick();
      const owner = [...menu.children].find(node => node.getAttribute('data-gaip-channel') === channel);
      assert(owner, 'real menu is mounted: ' + channel);
      const current = menu.querySelector('.ant-menu-item-selected');
      assert(current && owner.contains(current), 'current selection belongs to ' + channel);
      if (view) assert(current.querySelector('a').getAttribute('href').includes('gaip-view=' + view));
      const oldItems = [...menu.querySelectorAll('li.ant-menu-item')].filter(item => !owner.contains(item));
      for (const old of oldItems) {
        // Preserve component classes and emulate Ant's className rewrite on hover.
        old.classList.add('ant-menu-item-active', 'ant-menu-item-selected');
        old.setAttribute('aria-selected', 'true');
        await tick();
        assert(!old.classList.contains('ant-menu-item-selected'), channel + ': old selection persisted on ' + old.textContent);
        assert.equal(old.getAttribute('aria-selected'), 'false');
        assert(old.classList.contains('ant-menu-item-active'), 'hover/keyboard active remains supported');
        old.classList.remove('ant-menu-item-active');
        redraws++;
      }
      assert.equal(menu.querySelectorAll('.ant-menu-item-selected').length, 1);
      assert.equal(menu.querySelector('.ant-menu-item-selected'), current, 'real child selection is preserved');
      const hash = w.location.hash;
      for (const toggle of menu.querySelectorAll('[data-gaip-main-menu-toggle]')) {
        const previous = toggle.getAttribute('aria-expanded');
        toggle.click(); await tick();
        assert.notEqual(toggle.getAttribute('aria-expanded'), previous);
        assert.equal(w.location.hash, hash, 'parent remains a pure toggle');
        assert.equal(menu.querySelector('.ant-menu-item-selected'), current);
      }
      let mutations = 0;
      const observer = new w.MutationObserver(records => { mutations += records.length; });
      observer.observe(menu, {subtree: true, attributes: true, attributeFilter: ['class']});
      await tick(); mutations = 0; await tick();
      observer.disconnect();
      assert.equal(mutations, 0, 'shared guard settles without a mutation loop');
    }
    // Returning to every native channel still uses its existing route selection.
    for (const channel of nativeChannels) {
      w.location.hash = '#' + channel.route;
      await tick(); await tick();
      const selected = [...menu.querySelectorAll('.ant-menu-item-selected')];
      assert.equal(selected.length, 1);
      assert.equal(selected[0].textContent, channel.label);
    }
    console.log('PASS', entry, states.length + ' virtual states, ' + redraws + ' stale redraws, all native returns, parent toggles and observer stability (DOM only)');
  } finally { w.close(); }
}
(async () => { await run('登录.html'); await run('财富值中心.html'); })().catch(error => {
  console.error(error); process.exitCode = 1;
});
