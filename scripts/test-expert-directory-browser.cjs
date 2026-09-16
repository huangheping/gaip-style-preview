const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const vm = require('node:vm');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const root = path.resolve(__dirname, '..');
const name = '周克勤William';
const source = { self: { webpackChunk: [] } };
vm.runInNewContext(fs.readFileSync(path.join(root, 'web/106.8af24840.async.js'), 'utf8'), source);
const baseline = {};
source.self.webpackChunk[0][1][23856]({ exports: baseline }, baseline, {
  d: (exports, getters) => Object.entries(getters).forEach(([key, get]) => Object.defineProperty(exports, key, { enumerable: true, get }))
});
const originalExperts = JSON.parse(JSON.stringify(baseline.Lg[4].sections[1]));

(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  try {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    async function checkDirectory(scope) {
      const card = scope.locator('.expertCard___gbEGp').filter({ hasText: name });
      assert.equal(await card.count(), 1);
      await card.scrollIntoViewIfNeeded();
      assert.deepEqual(await card.locator('.expertCardType___CoZU5').allTextContents(), ['美保专家', '综合专家']);
      const qr = card.locator('.expertQrCode___cX0uw img');
      assert.equal(await qr.count(), 1);
      assert.deepEqual(await qr.evaluate(image => [image.complete, image.naturalWidth, image.naturalHeight]), [true, 144, 144]);
      assert.ok((await qr.getAttribute('src')).endsWith('/shared/assets/expert-directory/zhou-keqin-william-qr.png'), 'use William’s supplied QR');
      const qrBox = await qr.boundingBox();
      const textBoxes = await card.locator('.expertCardExperiences___sFRaF p').evaluateAll(nodes => nodes.map(node => {
        const box = node.getBoundingClientRect();
        return { right: box.right, top: box.top, bottom: box.bottom };
      }));
      assert.ok(textBoxes.every(box => box.top >= qrBox.y + qrBox.height || box.bottom <= qrBox.y || box.right <= qrBox.x - 20), 'biography clears QR with a visible gap');
      assert.equal(await card.locator('.expertCardExperiences___sFRaF p').count(), 5);
      const photo = card.locator('.expertCardAvatar___dpYtz img');
      assert.deepEqual(await photo.evaluate(image => [image.complete, image.naturalWidth, image.naturalHeight]), [true, 300, 400]);
      assert.match(await photo.getAttribute('src'), /shared\/assets\/expert-directory\/zhou-keqin-william.jpg$/);
      const tags = await card.locator('.expertCardType___CoZU5').evaluateAll(nodes => nodes.map(node => {
        const rect = node.getBoundingClientRect();
        return { left: rect.left, right: rect.right, top: rect.top, background: getComputedStyle(node).backgroundColor };
      }));
      assert.ok(tags[1].left > tags[0].right, 'two distinct pills');
      assert.equal(tags[0].top, tags[1].top);
      assert.equal(tags[0].background, 'rgb(0, 0, 0)');
      for (const type of ['美保', '综合专家']) {
        const dock = scope.locator('.expertDockItem___Cbyuh').filter({ has: page.locator('.expertDockType___U2yIr', { hasText: new RegExp('^' + type + '$') }) });
        assert.match(await dock.textContent(), /周克勤William/);
      }
      assert.ok(await scope.locator('.expertQrCode___cX0uw').count() > 0, 'existing expert QR codes preserved');
      const data = await page.evaluate(() => JSON.parse(JSON.stringify(__GAIP_WEBPACK_REQUIRE__(23856).Lg[4].sections[1])));
      const profile = data.content.find(block => block.type === 'expertList').value.find(expert => expert.name === '周克勤William');
      assert.deepEqual(profile.tags, ['美保专家', '综合专家']);
      assert.equal(profile.qrCode, 'zhou-keqin-william-qr.png');
      // All existing directory entries must survive the shared extension.
      for (const block of data.content) {
        if (block.type === 'expertList') block.value = block.value.filter(expert => expert.name !== name);
        if (block.type === 'expertDock') block.list.forEach(line => { line.experts = line.experts.split('、').filter(value => value !== name).join('、'); });
      }
      assert.deepEqual(data, originalExperts);
      return card;
    }
    for (const first of ['产品中心.html', '薄荷入职指引.html']) {
      await page.goto('file://' + path.join(root, first));
      await page.waitForFunction(() => window.__GAIP_WEBPACK_REQUIRE__ && document.querySelector('.ant-menu-item'));
      await page.evaluate(() => { window.__expertDocument = 'same'; });
      for (const channel of (first === '产品中心.html' ? ['product', 'induction'] : ['induction', 'product'])) {
        const label = channel === 'product' ? '产品中心' : '薄荷入职引导';
        await page.locator('.ant-menu-item').filter({ hasText: new RegExp('^' + label + '$') }).click();
        if (channel === 'product') {
          const open = page.locator('.contactExpertBtn___kvnrO');
          await open.click();
          const modal = page.locator('.expertModal___Umr7b:visible');
          await modal.waitFor();
          await modal.evaluate(node => Promise.all(node.getAnimations({ subtree: true }).map(animation => animation.finished.catch(() => {}))));
          const card = await checkDirectory(modal);
          if (process.env.EXPERT_SCREENSHOT_DIR) await card.screenshot({ path: path.join(process.env.EXPERT_SCREENSHOT_DIR, 'william-product.png') });
          await modal.locator('.closeBtn___uJQP1').click();
          await modal.waitFor({ state: 'hidden' });
          await open.click();
          await modal.waitFor();
          assert.equal(await modal.locator('[data-expert-id="zhou-keqin-william"]').count(), 1, 'reopening does not duplicate expert');
          await modal.locator('.closeBtn___uJQP1').click();
          await modal.waitFor({ state: 'hidden' });
        } else {
          await page.locator('.chapterTab___f0dZr').filter({ hasText: '第5章 展业常备' }).click();
          await page.locator('.sectionTab___Koi6V').filter({ hasText: '5.2 专家库' }).click();
          const card = await checkDirectory(page.locator('.contentArea___DE9w1'));
          if (process.env.EXPERT_SCREENSHOT_DIR) await card.screenshot({ path: path.join(process.env.EXPERT_SCREENSHOT_DIR, 'william-induction.png') });
        }
        assert.equal(await page.evaluate(() => window.__expertDocument), 'same', 'channel transition preserves document');
      }
      await page.reload();
      await page.waitForFunction(() => window.__GAIP_WEBPACK_REQUIRE__?.m[23856]);
      assert.equal(await page.evaluate(() => __GAIP_WEBPACK_REQUIRE__(23856).Lg[4].sections[1].content.find(block => block.type === 'expertList').value.filter(expert => expert.name === '周克勤William').length), 1);
    }
    assert.deepEqual(errors.filter(message => !/texImage2D.*cross-origin data/.test(message)), []);
    console.log('PASS file:// Chromium: both entry orders, shared profile/photo/biography, distinct tags, both dock lines, supplied QR loaded, preserved existing experts, modal close/reopen, same-document navigation and refresh.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
