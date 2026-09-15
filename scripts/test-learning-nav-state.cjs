/* DOM regression: Ant can rewrite className on hover without changing children. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..');
const source = name => fs.readFileSync(path.join(root, name), 'utf8');
const tick = () => new Promise(resolve => setTimeout(resolve, 60));

async function run(entry) {
  const dom = new JSDOM('<div class="ant-layout-sider"><ul class="ant-menu"></ul></div>', {
    // In-memory origin only; no HTTP server/browser or resource requests.
    url: 'https://preview.invalid/' + encodeURIComponent(entry) + '#/activity', runScripts: 'outside-only', pretendToBeVisual: true
  });
  const w = dom.window, d = w.document, menu = d.querySelector('.ant-menu');
  w.requestAnimationFrame = callback => w.setTimeout(callback, 16);
  w.cancelAnimationFrame = id => w.clearTimeout(id);
  try {
    w.eval(source('shared/config/channels.js'));
    const originals = w.__GAIP_CHANNEL_CONFIG__.list.filter(channel => !channel.virtual);
    for (const channel of originals.concat([{label: '资讯中心', route: '/workspace?gaip-channel=news'}])) {
      const li = d.createElement('li');
      li.className = 'ant-menu-item';
      li.innerHTML = '<span class="ant-menu-title-content"><a></a></span>';
      li.querySelector('a').textContent = channel.label;
      li.querySelector('a').href = '#' + channel.route;
      menu.append(li);
    }
    w.__GAIP_LEARNING_CENTER__ = {
      isOpen: () => new URLSearchParams(w.location.hash.split('?')[1] || '').get('gaip-channel') === 'learning',
      open() {
        w.history.pushState(null, '', w.location.hash.split('?')[0] + '?gaip-channel=learning');
        w.dispatchEvent(new w.CustomEvent('gaip:learning-change'));
      },
      closeForNavigation(route) { w.location.hash = '#' + route; }
    };
    w.eval(source('shared/scripts/learning-nav.js'));
    await tick();
    const learning = menu.querySelector('.gaip-learning-menu-item');
    const documentElement = d.documentElement;
    for (const previous of [...menu.children].filter(item => item !== learning)) {
      w.history.replaceState(null, '', previous.querySelector('a').getAttribute('href'));
      w.dispatchEvent(new w.Event('hashchange'));
      await tick();
      previous.classList.add('ant-menu-item-selected');
      learning.querySelector('a').click();
      await tick();
      assert(learning.classList.contains('ant-menu-item-selected'));
      // Reproduce the original component's hover render restoring its old selection.
      previous.className = 'ant-menu-item ant-menu-item-active ant-menu-item-selected';
      previous.setAttribute('aria-selected', 'true');
      await tick();
      assert(!previous.classList.contains('ant-menu-item-selected'), entry + ': stale selection on ' + previous.textContent);
      assert.equal(previous.getAttribute('aria-selected'), 'false');
      assert(previous.classList.contains('ant-menu-item-active'), 'genuine hover/keyboard active state is not disabled');
      previous.classList.remove('ant-menu-item-active');
      await tick();
      assert.equal(menu.querySelectorAll('.ant-menu-item-selected').length, 1);
      assert.equal(d.documentElement, documentElement, 'navigation retains the same document');
    }
    const target = [...menu.children].find(item => item.textContent === '活动中心');
    target.querySelector('a').click();
    await tick();
    assert(!learning.classList.contains('ant-menu-item-selected'), 'leaving learning clears its selection');
    assert(target.classList.contains('ant-menu-item-selected'), 'original channel selection returns');
    // The guard must not take ownership of another virtual channel.
    w.history.replaceState(null, '', '#/workspace?gaip-channel=news');
    w.dispatchEvent(new w.Event('hashchange'));
    target.classList.add('ant-menu-item-selected');
    await tick();
    assert(target.classList.contains('ant-menu-item-selected'));
    let changes = 0;
    const observer = new w.MutationObserver(records => { changes += records.length; });
    observer.observe(menu, {attributes: true, subtree: true, attributeFilter: ['class']});
    w.__GAIP_LEARNING_CENTER__.open();
    await tick();
    changes = 0;
    await tick();
    assert.equal(changes, 0, 'selection observer settles instead of looping');
    observer.disconnect();
    console.log('PASS learning selection/hover redraw, reverse navigation and idle observer:', entry);
  } finally { w.close(); }
}
(async () => { await run('登录.html'); await run('财富值中心.html'); })().catch(error => { console.error(error); process.exitCode = 1; });
