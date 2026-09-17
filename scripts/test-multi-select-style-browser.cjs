// Compare standalone and filter-hosted instances of the real shared component.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  try {
    const page = await browser.newPage();
    await page.setContent('<div id="standalone" style="width:300px"></div><div class="gaip-filter-bar"><div id="filtered" style="width:300px"></div></div>');
    for (const file of ['web/umi.c6286171.css', 'shared/styles/global-font.css', 'shared/styles/global-multi-select.css', 'shared/styles/global-filter-bar.css']) {
      const css = read(file).replace(/url\((['"]?)([^)'"?#]+\.svg)\1\)/g, (_, quote, asset) => {
        const bytes = fs.readFileSync(path.resolve(root, path.dirname(file), asset));
        return 'url("data:image/svg+xml;base64,' + bytes.toString('base64') + '")';
      });
      await page.addStyleTag({ content: css });
    }
    await page.addScriptTag({ content: read('shared/scripts/global-multi-select.js') });
    await page.evaluate(() => {
      for (const id of ['standalone', 'filtered']) window.__GAIP_MULTI_SELECT__.mount(document.getElementById(id), { options: ['甲', '乙', '丙'], value: ['甲', '乙', '丙'], maxVisible: 2 });
    });
    const results = [];
    for (const id of ['standalone', 'filtered']) {
      const host = page.locator('#' + id), control = host.locator('[role="combobox"]');
      const snapshot = () => host.evaluate(el => {
        const pick = (selector, props, pseudo) => {
          const s = getComputedStyle(el.querySelector(selector), pseudo);
          return Object.fromEntries(props.map(p => [p, s.getPropertyValue(p)]));
        };
        return {
          control: pick('[role="combobox"]', ['border-color', 'box-shadow']),
          arrow: pick('.gaipMultiSelect__arrow', ['width', 'height', 'background-image', 'transform', 'border-width'], '::before'),
          panel: pick('[role="listbox"]', ['padding', 'border', 'border-radius', 'background-color', 'color', 'line-height']),
          option: pick('[role="option"]', ['padding', 'min-height', 'background-color', 'color', 'font-weight']),
          check: pick('.gaipMultiSelect__checkbox', ['background-color', 'border-color'])
        };
      });
      await page.mouse.move(0, 0);
      await page.waitForTimeout(250);
      const normal = await snapshot();
      await control.hover(); await page.waitForTimeout(250);
      const hover = await snapshot();
      await control.click(); await page.waitForTimeout(250);
      const open = await snapshot();
      assert.equal(open.control['border-color'], 'rgb(2, 91, 82)');
      assert.equal(open.control['box-shadow'], 'none');
      assert.equal(open.arrow.width, '12px');
      assert.equal(open.arrow['background-image'], 'url("data:image/svg+xml;base64,' + fs.readFileSync(path.join(root, 'shared/assets/modal-down.svg')).toString('base64') + '")');
      assert.equal(open.option.padding, '7px 12px');
      await host.locator('[data-value="甲"]').click();
      await host.locator('[data-value="甲"]').hover();
      const optionHover = await snapshot();
      assert.equal(optionHover.option['background-color'], 'rgba(2, 91, 82, 0.06)');
      assert.equal(await control.getAttribute('aria-expanded'), 'true');
      await page.keyboard.press('Escape');
      assert.equal(await control.getAttribute('aria-expanded'), 'false');
      await control.focus(); await page.waitForTimeout(250);
      const focus = await snapshot();
      results.push({ normal, hover, open, optionHover, focus });
      await control.evaluate(el => el.blur());
    }
    assert.deepEqual(results[0], results[1], 'standalone/filter component styles must match in every tested state');
    console.log('PASS Chromium: standalone/filter default, hover, open, focus, option states, arrow and selection/Escape behavior match. Isolated component check, not full business pages.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
