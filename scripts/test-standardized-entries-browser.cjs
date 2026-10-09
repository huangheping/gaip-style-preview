#!/usr/bin/env node
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'outputs/standardization/20260922/root-entry-migration/browser');
fs.mkdirSync(output, { recursive: true });
fs.mkdirSync(output, { recursive: true });
(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  const results = [];
  try {
    const manifest = JSON.parse(fs.readFileSync(path.join(root, 'shared/config/project-structure.json'), 'utf8'));
    for (const channel of manifest.channels) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 980 } });
      const page = await context.newPage(), errors = [], missing = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('requestfailed', r => { if (r.url().startsWith('file:')) missing.push({ url: r.url(), failure: r.failure()?.errorText }); });
      await page.goto(pathToFileURL(path.join(root, channel.html)).href, { waitUntil: 'load' });
      await page.waitForTimeout(1400);
      const state = await page.evaluate(() => ({ hash: location.hash, base: document.baseURI, text: document.body.innerText.slice(0, 450), session: document.documentElement.dataset.gaipDocumentSession, brokenImages: [...document.images].filter(i => i.getAttribute('src') && i.complete && !i.naturalWidth).map(i => i.src) }));
      await page.screenshot({ path: path.join(output, channel.id + '.png'), fullPage: false });
      results.push({ id: channel.id, ...state, errors, missing });
      await context.close();
    }
    fs.writeFileSync(path.join(output, 'entry-results.json'), JSON.stringify({ browser: browser.version(), results }, null, 2));
    const baseline = JSON.parse(fs.readFileSync(path.join(root, 'outputs/standardization/20260922/browser/baseline-errors.json'), 'utf8'));
    assert.equal(baseline.browser, browser.version(), 'baseline must use the same browser');
    const problems = results.filter(r => r.errors.some(e => !baseline.errors.includes(e)) || r.missing.length || !r.session || r.brokenImages.length);
    assert.equal(problems.length, 0, JSON.stringify(problems, null, 2));
    console.log('PASS: all channel-owned file:// entries load without NEW page errors, missing local requests or broken images. Original WebGL file-origin error is recorded separately in baseline-errors.json.');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
