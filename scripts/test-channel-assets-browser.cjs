'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'outputs/resource-consolidation/20260922');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH });
  const results = [];
  try {
    for (const entry of ['workspace', 'learning-center']) {
      const page = await browser.newPage(), missing = [];
      page.on('requestfailed', r => { if (r.url().startsWith('file:')) missing.push(r.url()); });
      await page.goto(pathToFileURL(path.join(root, 'channels', entry, 'index.html')).href);
      await page.waitForFunction(() => document.documentElement.dataset.gaipChannelFeatures === 'ready' && window.__GAIP_MODAL_COMPONENT__ && window.__GAIP_DATE_PICKER__);
      await page.evaluate(() => document.fonts.ready);
      const resources = await page.evaluate(() => [...document.querySelectorAll('link[rel="stylesheet"][href],script[src]')].map(n => ({ tag: n.tagName, url: n.href || n.src })));
      const keys = resources.map(r => r.tag + ':' + r.url);
      assert.equal(new Set(keys).size, keys.length, entry + ': no duplicate resource tags');
      const ai = resources.filter(r => r.tag === 'LINK' && decodeURI(r.url).includes('/components/ai-agent/'));
      assert.equal(ai.length, 1, entry + ': one AI stylesheet');
      const styles = await page.evaluate(() => [...document.styleSheets].filter(s => s.href && decodeURI(s.href).includes('/components/ai-agent/')).map(s => ({ url: s.href, disabled: s.disabled })));
      assert.equal(styles.length, 1); assert.equal(styles[0].disabled, false);
      assert.deepEqual(missing, [], entry + ': no failed local files');
      results.push({ entry, resources: resources.length, aiStyles: styles, missing });
      await page.close();
    }
    fs.mkdirSync(output, { recursive: true });
    fs.writeFileSync(path.join(output, 'asset-browser-results.json'), JSON.stringify(results, null, 2));
    console.log('PASS file://: two direct channel entries load each resource once; one loaded AI stylesheet; shared modal/date APIs available; no missing files.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
