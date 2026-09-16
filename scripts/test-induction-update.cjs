const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

async function checkSourceModules() {
  const source = { self: { webpackChunk: [] } };
  vm.runInNewContext(read('web/106.8af24840.async.js'), source);
  const factories = source.self.webpackChunk[0][1];
  const baseline = {};
  const define = (exports, getters) => Object.entries(getters).forEach(([key, get]) => Object.defineProperty(exports, key, { enumerable: true, get }));
  factories[23856]({ exports: baseline }, baseline, { d: define });
  const before = JSON.parse(JSON.stringify(baseline.Lg));
  const context = { Promise, window: {}, self: { webpackChunk: [] } };
  vm.runInNewContext(read('features/induction/induction-update.js'), context);
  const cache = {};
  const request = id => {
    if (!cache[id]) {
      const module = { exports: {} };
      cache[id] = module;
      request.m[id](module, module.exports, request);
    }
    return cache[id].exports;
  };
  let stored;
  request.m = { 92771: module => { module.exports = {
    G: progress => Promise.resolve(progress), A: progress => { stored = progress; return Promise.resolve(); }
  }; } };
  request.d = define;
  const queue = context.self.webpackChunk;
  queue[0][2](request);
  queue.push = chunk => Object.assign(request.m, chunk[1]);
  await Promise.resolve();
  queue.push([['source'], factories]);
  const data = request(23856);
  assert.equal(data.Q1, 12);
  for (let i = 0; i < data.Q1; i++) {
    const position = data.FF(i);
    assert.equal(data.qk(position.chapterIndex, position.sectionIndex), i);
  }
  assert.deepEqual(JSON.parse(JSON.stringify(data.Lg.filter((_, i) => i !== 1))), before.filter((_, i) => i !== 1), 'downloads, experts and other chapters preserved');
  assert.deepEqual(JSON.parse(JSON.stringify(data.Lg[1].sections[1])), { ...before[1].sections[2], label: '2.2 微信班级群规' });
  const progress = request(92771);
  for (const section of [1, 2]) assert.equal((await progress.G({ chapter: 1, section })).section, 1);
  await progress.A({ chapter: 1, section: 1 });
  assert.equal(stored.section, 2, 'persist original section coordinates');
  const later = { chapter: 2, section: 0 };
  assert.equal(await progress.G(later), later);
  console.log('PASS source modules: 12 sections, reversible offsets, original progress coordinates, untouched downloads/experts/other chapters.');
}

async function checkBrowser() {
  const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  try {
    const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const chapter = page.locator('.chapterTab___f0dZr');
    const title = page.locator('.contentTitle___WbQHn');
    const sections = page.locator('.sectionTab___Koi6V');
    for (const entry of ['薄荷入职指引.html', '工作台.html']) {
      await page.goto('file://' + path.join(root, entry));
      if (entry === '工作台.html') {
        await page.locator('.ant-menu-item').filter({ hasText: /^薄荷入职引导$/ }).click();
      }
      await chapter.filter({ hasText: '第2章 培训准备' }).click();
      assert.deepEqual(await sections.allTextContents(), ['2.1 GAIP学习中心', '2.2 微信班级群规']);
      assert.equal(await title.textContent(), '2.1GAIP学习中心');
      assert.deepEqual(await page.locator('.contentList___bAePJ li').allTextContents(), ['1. 打开学习中心', '2. 进入“薄荷新人班课程”，开启学习之旅']);
      assert.match(await page.locator('.progressText___DOW0x').textContent(), /12 \/ 12/);
      await page.getByRole('button', { name: '下一步', exact: true }).click();
      assert.equal(await title.textContent(), '2.2微信班级群规');
      assert.equal(await page.locator('.content12___CfKgO').count(), 1, 'group rules keeps source layout');
      assert.equal(await page.locator('.contentImage___r36pa').evaluate(image => image.complete && image.naturalWidth > 0), true);
      await page.getByRole('button', { name: '下一步', exact: true }).click();
      assert.match(await title.textContent(), /^3.1/);
      await page.getByRole('button', { name: '上一步', exact: true }).click();
      assert.equal(await title.textContent(), '2.2微信班级群规');
      await sections.first().click();
      await page.evaluate(() => { window.__inductionDocument = 'same'; });
      await page.locator('.contentList___bAePJ a').click();
      await page.waitForFunction(() => location.hash.includes('gaip-channel=learning') && document.querySelector('.gaip-learning-page'));
      assert.equal(await page.evaluate(() => window.__inductionDocument), 'same', 'learning link stays in the same document');
      await page.locator('.ant-menu-item').filter({ hasText: /^薄荷入职引导$/ }).click();
      await chapter.filter({ hasText: '第2章 培训准备' }).click();
      assert.deepEqual(await sections.allTextContents(), ['2.1 GAIP学习中心', '2.2 微信班级群规']);
      await page.reload();
      await chapter.filter({ hasText: '第2章 培训准备' }).click();
      assert.equal(await title.textContent(), '2.1GAIP学习中心');
    }
    if (process.env.INDUCTION_SCREENSHOT) await page.screenshot({ path: process.env.INDUCTION_SCREENSHOT });
    const unrelatedWebGL = errors.filter(message => /texImage2D.*cross-origin data/.test(message));
    assert.deepEqual(errors.filter(message => !unrelatedWebGL.includes(message)), []);
    console.log('PASS file:// Chromium: direct + workspace entry, chapter steps, group image/layout, learning link without reload, return and refresh. Known unrelated WebGL errors: ' + unrelatedWebGL.length);
  } finally { await browser.close(); }
}

(async () => { await checkSourceModules(); if (process.env.INDUCTION_BROWSER === '1') await checkBrowser(); })().catch(error => { console.error(error); process.exitCode = 1; });
