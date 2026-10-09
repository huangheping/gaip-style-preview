'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const { JSDOM } = require('jsdom');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const root = path.resolve(__dirname, '..');
const records = JSON.parse(fs.readFileSync(path.join(root, 'design-changes/shared-main-nav-icons.json'))).records.filter(r => r.id.endsWith('.icon'));
function geometry(svg) {
  return [...svg.querySelectorAll('*')].filter(n => n.tagName !== 'title').map(n => ({
    tag: n.tagName,
    attrs: [...n.attributes].filter(a => a.name !== 'id').map(a => [a.name, a.value.replace(/#2f3640/ig, 'currentColor')]).sort()
  }));
}
async function inspect(icon, expected) {
  const value = await icon.evaluate(el => {
    const svg = el.querySelector('svg'), s = getComputedStyle(el), b = svg.getBoundingClientRect(), box = el.getBoundingClientRect();
    let opacity = 1;
    for (let n = svg; n && !n.matches('.ant-layout-sider'); n = n.parentElement) opacity *= Number(getComputedStyle(n).opacity);
    return { w: b.width, h: b.height, color: s.color, opacity, filter: getComputedStyle(svg).filter,
      boxW: box.width, boxH: box.height, offsetX: b.x - box.x, offsetY: b.y - box.y,
      background: s.backgroundImage, mask: s.webkitMaskImage, visible: s.visibility,
      paints: [...svg.querySelectorAll('[stroke], [fill]')].flatMap(n => ['stroke', 'fill'].filter(a => n.getAttribute(a) === 'currentColor').map(a => getComputedStyle(n)[a])),
      rowHeight: (el.closest('.gaip-main-menu-parent') || el.closest('li')).getBoundingClientRect().height,
      iconX: el.getBoundingClientRect().x,
      textX: el.closest('li').querySelector('.ant-pro-base-menu-inline-item-text').getBoundingClientRect().x };
  });
  assert.equal(value.w, 16); assert.equal(value.h, 16);
  assert.equal(value.boxW, 18); assert.equal(value.boxH, 18);
  assert.equal(value.offsetX, 1); assert.equal(value.offsetY, 1);
  assert.equal(value.color, expected); assert.equal(value.opacity, 1);
  assert.equal(value.filter, 'none'); assert.equal(value.background, 'none'); assert.equal(value.mask, 'none');
  assert.equal(value.visible, 'visible'); assert.ok(value.paints.length);
  assert.ok(value.paints.every(c => c === expected));
  assert.equal(value.iconX, 36); assert.equal(value.textX, 67);
  assert.equal(value.rowHeight, 36);
}
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH });
  try {
    for (const entry of ['channels/workspace/index.html', 'channels/product/index.html']) {
      const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
      page.setDefaultTimeout(15000);
      await page.goto(pathToFileURL(path.join(root, entry)).href);
      await page.waitForFunction(() => document.querySelectorAll('.ant-layout-sider .gaip-main-nav-icon > svg').length === 12);
      const session = await page.evaluate(() => document.documentElement.dataset.gaipDocumentSession);
      assert.ok(session, 'document identity must exist before comparing navigation');
      // Select workspace first so each following row can be checked in its true default state.
      await page.locator('[data-gaip-nav-icon="workspace"]').click();
      const ordered = [...records.filter(r => !r.id.includes('.workspace.')), records.find(r => r.id.includes('.workspace.'))];
      for (const record of ordered) {
        const key = record.id.split('.')[1], icon = page.locator('.ant-layout-sider [data-gaip-nav-icon="' + key + '"]');
        const target = key === 'wealth' || key === 'organization' ? icon.locator('xpath=ancestor::*[contains(@class,"gaip-main-menu-parent")]') : icon;
        const svgText = await icon.locator('svg').evaluate(n => n.outerHTML);
        const actual = new JSDOM(svgText, { contentType: 'image/svg+xml' });
        const registry=JSON.parse(fs.readFileSync(path.join(root,'shared/assets/icons/registry.json'),'utf8'));
        const original = new JSDOM(fs.readFileSync(path.join(root,registry.assets.find(a=>a.template==='nav-icon-'+key).file), 'utf8'), { contentType: 'image/svg+xml' });
        assert.deepEqual(geometry(actual.window.document.documentElement), geometry(original.window.document.documentElement), key + ' keeps original geometry');
        actual.window.close(); original.window.close();
        await page.mouse.move(1000, 50);
        await inspect(icon, 'rgb(47, 54, 64)');
        await target.hover();
        await inspect(icon, 'rgb(2, 91, 82)');
        const previousHash = await page.evaluate(() => location.hash);
        await target.click();
        if (key === 'wealth' || key === 'organization') {
          assert.equal(await page.evaluate(() => location.hash), previousHash, 'parent icon only toggles');
          const child = key === 'wealth' ? '[data-wealth-view="import-workbench"]' : 'a[data-config-view="organization"]';
          if (!(await page.locator(child).isVisible())) await target.click();
          await page.locator(child).click();
        }
        await page.waitForFunction(k => {
          const el = document.querySelector('[data-gaip-nav-icon="' + k + '"]');
          return el.closest('li').matches('.ant-menu-item-selected, .is-current');
        }, key);
        await page.mouse.move(1000, 50);
        await inspect(icon, 'rgb(2, 91, 82)');
        await target.hover();
        await inspect(icon, 'rgb(2, 91, 82)');
        assert.equal(await page.evaluate(() => document.documentElement.dataset.gaipDocumentSession), session, 'navigation does not replace document');
        assert.equal(await icon.locator('svg').count(), 1, 'no duplicate icons after navigation');
      }
      await page.screenshot({ path: path.join(root, 'design-changes/evidence/main-nav-icons-20260929-16px-' + (entry.includes('product') ? 'product' : 'workspace') + '.png') });
      // CSS collapsed presentation: no business navigation is triggered by this state-only check.
      await page.locator('.ant-layout-sider').evaluate(n => n.classList.add('ant-layout-sider-collapsed'));
      const collapsed = await page.locator('.ant-layout-sider .gaip-main-nav-svg').evaluateAll(xs => xs.map(x => ({ w: x.getBoundingClientRect().width, h: x.getBoundingClientRect().height, opacity: getComputedStyle(x).opacity })));
      assert.equal(collapsed.length, 12); collapsed.forEach(s => assert.deepEqual(s, { w: 16, h: 16, opacity: '1' }));
      console.log('PASS', entry, '12 original glyphs; 48 default/hover/current/current-hover states; unchanged expanded alignment; collapsed size; real Hash clicks');
      await page.close();
    }
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
