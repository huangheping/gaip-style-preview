#!/usr/bin/env node
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'outputs/standardization/20260922/root-entry-migration/browser');
fs.mkdirSync(output, { recursive: true });
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH });
  const records = [];
  try {
    for (const entry of ['channels/workspace/index.html', 'channels/product/index.html']) {
      const page = await browser.newPage({ viewport: { width: 1440, height: 980 } });
      const errors = [], missing = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('requestfailed', request => { if (request.url().startsWith('file:')) missing.push(request.url()); });
      await page.goto(pathToFileURL(path.join(root, entry)).href);
      await page.locator('.gaip-config-toggle').waitFor();
      const readState = () => page.evaluate(() => ({ hash: location.hash, session: document.documentElement.dataset.gaipDocumentSession }));
      const initial = await readState();
      await page.locator('.gaip-config-toggle').click();
      assert.deepEqual(await readState(), initial, 'parent only expands; it must not navigate or reload');
      await page.locator('a[data-config-view="organization"]').click();
      await page.locator('[data-config-log]').waitFor();
      const config = await readState();
      assert.equal(config.session, initial.session, 'navigation keeps the original document');
      assert.match(config.hash, /gaip-channel=config/);
      await page.locator('[data-config-log]').click();
      const dialog = page.locator('.gaip-organization-log-dialog[open]');
      await dialog.waitFor();
      const widths = await dialog.locator('col').evaluateAll(cols => cols.map(col => getComputedStyle(col).width));
      const expectedWidths = [150,120,112,128,220,96,280];
      const totalWidth = widths.reduce((sum, width) => sum + parseFloat(width), 0);
      widths.forEach((width, index) => assert.ok(Math.abs(parseFloat(width) / totalWidth - expectedWidths[index] / 1106) < 0.002, 'browser table retains the specified column proportions when expanding to fill the dialog'));
      await dialog.locator('[data-organization-log-close]').click();
      await dialog.waitFor({ state: 'hidden' });
      await page.locator('a[data-config-view="announcement-management"]').click();
      await page.waitForFunction(() => location.hash.includes('gaip-view=announcement-management'));
      const beforeRefresh = await readState();
      await page.reload();
      await page.locator('.gaip-config-toggle').waitFor();
      assert.equal((await readState()).hash, beforeRefresh.hash, 'refresh preserves current subview');
      const afterRefresh = await readState();
      await page.locator('[data-gaip-channel="learning"] a').click();
      await page.waitForFunction(() => location.hash.includes('gaip-channel=learning'));
      assert.equal((await readState()).session, afterRefresh.session);
      await page.goBack();
      await page.waitForFunction(() => location.hash.includes('gaip-view=announcement-management'));
      await page.goForward();
      await page.waitForFunction(() => location.hash.includes('gaip-channel=learning'));
      await page.evaluate(() => window.__GAIP_AI_NOTICE__.show());
      await page.locator('.gaip-ai-notice-confirm').click();
      assert.equal(await page.locator('[data-gaip-ai-notice-panel]').count(), 0);
      // A real hit-tested navigation click after close catches an invisible leftover mask.
      await page.locator('aside').getByText('产品中心', { exact: true }).click();
      await page.waitForFunction(() => location.hash.startsWith('#/product'));
      assert.equal((await readState()).session, afterRefresh.session);
      await page.setViewportSize({ width: 390, height: 844 });
      await page.evaluate(() => window.__GAIP_AI_NOTICE__.show());
      await page.locator('.gaip-ai-notice-confirm').click();
      assert.equal(await page.locator('[data-gaip-ai-notice-panel]').count(), 0);
      const baseline = JSON.parse(fs.readFileSync(path.join(root, 'outputs/standardization/20260922/browser/baseline-errors.json'), 'utf8'));
      assert.equal(baseline.browser, browser.version());
      assert.deepEqual(errors.filter(e => !baseline.errors.includes(e)), []);
      assert.deepEqual(missing, []);
      records.push({ entry, initial, config, beforeRefresh, afterRefresh, widths, errors, missing, passed: true });
      await page.close();
    }
    console.log('PASS: two file entries, parent expansion, same-document navigation, organization dialog widths/close, refresh/subview, back/forward, notice close and narrow notice interaction.');
  } finally {
    fs.writeFileSync(path.join(output, 'navigation-results.json'), JSON.stringify({ browser: browser.version(), records }, null, 2));
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
