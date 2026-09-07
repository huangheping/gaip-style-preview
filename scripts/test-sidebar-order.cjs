/* DOM/CSS contract only: does not prove rendered geometry or browser hit testing. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

async function main() {
  const dom = new JSDOM('<!doctype html><div id="root"><aside class="ant-layout-sider"><ul class="ant-menu ant-menu-root"></ul></aside><main class="ant-pro-layout-content"></main></div>', {
    url: 'file://' + root + '/财富值中心.html#/proposal', runScripts: 'outside-only', pretendToBeVisual: true
  });
  const w = dom.window, d = w.document, observers = [];
  const Observer = w.MutationObserver;
  w.MutationObserver = class extends Observer { constructor(callback) { super(callback); observers.push(this); } };
  const menu = d.querySelector('.ant-menu-root');
  const waitFor = async predicate => {
    const deadline = Date.now() + 3000;
    while (!predicate()) {
      assert.ok(Date.now() < deadline, 'menu mounts/updates within bounded wait');
      await new Promise(resolve => setTimeout(resolve, 20));
    }
  };
  try {
    w.eval(read('shared/config/channels.js'));
    const config = w.__GAIP_CHANNEL_CONFIG__;
    const expected = ['workspace', 'clues', 'customer', 'proposal', 'product', 'policy', 'news', 'activity', 'learning', 'induction', 'wealth', 'config'];
    const addItem = channel => {
      const li = d.createElement('li');
      li.dataset.key = channel.key;
      const label = channel.key === 'induction' ? '薄荷入职指引' : channel.label;
      li.innerHTML = channel.views
        ? '<div class="ant-menu-submenu-title gaip-main-menu-parent"><span class="ant-menu-title-content">' + label + '</span></div><ul><li class="child">子项</li></ul>'
        : '<span class="ant-menu-title-content">' + label + '</span>';
      menu.appendChild(li);
      return li;
    };
    // Keep the old DOM order; visual order must not move React-owned nodes.
    config.list.forEach(addItem);
    const original = Array.from(menu.children);
    const customer = original.find(li => li.dataset.key === 'customer');
    let clicks = 0;
    customer.addEventListener('click', () => { clicks++; w.location.hash = '#/customer'; });
    const styles = d.createElement('style');
    styles.textContent = read('shared/styles/channel-foundation.css');
    d.head.appendChild(styles);
    w.eval(read('shared/scripts/channel-regions.js'));
    const visualKeys = () => Array.from(menu.children).sort((a, b) => Number(a.style.order) - Number(b.style.order)).map(li => li.dataset.key);
    await waitFor(() => original.every(li => li.style.order !== ''));
    assert.deepEqual(visualKeys(), expected);
    assert.deepEqual(Array.from(menu.children), original, 'DOM order and node identity are untouched');
    assert.equal(w.location.hash, '#/proposal', 'sorting never navigates');
    assert.equal(d.querySelector('.child').style.order, '', 'nested menus are excluded');
    assert.equal(w.getComputedStyle(menu).display, 'flex');
    d.querySelector('aside').classList.add('ant-layout-sider-collapsed');
    assert.equal(w.getComputedStyle(menu).display, 'flex', 'collapsed sidebar keeps the same visual order');
    customer.click();
    assert.equal(clicks, 1, 'original click listener is retained, without duplication');
    assert.equal(w.location.hash, '#/customer');
    customer.remove();
    const replacement = addItem(config.getByKey('customer'));
    await waitFor(() => replacement.style.order !== '');
    assert.deepEqual(visualKeys(), expected, 'late/remounted menu items recover their order');
    const unknown = addItem({ key: 'future', label: '未来频道' });
    await waitFor(() => unknown.style.order !== '');
    assert.equal(visualKeys().at(-1), 'future', 'unknown channels remain visible at the end');
    assert.equal(menu.children.length, 13);
    console.log('PASS: requested sidebar order, aliases, node identity, preserved clicks, nested-menu exclusion, collapsed mode and remount recovery.');
    console.log('NOT VERIFIED: actual menu gaps/heights, Umi arrow-key sequence and real browser navigation.');
  } finally {
    observers.forEach(observer => observer.disconnect());
    w.close();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
