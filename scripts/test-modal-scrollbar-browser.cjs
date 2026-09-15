// Isolated CSS mechanism test, NOT a source-page/preview acceptance test.
// PLAYWRIGHT_MODULE may point to an existing playwright-core installation.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const root = path.resolve(__dirname, '..');
const css = fs.readFileSync(path.join(root, 'shared/styles/global-modal.css'), 'utf8');
const modalScroll = css.slice(css.indexOf('/* All ordinary modal scroll layers'), css.indexOf('/* Forms retain their width'));
const font = fs.readFileSync(path.join(root, 'shared/styles/global-font.css'), 'utf8');
const standard = font.slice(font.indexOf('/* Standard native scrollbars only:'));
const base = ':root{--gaip-scrollbar-thumb:rgba(47,54,64,.32);--gaip-scrollbar-track:transparent}*{box-sizing:border-box}body{margin:20px;background:white;font:14px sans-serif}.panel{width:260px;height:200px;overflow:auto;border:1px solid #ddd;padding:12px}.row{height:32px}';
const rows = Array(20).fill('<div class="row">Scrollable text</div>').join('');
async function main() {
  // Playwright normally passes --hide-scrollbars, which invalidates this test.
  const browser = await chromium.launch({ headless: true, ignoreDefaultArgs: ['--hide-scrollbars'], ...(process.env.CHROME_PATH ? {executablePath: process.env.CHROME_PATH} : {}) });
  try {
    const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
    for (const owner of ['class="gaip-modal-kit"', 'data-gaip-modal-placement="center"', 'class="gaip-modal-popup"']) {
      for (const styles of [standard + modalScroll, modalScroll + standard]) {
        await page.setContent('<style>' + base + '</style><main id="owner" ' + owner + '><div class="panel" id="long">' + rows + '</div><div class="panel" id="short">Short</div><textarea class="panel" id="text">' + Array(40).fill('Text').join('\n') + '</textarea></main>');
        await page.mouse.move(999, 699);
        await page.waitForTimeout(200);
        const geometry = () => page.evaluate(() => ['long', 'short', 'text'].map(id => {
          const e = document.getElementById(id), s = getComputedStyle(e);
          return { id, width: e.offsetWidth, client: e.clientWidth, overflow: e.scrollHeight > e.clientHeight, scrollbarWidth: s.scrollbarWidth, color: s.scrollbarColor, padding: s.padding };
        }));
        const native = await geometry();
        await page.addStyleTag({ content: styles });
        const initial = await geometry();
        assert.deepEqual(initial.map(p => p.client), native.map(p => p.client), 'color-only styling preserves platform-native scrollbar width');
        for (const p of initial.filter(p => p.id !== 'short')) {
          assert.equal(p.overflow, true);
          assert.equal(p.padding, '12px', 'no content padding compensation');
          if (await page.evaluate(() => CSS.supports('scrollbar-color', 'red blue'))) {
            assert.equal(p.color, 'rgba(47, 54, 64, 0.18) rgba(0, 0, 0, 0)');
            assert.equal(p.scrollbarWidth, 'auto');
          }
        }
        assert.equal(initial[1].overflow, false);
        assert.equal(initial[1].width - initial[1].client, 2, 'no scrollbar without overflow');
        await page.locator('#long').hover();
        await page.mouse.wheel(0, 120);
        await page.waitForTimeout(120);
        assert.ok(await page.locator('#long').evaluate(e => e.scrollTop > 0), 'wheel scrolling works');
        assert.equal((await geometry())[0].client, initial[0].client, 'scrolling does not resize the content');
        await page.locator('#owner').evaluate(e => e.hidden = true);
        assert.equal(await page.locator('#long').isVisible(), false, 'scroll styling cannot reopen a closed host');
        await page.locator('#owner').evaluate(e => e.hidden = false);
        assert.deepEqual((await geometry()).map(p => p.client), initial.map(p => p.client), 'reopening preserves geometry');
      }
    }
    console.log('PASS: isolated color-only native scrollbars, unchanged platform width, both CSS orders, long/short/textarea, wheel, close/reopen; Chromium ' + browser.version());
  } finally { await browser.close(); }
}
main().catch(e => { console.error(e); process.exitCode = 1; });
