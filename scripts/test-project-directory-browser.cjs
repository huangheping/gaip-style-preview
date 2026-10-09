'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { pathToFileURL, fileURLToPath } = require('node:url');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'outputs/standardization/20260922/root-entry-migration/browser');
fs.mkdirSync(output, { recursive: true });
(async () => {
  const browser = await chromium.launch({headless:true, executablePath:process.env.CHROME_PATH});
  const results = [];
  try {
    const page = await browser.newPage({viewport:{width:1440,height:1000}}), errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('requestfailed', request => errors.push(request.url()));
    await page.goto(pathToFileURL(path.join(root,'app/project-index/index.html')).href);
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator('[data-channel-card]').count(), 12);
    const links = await page.locator('a').evaluateAll(elements => elements.map(a => a.href));
    for (const link of links) assert.ok(fs.existsSync(fileURLToPath(link)), link);
    const search = page.locator('#channel-search');
    await search.fill('学习');
    assert.equal(await page.locator('[data-channel-card]:visible').count(), 1);
    assert.match(await page.locator('[data-channel-card]:visible').textContent(), /learning-center/);
    await search.fill('workspace');
    assert.equal(await page.locator('[data-channel-card]:visible').count(), 1);
    await search.fill('no-such-channel');
    assert.equal(await page.locator('[data-empty]').isVisible(), true);
    await search.press('Escape');
    assert.equal(await page.locator('[data-channel-card]:visible').count(), 12);
    await page.keyboard.press('Tab');
    assert.equal(await page.locator(':focus').getAttribute('data-open-channel'), '');
    assert.equal(await page.locator(':focus').evaluate(el => getComputedStyle(el).outlineStyle), 'solid');
    for (const width of [1440,390]) {
      await page.setViewportSize({width,height:1000});
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      await search.blur();
      await page.screenshot({path:path.join(output,'directory-'+width+'.png'),fullPage:true});
      results.push({width, horizontalOverflow:false, cards:12});
    }
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(output,'directory-results.json'),JSON.stringify({results,errors},null,2));
    console.log('PASS: Chinese directory, real local links, search/empty/Escape, keyboard focus and desktop/mobile layout.');
  } finally { await browser.close(); }
})().catch(error => {console.error(error);process.exitCode=1;});
