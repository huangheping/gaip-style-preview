// Actual shared sources in an isolated document, not business-page visual acceptance.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const root = path.resolve(__dirname, '..');
// All actual entry documents use the shared stylesheet; no preview-only copy.
const entries = fs.readdirSync(root).filter(f => f.endsWith('.html')).concat(['全局组件/index.html', '全局组件/弹窗预览.html', '全局组件/海报分享/index.html']);
for (const entry of entries) {
  assert.match(fs.readFileSync(path.join(root, entry), 'utf8'), /shared\/styles\/global-font\.css\?v=20260909-project-font-1/, entry);
}
const fontCSS = fs.readFileSync(path.join(root, 'shared/styles/global-font.css'), 'utf8');
const faces = [...fontCSS.matchAll(/@font-face\s*\{([^}]+)\}/g)].map(m => m[1]);
assert.equal(faces.length, 2);
for (const [i, weight] of [400, 700].entries()) {
  assert.match(faces[i], new RegExp('font-weight:\\s*' + weight));
  assert.match(faces[i], /font-family: "HarmonyOS Sans SC"/);
  assert.match(faces[i], new RegExp('HarmonyOS_Sans_SC_' + (weight === 400 ? 'Regular' : 'Bold') + '\\.ttf'));
}
const styles = ['shared/styles/global-modal.css', 'shared/styles/global-date-picker.css', 'features/workspace/workspace-update.css', 'features/config-center/config-center-content.css', 'shared/styles/global-table.css', 'shared/styles/global-filter-bar.css'];
for (const file of styles) assert.doesNotMatch(fs.readFileSync(path.join(root, file), 'utf8'), /@font-face|GAIP Form Section|GAIP Modal Title|GAIP Confirmation HarmonyOS/);
const fixture = `<!doctype html><meta charset="utf-8"><body data-gaip-page="workspace" data-gaip-page-type="dashboard" data-gaip-page-label="工作台"><main style="padding:24px;max-width:900px;margin:auto">
<div class="homeSectionHeader"><h2 id="workspace-title">工作台标题</h2></div>
<p id="page-copy">页面正文 Regular 本地字体</p><button id="page-button">页面按钮</button><p class="statLabel___wU7U1" id="workspace-label">工作台说明</p>
<input id="page-input" value="输入框正文"><textarea id="page-textarea">多行输入正文</textarea>
<div class="table___BX44I"><table><thead class="ant-table-thead"><tr><th id="table-heading">表头文字</th></tr></thead></table></div>
<div class="gaip-date-panel"><button class="gaip-date-panel__heading" id="date-heading">2026年09月</button></div>
<div class="ant-modal gaip-modal-kit" id="form"><div class="ant-modal-content"><div class="ant-modal-header"><h2 class="ant-modal-title">表单标题</h2></div><div class="ant-modal-body"><h3 class="gaip-kit-section-title"><span>表单分组标题</span></h3><p id="form-copy">表单正文</p></div><div class="ant-modal-footer"><button class="ant-btn-default">取消</button><button class="ant-btn-primary">保存</button></div></div></div></main>`;
const bold = ['#workspace-title', '#date-heading', '#form .ant-modal-title', '#form .gaip-kit-section-title span', '#confirm .gaip-modal__title span'];
const regular = ['#page-copy', '#page-button', '#workspace-label', '#page-input', '#page-textarea', '#table-heading', '#form-copy', '#form .ant-btn-primary', '#confirm .gaip-modal-confirm__message', '#confirm .gaip-modal-confirm__description', '#confirm .ant-btn-primary span'];
async function run() {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  try {
    for (const width of [1280, 640]) for (const lateFont of [false, true]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      const failures = [];
      page.on('pageerror', e => failures.push(e.message));
      const allowed = new Set([...styles, 'shared/styles/global-font.css', 'shared/scripts/global-modal.js', 'assets/fonts/HarmonyOS_Sans_SC_Regular.ttf', 'assets/fonts/HarmonyOS_Sans_SC_Bold.ttf']);
      await page.route('**/*', route => {
        const url = new URL(route.request().url()), file = url.pathname.slice(1);
        if (url.hostname !== 'fonts.test') return route.abort();
        if (!file) return route.fulfill({ contentType: 'text/html; charset=utf-8', body: fixture });
        if (!allowed.has(file)) { failures.push('Unexpected request: ' + file); return route.abort(); }
        return route.fulfill({ contentType: file.endsWith('.js') ? 'application/javascript; charset=utf-8' : file.endsWith('.css') ? 'text/css' : 'font/ttf', body: fs.readFileSync(path.join(root, file)) });
      });
      await page.goto('http://fonts.test/');
      if (!lateFont) await page.addStyleTag({ url: '/shared/styles/global-font.css' });
      for (const file of styles) await page.addStyleTag({ url: '/' + file });
      if (lateFont) await page.addStyleTag({ url: '/shared/styles/global-font.css' });
      await page.addScriptTag({ url: '/shared/scripts/global-modal.js' });
      await page.evaluate(async () => {
        const api = window.__GAIP_MODAL_COMPONENT__; api.adoptForm(document.querySelector('#form'));
        const d = api.createConfirm({ title: '删除部门确认', message: '请确认是否删除这个部门', description: '删除后无法恢复', confirmLabel: '确认删除' }).dialog;
        d.id = 'confirm'; document.body.append(d); d.querySelector('.gaip-modal__title').innerHTML = '<span>删除部门确认</span>'; d.setAttribute('open', ''); await document.fonts.ready;
      });
      const cdp = await page.context().newCDPSession(page); await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
      const { root: doc } = await cdp.send('DOM.getDocument');
      for (const selector of [...bold, ...regular]) {
        const weight = bold.includes(selector) ? '700' : '400';
        const actual = await page.locator(selector).evaluate(el => { const s = getComputedStyle(el); return { family: s.fontFamily, weight: s.fontWeight, synthesis: s.fontSynthesis }; });
        assert.deepEqual(actual, { family: '"HarmonyOS Sans SC", sans-serif', weight, synthesis: 'none' }, selector);
        if (['#page-input', '#page-textarea'].includes(selector)) continue; // Native input text lives in a UA shadow root.
        const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: doc.nodeId, selector });
        const { fonts } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId });
        const expected = weight === '700' ? 'HarmonyOS_Sans_SC_Bold' : 'HarmonyOS_Sans_SC';
        assert.ok(fonts.length && fonts.every(f => f.isCustomFont && (f.postScriptName ? f.postScriptName === expected : f.familyName === 'HarmonyOS Sans SC')), selector + ': ' + JSON.stringify(fonts));
      }
      await page.evaluate(() => { const d = document.querySelector('#confirm'); d.removeAttribute('open'); d.showModal(); });
      await page.keyboard.press('Escape'); assert.equal(await page.locator('dialog:modal').count(), 0);
      await page.evaluate(() => document.querySelector('#confirm').showModal()); assert.equal(await page.locator('dialog:modal').count(), 1);
      if (process.env.SCREENSHOT_PATH && width === 1280 && !lateFont) await page.screenshot({ path: process.env.SCREENSHOT_PATH });
      assert.deepEqual(failures, []); console.log('PASS actual local Regular/Bold: width=' + width + ', global font loaded last=' + lateFont); await page.close();
    }
  } finally { await browser.close(); }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
