// Run with a parent watchdog: a MutationObserver loop can starve child timers.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

if (!process.argv.includes('--child')) {
  const result = spawnSync(process.execPath, [__filename, '--child'], { encoding: 'utf8', timeout: 20000 });
  assert.ok(!result.error, 'modal observer must yield to timers: ' + (result.error && result.error.message));
  assert.equal(result.status, 0, result.stderr || result.stdout);
  process.stdout.write(result.stdout);
} else {
  main().catch(error => { console.error(error); process.exit(1); });
}

async function main() {
  const { JSDOM } = require('jsdom');
  const root = path.resolve(__dirname, '..');
  const dom = new JSDOM('<!doctype html><body></body>', { runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window, d = w.document;
  const tick = () => new Promise(resolve => w.setTimeout(resolve, 20));
  w.eval(fs.readFileSync(path.join(root, 'shared/scripts/global-modal.js'), 'utf8'));
  await tick(); // DOMContentLoaded has started the actual shared observer.
  let refreshCalls = 0;
  for (let cycle = 0; cycle < 2; cycle++) {
    const warning = d.createElement('div');
    warning.className = 'ant-modal ant-modal-confirm ant-modal-confirm-warning';
    warning.innerHTML = '<div class="ant-modal-content"><div class="ant-modal-body"><div class="ant-modal-confirm-body-wrapper"><div class="ant-modal-confirm-body ant-modal-confirm-body-has-title"><span class="anticon anticon-exclamation-circle"><svg></svg></span><div class="ant-modal-confirm-paragraph"><span class="ant-modal-confirm-title">检测到账号已切换</span><div class="ant-modal-confirm-content">其他页面已登录账号 long_preview_account，请立即刷新页面。</div></div></div><div class="ant-modal-confirm-btns"><button class="ant-btn ant-btn-primary">立即刷新</button></div></div></div></div>';
    const originalNodes = [...warning.querySelectorAll('*')];
    const button = warning.querySelector('button');
    button.addEventListener('click', () => refreshCalls++);
    // Check the no-write contract while detached, before a regression can
    // starve the real observer's event loop. This assertion has no timing limit.
    w.__GAIP_MODAL_COMPONENT__.scanForms(warning);
    const detachedProbe = new w.MutationObserver(() => {});
    detachedProbe.observe(warning, { attributes: true, attributeFilter: ['class'], subtree: true });
    w.__GAIP_MODAL_COMPONENT__.scanForms(warning);
    assert.equal(detachedProbe.takeRecords().length, 0, 'unchanged adoption must be mutation-free');
    detachedProbe.disconnect();
    warning.className = 'ant-modal ant-modal-confirm ant-modal-confirm-warning';
    d.body.appendChild(warning);
    await tick();
    assert.ok(warning.matches('.gaip-modal--system-warning'));
    let mutations = 0;
    const probe = new w.MutationObserver(records => { mutations += records.length; });
    probe.observe(warning, { attributes: true, attributeFilter: ['class'], subtree: true });
    w.__GAIP_MODAL_COMPONENT__.scanForms(warning);
    w.__GAIP_MODAL_COMPONENT__.scanForms(warning);
    await tick();
    assert.equal(mutations, 0, 're-adoption of an unchanged warning must not write any class');
    probe.disconnect();
    warning.className = 'ant-modal ant-modal-confirm ant-modal-confirm-warning';
    button.className = 'ant-btn ant-btn-primary';
    await tick();
    assert.ok(warning.matches('.gaip-modal--system-warning'));
    assert.ok(button.matches('.gaip-modal__button--primary'));
    assert.deepEqual([...warning.querySelectorAll('*')], originalNodes);
    assert.equal(warning.querySelectorAll('button').length, 1);
    button.click();
    warning.remove();
    await tick();
  }
  assert.equal(refreshCalls, 2, 'original handler fires exactly once on each open');
  dom.window.close();
  console.log('PASS: actual modal observer settles; unchanged scans write nothing; class rerender, unmount/reopen and original warning handler survive (DOM, not visual QA).');
}
