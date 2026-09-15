// DOM contracts only; native top-layer geometry still needs browser QA.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');

function checkTypographyAndPreviewPaths() {
  const font = read('shared/styles/global-font.css');
  const modal = read('shared/styles/global-modal.css');
  // Latest contract: native width and behavior, only a shared modal palette.
  assert.doesNotMatch(font, /::-webkit-scrollbar|--gaip-scrollbar-size|--gaip-scrollbar-thumb-hover/);
  assert.match(font, /scrollbar-width:\s*auto\s*!important/);
  assert.match(font, /scrollbar-color:\s*var\(--gaip-scrollbar-thumb\) var\(--gaip-scrollbar-track\)\s*!important/);
  assert.doesNotMatch(modal, /::-webkit-scrollbar|--gaip-modal-scrollbar-size|--gaip-modal-scrollbar-hover/);
  assert.doesNotMatch(read('features/config-center/config-center-content.css'), /\.formModal____MTrk[^\n]*::-webkit-scrollbar/);
  // Both loading orders must select the same contract, including nested spans.
  // JSDOM retains var() expressions; this is not a font-rendering test.
  for (const order of [[font, modal], [modal, font]]) {
    const dom = new JSDOM('<head>' + order.map(css => '<style>' + css + '</style>').join('') + '</head><body><div class="gaip-modal"><div class="gaip-modal__title">确认<span>标题</span></div></div><div class="gaip-modal-form"><div class="gaip-modal__title"><div class="title___SrY2M"><span>表单标题</span></div></div></div><p>普通文字</p></body>');
    const w = dom.window;
    for (const title of w.document.querySelectorAll('.gaip-modal__title, .gaip-modal__title *')) {
      const style = w.getComputedStyle(title);
      assert.equal(style.fontFamily, 'var(--gaip-modal-title-font)');
      assert.equal(style.fontWeight, 'var(--gaip-modal-title-weight)');
      assert.equal(style.fontSize, 'var(--gaip-modal-title-size)');
      assert.equal(style.lineHeight, 'var(--gaip-modal-title-line-height)');
    }
    assert.equal(w.getComputedStyle(w.document.querySelector('p')).fontWeight, 'var(--gaip-global-font-weight)', 'body typography unchanged');
    w.close();
  }
  assert.match(modal, /--gaip-modal-title-size:\s*18px/);
  assert.match(modal, /--gaip-modal-title-weight:\s*700/);
  assert.match(modal, /--gaip-modal-title-line-height:\s*28px/);
  assert.match(font, /font-family: "HarmonyOS Sans SC";[\s\S]*?HarmonyOS_Sans_SC_Bold\.ttf[\s\S]*?font-weight: 700/);
  assert.match(font, /--gaip-modal-title-font:\s*var\(--gaip-global-font\)/);
  const ttf = fs.readFileSync(path.join(root, 'assets/fonts/HarmonyOS_Sans_SC_Bold.ttf'));
  let weight;
  for (let i = 0; i < ttf.readUInt16BE(4); i++) {
    const offset = 12 + i * 16;
    if (ttf.toString('ascii', offset, offset + 4) === 'OS/2') weight = ttf.readUInt16BE(ttf.readUInt32BE(offset + 8) + 4);
  }
  assert.equal(weight, 700, 'actual local font contains bold weight, not synthetic regular');
  const html = read('全局组件/弹窗预览.html');
  const dom = new JSDOM(html, { url: 'file://' + root + '/全局组件/弹窗预览.html?embed=config-member', runScripts: 'outside-only' });
  const assets = [...dom.window.document.querySelectorAll('link[href], script[src]')];
  const urls = assets.map(el => el.tagName === 'LINK' ? el.href : el.src);
  const setup = html.match(/document\.querySelectorAll\('link\[href\], script\[src\]'\)[\s\S]*?document\.head\.insertBefore\(base, document\.head\.firstChild\);/);
  assert.ok(setup, 'preview freezes existing URLs before changing base');
  dom.window.eval(setup[0]);
  assert.deepEqual(assets.map(el => el.tagName === 'LINK' ? el.href : el.src), urls, 'changing base must not redirect existing CSS/JS outside the project');
  assert.equal(decodeURI(new URL('shared/styles/global-font.css', dom.window.document.baseURI).pathname), root + '/shared/styles/global-font.css');
  dom.window.close();
  console.log('PASS: shared title contract, both CSS orders, real bold asset and preview base URL invariance (DOM/source checks)');
}

async function main() {
  checkTypographyAndPreviewPaths();
  const formCss = '/* Form content hierarchy only.' + read('shared/styles/global-modal.css').split('/* Form content hierarchy only.')[1].split('/* All ordinary modal scroll layers')[0];
  const scopeDom = new JSDOM('<style>' + formCss + '</style><div class="gaip-modal-form gaip-modal-kit"><div class="gaip-modal gaip-modal-kit"><div class="gaip-modal__form-body gaip-kit-section-heading gaip-kit-section-title gaip-kit-field-grid clueRoleHint___L8f3v gaip-bulk-upload-content">确认内容</div></div></div>');
  // A confirmation can be nested inside a form; descendant selectors must not
  // accidentally restyle its copy, headings or spacing.
  for (const rule of scopeDom.window.document.styleSheets[0].cssRules) {
    if (!rule.selectorText) continue;
    for (const node of scopeDom.window.document.querySelectorAll('.gaip-modal, .gaip-modal *')) {
      assert.ok(!node.matches(rule.selectorText), 'form-only rule excludes nested confirmation: ' + rule.selectorText);
    }
  }
  assert.ok(fs.existsSync(path.join(root, 'assets/fonts/HarmonyOS_Sans_SC_Bold.ttf')), 'section titles reuse the project bold face');
  assert.doesNotMatch(formCss, /@font-face|Medium\.ttf|GAIP Form Section/);
  assert.match(formCss, /font-family:\s*var\(--gaip-global-font\) !important;\s*font-weight:\s*700 !important/);
  scopeDom.window.close();
  const dom = new JSDOM('<!doctype html><body></body>', {
    url: 'file://' + root + '/登录.html#/workspace', runScripts: 'outside-only', pretendToBeVisual: true
  });
  const w = dom.window, d = w.document;
  const load = p => w.eval(read(p));
  w.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  w.HTMLDialogElement.prototype.close = function () { this.open = false; this.dispatchEvent(new w.Event('close')); };
  w.__GAIP_CONFIG_DIALOG_PREVIEW__ = true;
  [
    'shared/scripts/global-modal.js', 'shared/scripts/global-date-picker.js', 'shared/scripts/modal-controls.js', 'shared/config/channels.js',
    'shared/scripts/organization-store.js', 'shared/scripts/organization-tree.js', 'features/config-center/source-markup.js', 'features/config-center/config-center.js',
    'features/config-center/announcement-management-data.js', 'features/config-center/announcement-management-view.js',
    'features/proposal-center/proposal-center.js', 'features/activity/activity-sync.js',
    'features/wealth-center/mock-data.js', 'features/wealth-center/wealth-center.js'
  ].forEach(load);
  await new Promise(resolve => w.setTimeout(resolve, 30));
  const api = w.__GAIP_MODAL_COMPONENT__;
  const styleRules = new JSDOM('<style>' + read('shared/styles/global-modal.css') + '</style>');
  // JSDOM is not a full cascade engine. Assert source rule + real-node match and
  // !important against the normal legacy declarations, never claim pixel QA.
  const rules = [...styleRules.window.document.styleSheets[0].cssRules];
  function sharedRule(node, property, value) {
    assert.ok(node, 'real source target exists for ' + property);
    assert.ok(rules.some(rule => rule.selectorText && !rule.selectorText.includes('::') && rule.style.getPropertyValue(property) === value && rule.style.getPropertyPriority(property) === 'important' && node.matches(rule.selectorText)), node.className + ' has shared ' + property + ': ' + value);
  }
  const errorFixture = d.createElement('div');
  errorFixture.className = 'gaip-modal-form gaip-modal-kit gaip-modal-controls';
  errorFixture.innerHTML = '<div class="gaip-form-help ant-form-item-explain"><div class="gaip-kit-error ant-form-item-explain-error">必填</div></div>';
  sharedRule(errorFixture.querySelector('.gaip-form-help'), 'margin-top', '4px');
  sharedRule(errorFixture.querySelector('.gaip-kit-error'), 'margin-top', '0');
  const feedbackFixture = d.createElement('div');
  feedbackFixture.className = 'ant-modal';
  feedbackFixture.innerHTML = '<div class="ant-modal-header"><h2>新增沟通纪要</h2></div><div class="ant-modal-body"><div class="ant-form-item"><div class="ant-form-item-control"><div class="ant-form-item-control-input"><input></div></div></div><div class="gaip-modal"><div class="ant-form-item"><div class="ant-form-item-control"><input></div></div></div></div>';
  api.adoptForm(feedbackFixture);
  const antField = feedbackFixture.querySelector('.ant-form-item'), antControl = antField.querySelector('.ant-form-item-control');
  assert.ok(antControl.classList.contains('gaip-form-feedback-ant'));
  assert.ok(!feedbackFixture.querySelector('.gaip-modal .ant-form-item-control').classList.contains('gaip-form-feedback-ant'), 'nested confirmation excluded');
  antControl.insertAdjacentHTML('beforeend', '<div class="ant-form-item-additional" style="min-height:30px"><div class="ant-form-item-explain"><div class="ant-form-item-explain-error">很长的错误信息会自然换行，不遮盖正文</div></div><div class="ant-form-item-extra">永久帮助说明</div></div>');
  antField.insertAdjacentHTML('beforeend', '<div class="ant-form-item-margin-offset" style="margin-bottom:-20px"></div>');
  const nodes = [...feedbackFixture.querySelectorAll('*')];
  api.adoptForm(feedbackFixture); api.adoptForm(feedbackFixture);
  assert.deepEqual([...feedbackFixture.querySelectorAll('*')], nodes, 'feedback adapter only marks, never adds duplicate nodes');
  sharedRule(antControl.querySelector('.ant-form-item-additional'), 'min-height', 'var(--gaip-form-feedback-space)');
  sharedRule(antControl.querySelector('.ant-form-item-explain'), 'height', 'auto');
  sharedRule(antControl.querySelector('.ant-form-item-explain'), 'margin', '0');
  sharedRule(antControl.querySelector('.ant-form-item-extra'), 'margin', '0');
  sharedRule(antField.querySelector('.ant-form-item-margin-offset'), 'display', 'none');
  assert.match(read('shared/styles/global-modal.css'), /:has\(> \.ant-form-item-extra\):not\(:has\(> \.ant-form-item-explain\)\)::before/, 'permanent extra help does not consume the reserved error line');
  function countedPaddingContract(area) {
    // Inspect the competing shorthand declarations, not just the existence of
    // the desired rule. The old later inner-textarea rule tied specificity and
    // won in browsers; jsdom's computed styles do not resolve that reliably.
    const candidates = rules.map((rule, order) => ({ rule, order })).filter(({rule}) =>
      rule.selectorText && !rule.selectorText.includes('::') &&
      rule.style.getPropertyValue('padding') && area.matches(rule.selectorText));
    const scored = candidates.map(({rule, order}) => {
      assert.ok(!/[#:[(),]/.test(rule.selectorText), 'update the limited padding cascade check for new functional selectors: ' + rule.selectorText);
      const classes = (rule.selectorText.match(/\.[\w-]+/g) || []).length;
      const types = rule.selectorText.replace(/\.[\w-]+/g, '').trim().split(/\s+/).filter(Boolean).length;
      return { rule, score: [rule.style.getPropertyPriority('padding') === 'important' ? 1 : 0, classes, types, order] };
    }).sort((a,b) => { for (let i=0; i<a.score.length; i++) if (a.score[i] !== b.score[i]) return a.score[i]-b.score[i]; return 0; });
    assert.equal(scored.at(-1).rule.style.getPropertyValue('padding'), '10px 12px', 'counted textarea uses ordinary insets; count owns a separate flow row');
    const plainInner = rules.find(rule => rule.selectorText && rule.selectorText.endsWith('.gaip-form-textarea-shell:not(.gaip-kit-counted) textarea.gaip-form-control--inner'));
    assert.ok(plainInner && !area.matches(plainInner.selectorText), 'ordinary inner padding must exclude counted fields');
  }
  load('shared/scripts/global-modal.js');
  assert.equal(w.__GAIP_MODAL_COMPONENT__, api, 'duplicate channel loading retains one controller');
  const activityApi = w.__GAIP_ACTIVITY_SYNC__;
  load('features/activity/activity-sync.js');
  assert.equal(w.__GAIP_ACTIVITY_SYNC__, activityApi, 'activity runtime is idempotent across entry/preview loads');
  const activityAssets = w.__GAIP_CHANNEL_CONFIG__.getByKey('activity').assets;
  assert.ok(activityAssets.styles.some(p => p.startsWith('features/activity/activity-sync.css?')));
  assert.ok(activityAssets.scripts.some(p => p.startsWith('features/activity/activity-sync.js?')));
  assert.doesNotMatch(read('活动中心.html'), /(?:href|src)="\.\/features\/activity\/activity-sync\./, 'channel registry is the sole activity entry asset owner');
  const localStyles = new JSDOM('<head>' + ['features/activity/activity-sync.css', 'features/wealth-center/wealth-center.css', 'features/config-center/announcement-management.css'].map(p => '<style>' + read(p) + '</style>').join('') + '</head>');
  const localRules = [...localStyles.window.document.styleSheets].flatMap(sheet => [...sheet.cssRules]);
  function localRule(node, property, value) {
    assert.ok(localRules.some(r => r.selectorText && !r.selectorText.includes('::') && r.style.getPropertyValue(property) === value && node.matches(r.selectorText)), node.className + ' source has ' + property + ': ' + value);
  }
  const config = w.__GAIP_CONFIG_DIALOGS__;
  const factory = w.__GAIP_CONFIG_DIALOG_FACTORY__;
  const create = [
    ['04 方案客户归属', () => w.__GAIP_PROPOSAL_PREVIEW__.createOwnerDialog()],
    ['07 活动报名信息', () => w.__GAIP_ACTIVITY_SYNC__.createSignupModal()],
    ['08 保司关键词设置', () => w.__GAIP_WEALTH_CENTER__.createKeywordDialog()],
    ['10 配置中心成员编辑', () => config.openMember(1)],
    ['11 部门名称编辑', () => config.openDepartment('department-18', 'rename')],
    ['13 设置管理员', () => config.openDepartment('all', 'admin')],
    ['15 批量导入成员', () => config.openBulkImport()],
    ['16 调整节点', () => config.openAdjustNode(1)],
    ['33 新建公告', () => w.__GAIP_ANNOUNCEMENT_MANAGEMENT__.openCreate()],
    ['34 编辑公告', () => w.__GAIP_ANNOUNCEMENT_MANAGEMENT__.openEdit('announcement-1')]
  ];
  let checked = 0;
  for (const [label, open] of create) {
    const result = open();
    const el = result && result.nodeType === 1 ? result : d.querySelector('.gaip-announcement-dialog');
    assert.ok(el, label + ' actual source returns/opens a dialog');
    if (!el.isConnected) d.body.appendChild(el);
    api.scanForms(el);
    w.__GAIP_MODAL_CONTROLS__.scan();
    const form = el.matches('.gaip-modal-form') ? el : el.querySelector('.gaip-modal-form');
    assert.ok(form, label + ' adopted');
    assert.ok(form.classList.contains('gaip-modal-kit'), label + ' shares the interior kit');
    if (label.startsWith('07 ')) {
      const area = form.querySelector('#gaip-remark'), shell = area.closest('[data-gaip-modal-part="resizable-textarea"]');
      assert.ok(shell.classList.contains('gaip-form-textarea-shell'));
      const handle = shell.querySelector('.gaip-mc-resize-handle');
      assert.ok(handle, '07 real source uses the same shared handle without requiring a counter');
      assert.equal(handle.type, 'button', 'resize must not submit registration');
      assert.equal(shell.querySelector('.gaip-kit-count'), null, '07 does not gain an unrequested counter');
      sharedRule(area, 'resize', 'none'); sharedRule(handle, 'outline', 'none');
      assert.equal(area.maxLength, 500); assert.ok(area.required);
      area.value = '保留报名备注'; area.style.height = '54px';
      Object.defineProperty(area, 'offsetHeight', { configurable: true, get: () => parseFloat(area.style.height) });
      area.getBoundingClientRect = () => ({ height: area.offsetHeight });
      handle.dispatchEvent(new w.MouseEvent('pointerdown', { button: 0, clientY: 100, bubbles: true }));
      w.dispatchEvent(new w.MouseEvent('pointermove', { clientY: 130 })); w.dispatchEvent(new w.MouseEvent('pointerup', { clientY: 130 }));
      assert.equal(area.style.height, '84px');
      assert.equal(new w.FormData(area.form).get('remark'), '保留报名备注');
      area.disabled = true; w.__GAIP_MODAL_CONTROLS__.scan(); assert.ok(handle.disabled);
      area.disabled = false; w.__GAIP_MODAL_CONTROLS__.scan();
      assert.equal(shell.querySelectorAll('.gaip-mc-resize-handle').length, 1);
      const signup = area.form;
      assert.ok(signup.noValidate, '07 uses inline errors, not browser validation bubbles');
      const errors = [...signup.querySelectorAll('.gaip-form-help--error')];
      assert.equal(errors.length, 6, 'one message per field, including one per radio group');
      assert.ok(errors.every(error => error.hidden), 'no premature errors');
      assert.equal(signup.querySelectorAll('.gaip-form-feedback-local').length, 6, 'six persistent feedback hosts, not one per radio');
      const feedbackHosts = errors.map(error => error.parentElement);
      for (const host of feedbackHosts) {
        assert.ok(host.classList.contains('gaip-form-feedback-field'));
        sharedRule(host, 'margin-bottom', '0');
        assert.ok(host.matches(':has(> .gaip-form-feedback-message[hidden])'), 'empty error has an inert pseudo slot');
      }
      sharedRule(signup.querySelector('.gaip-form-feedback-grid'), 'row-gap', '0');
      area.value = '';
      const submitSignup = () => signup.dispatchEvent(new w.Event('submit', {bubbles:true,cancelable:true}));
      submitSignup();
      assert.ok(errors.every(error => !error.hidden), 'all required errors shown inline after submit');
      errors.forEach((error, i) => {
        assert.equal(error.parentElement, feedbackHosts[i], 'original feedback remains owned by source');
        assert.ok(!feedbackHosts[i].matches(':has(> .gaip-form-feedback-message[hidden])'), 'real message replaces, not stacks with, the pseudo slot');
        sharedRule(error, 'height', 'auto');
        sharedRule(error, 'min-height', 'var(--gaip-form-feedback-line)');
        sharedRule(error, 'white-space', 'normal');
      });
      assert.equal(d.activeElement.id, 'gaip-customer-name', 'first invalid field receives focus');
      sharedRule(errors[0], 'margin-top', '4px');
      sharedRule(errors[0], 'color', 'var(--gaip-form-error)');
      const nameInput = signup.querySelector('[name="customerName"]');
      assert.equal(nameInput.getAttribute('aria-describedby'), errors[0].id);
      nameInput.value = '客户'; nameInput.dispatchEvent(new w.Event('input',{bubbles:true}));
      assert.ok(errors[0].hidden); assert.ok(!errors[1].hidden, 'correcting one field preserves other errors');
      for (const [name, value] of Object.entries({intentionBusiness:'保障',intentionPremium:'-1',paymentTerm:'10年',remark:'备注'})) {
        const input = signup.elements.namedItem(name); input.value = value; input.dispatchEvent(new w.Event('input',{bubbles:true}));
      }
      assert.ok(!errors[2].hidden, 'numeric minimum preserved');
      const premium = signup.elements.namedItem('intentionPremium');
      premium.value = '1000000000'; premium.dispatchEvent(new w.Event('input',{bubbles:true}));
      assert.ok(!errors[2].hidden, 'numeric maximum preserved');
      premium.value = '10'; premium.dispatchEvent(new w.Event('input',{bubbles:true}));
      submitSignup(); assert.equal(d.activeElement.name, 'packageSubmitted', 'radio group becomes next invalid field');
      const radio = signup.querySelector('[name="packageSubmitted"]'); radio.checked = true; radio.dispatchEvent(new w.Event('change',{bubbles:true}));
      assert.ok(errors.every(error => error.hidden));
      submitSignup(); assert.ok(d.querySelector('.gaip-activity-toast'), 'valid form retains local simulated success');
      const again = w.__GAIP_ACTIVITY_SYNC__.createSignupModal();
      assert.ok([...again.querySelectorAll('.gaip-form-help--error')].every(error => error.hidden), 'fresh open does not inherit validation state');
    }
    if (/^(15|16) /.test(label)) {
      const error = form.querySelector('.gaip-bulk-file-error, .gaip-adjust-node-error');
      assert.ok(error.classList.contains('gaip-form-feedback-message'));
      assert.ok(error.parentElement.classList.contains('gaip-form-feedback-local'));
      sharedRule(form.querySelector('.gaip-kit-node-search'), 'width', '100%');
      sharedRule(form.querySelector('.gaip-kit-node-search'), 'height', '48px');
      sharedRule(form.querySelector('.gaip-kit-node-tree'), 'margin-top', '8px');
    }
    if (/^(33|34) /.test(label)) {
      assert.equal(form.querySelectorAll('.gaip-form-feedback-local').length, 2, 'announcement feedback is per validation group, not per translation/date control');
    }
    if (/^(07|08|15|16|33|34) /.test(label)) {
      const body = form.querySelector('.gaip-modal__form-body');
      sharedRule(body, 'padding-top', '0');
      if (label.startsWith('15 ')) sharedRule(body, 'padding-top', '20px');
      if (body.querySelector(':scope > .gaip-form-body-lead')) sharedRule(body.querySelector(':scope > .gaip-form-body-lead'), 'margin-top', '0');
    }
    const expectedParts = {
      '04': ['list', 'list-flat', 'list-row'], '07': ['field-grid', 'field', 'label'],
      '10': ['option-card', 'option-grid', 'field-grid'], '13': ['option-card', 'section'],
      '15': ['steps', 'list', 'section', 'error'], '16': ['list', 'summary', 'notice', 'error'],
      '33': ['count', 'counted', 'field'], '34': ['count', 'counted', 'field']
    }[label.slice(0, 2)] || [];
    for (const part of expectedParts) assert.ok(form.querySelector('.gaip-kit-' + part), label + ' adopts ' + part);
    assert.ok(form.querySelector('.gaip-modal__close--preserve'), label + ' shared close');
    assert.ok(form.querySelector('.gaip-modal__title'), label + ' shared title');
    if (/^(04|07) /.test(label)) {
      const subtitle = form.querySelector('.gaip-owner-subtitle, .gaip-activity-modal__subtitle');
      const parent = subtitle.parentNode, text = subtitle.textContent;
      assert.ok(subtitle.classList.contains('gaip-modal__subtitle'), label + ' uses shared subtitle');
      api.scanForms(el); api.scanForms(el);
      assert.equal(form.querySelectorAll('.gaip-modal__subtitle').length, 1);
      assert.equal(subtitle.parentNode, parent); assert.equal(subtitle.textContent, text);
    }
    assert.ok(form.querySelector('.gaip-modal__button--primary'), label + ' shared primary');
    assert.ok(!form.classList.contains('gaip-modal'), label + ' does not acquire confirmation geometry');
    const regions = api.getRegions(form);
    if (/^(07|08) /.test(label)) {
      const panel = el.querySelector('.gaip-activity-modal__panel, .gaip-wealth-modal');
      localRule(panel, 'display', 'flex');
      localRule(panel, 'flex-direction', 'column');
      localRule(panel, 'max-height', 'var(--gaip-modal-max-height, calc(100dvh - 48px))');
      localRule(regions.body, 'min-height', '0');
      localRule(regions.body, 'overflow-y', 'auto');
      assert.ok(!regions.body.contains(regions.header) && !regions.body.contains(regions.footer), label + ' header/footer remain outside scroll owner');
      if (label.startsWith('07 ')) {
        const innerForm = panel.querySelector('form');
        localRule(innerForm, 'display', 'flex');
        localRule(innerForm, 'min-height', '0');
        localRule(innerForm, 'overflow', 'hidden');
        assert.equal(regions.body.parentNode, innerForm);
        assert.equal(regions.footer.parentNode, innerForm);
        localRule(regions.header, 'flex', '0 0 auto');
        localRule(regions.footer, 'flex', '0 0 auto');
      } else {
        for (const node of [regions.header, regions.footer, ...regions.body.children]) localRule(node, 'flex-shrink', '0');
      }
    }
    if (/^(33|34) /.test(label)) {
      const innerForm = regions.body.querySelector(':scope > .gaip-announcement-form');
      sharedRule(regions.body, 'padding-inline', '24px');
      localRule(innerForm, 'padding', '0 0 24px');
      const narrowRules = localRules.filter(r => r.cssRules).flatMap(r => [...r.cssRules]);
      assert.ok(narrowRules.some(r => r.selectorText && innerForm.matches(r.selectorText) && r.style.getPropertyValue('padding') === '0 0 20px'), label + ' narrow inner form also has no duplicate horizontal padding');
    }
    for (const name of ['header', 'body', 'footer']) {
      assert.ok(regions[name], label + ' has real ' + name + ' region');
      assert.equal(regions[name].getAttribute('data-gaip-modal-region'), name);
    }
    const nodesBefore = [...form.querySelectorAll('*')];
    const parentsBefore = nodesBefore.map(node => node.parentNode);
    api.adoptRegions(form); api.adoptRegions(form); api.adoptInteriors(form); api.adoptInteriors(form);
    assert.deepEqual([...form.querySelectorAll('*')], nodesBefore, label + ' region adoption does not copy/remove nodes');
    nodesBefore.forEach((node, i) => assert.equal(node.parentNode, parentsBefore[i], label + ' retains DOM ownership'));
    if (label.startsWith('04 ')) assert.ok(regions.toolbar.matches('.gaip-owner-search-row'));
    if (label.startsWith('15 ')) {
      assert.ok(regions.steps.matches('.gaip-bulk-steps'));
      assert.ok(regions.feedback.matches('.gaip-bulk-drop-overlay'));
      assert.ok(!regions.body.contains(regions.footer), 'bulk footer is already outside body');
    }
    const fields = [...form.querySelectorAll('.gaip-form-control')];
    if (/^(07|08|10|11|33|34) /.test(label)) assert.ok(fields.length, label + ' actual fields share primitives');
    for (const field of fields) {
      assert.ok(!field.closest('.ant-select, .ant-picker, .ant-tree, table'), label + ' does not restyle specialized control internals');
      assert.ok(!['date', 'time', 'file', 'radio', 'checkbox', 'hidden'].includes(field.type));
    }
    if (label.startsWith('10 ')) {
      sharedRule(form.querySelector('.formRow___xgoev'), 'column-gap', 'var(--gaip-form-column-gap)');
      sharedRule(form.querySelector('.clueRoleHint___L8f3v'), 'font-size', 'var(--gaip-modal-caption-size)');
      sharedRule(form.querySelector('.clueRoleHint___L8f3v'), 'margin-top', '4px');
      assert.ok(form.querySelector('#domainAccount').disabled, 'member disabled account retained');
      assert.ok(form.querySelector('#mobilePhone').matches('.gaip-form-control--inner'));
      assert.ok(form.querySelector('#mobilePhone').closest('.gaip-form-input-shell').querySelector('.ant-input-clear-icon'), 'source clear control retained');
      assert.ok(form.querySelector('.gaip-form-label-stack'), 'member vertical labels share gap');
      sharedRule(form.querySelector('.memberRoleLabel___sY1qM'), 'font-size', 'var(--gaip-modal-body-size)');
      sharedRule(form.querySelector('.memberRoleLabel___sY1qM'), 'margin-bottom', '0');
    }
    if (label.startsWith('13 ')) {
      sharedRule(form.querySelector('.memberName___en782'), 'line-height', 'var(--gaip-modal-body-line)');
      sharedRule(form.querySelector('.memberAccount___ZQ6PA'), 'color', 'var(--gaip-modal-muted)');
      sharedRule(form.querySelector('.adminRoleCount___HgN9e'), 'font-size', 'var(--gaip-modal-caption-size)');
    }
    if (label.startsWith('15 ')) {
      sharedRule(form.querySelector('.gaip-bulk-section-heading h3'), 'font-weight', '700');
      sharedRule(form.querySelector('.gaip-bulk-section-heading'), 'margin-bottom', 'var(--gaip-form-section-heading-gap)');
      sharedRule(form.querySelector('.gaip-bulk-upload-section'), 'margin-top', 'var(--gaip-form-section-gap)');
      sharedRule(form.querySelector('.gaip-bulk-upload-heading'), 'padding-bottom', '0');
      sharedRule(form.querySelector('.gaip-bulk-upload-content'), 'padding-top', '0');
      sharedRule(form.querySelector('.gaip-bulk-current-target > strong'), 'color', 'var(--gaip-modal-muted)');
      sharedRule(form.querySelector('.gaip-bulk-field-label'), 'margin-bottom', 'var(--gaip-modal-label-gap)');
      sharedRule(form.querySelector('.gaip-bulk-channel-select'), 'margin-top', '0');
    }
    if (/^(33|34) /.test(label)) {
      assert.ok(form.querySelector('textarea.gaip-form-control[data-announcement-autosize]'), label + ' autosize attribute retained');
      assert.ok(form.querySelector('[data-count-for]'), label + ' source count retained');
      assert.ok(form.querySelector('.gaip-kit-counted-no-resize'));
      sharedRule(form.querySelector('[data-count-for]'), 'position', 'static');
      sharedRule(form.querySelector('.gaip-kit-counted'), 'padding', '0');
      sharedRule(form.querySelector('textarea.gaip-form-control'), 'padding', '10px 12px');
      for (const area of form.querySelectorAll('textarea[data-announcement-autosize]')) {
        countedPaddingContract(area);
        const value = '这是用于检查文本换行与计数的内容。'.repeat(10).slice(0, 100);
        area.value = value; area.dispatchEvent(new w.Event('input', {bubbles:true}));
        assert.equal(form.querySelector('[data-count-for="' + area.name + '"]').textContent, '100/100');
        assert.equal(area.maxLength, 100); countedPaddingContract(area);
      }
      sharedRule(form.querySelector('[data-count-for]'), 'inset', 'auto');
      const sections = form.querySelectorAll('.gaip-announcement-form-section');
      assert.equal(sections.length, 2);
      assert.ok([...sections].every(section => !section.classList.contains('gaip-kit-field')), 'structural groups do not acquire field bottom gaps');
      sharedRule(sections[1], 'margin-top', 'var(--gaip-form-section-gap)');
      sharedRule(sections[0].querySelector('.gaip-announcement-field:last-of-type'), 'margin-bottom', '0');
      sharedRule(sections[0].querySelector('.gaip-announcement-section-heading p'), 'color', 'var(--gaip-modal-muted)');
      sharedRule(sections[0].querySelector('.gaip-announcement-section-heading'), 'margin-bottom', 'var(--gaip-form-section-heading-gap)');
      sharedRule(sections[0].querySelector('.gaip-kit-section-title'), 'font-weight', '700');
    }
    if (/^(04|07|08|10|11|15|16) /.test(label)) {
      const field = form.querySelector('input.gaip-mc-text:not(:disabled):not([readonly]):not([type="number"])');
      assert.ok(field, label + ' representative editable field');
      const parent = field.parentElement;
      const shell = field.closest('.gaip-form-input-shell');
      const clearHost = shell || parent;
      field.value = '测试内容'; field.dispatchEvent(new w.Event('input', { bubbles: true }));
      w.__GAIP_MODAL_CONTROLS__.scan();
      const clears = clearHost.querySelectorAll('.gaip-mc-clear');
      assert.equal(clears.length, 1, label + ' has one clear, reuses source when available');
      assert.ok(!clears[0].hidden && !clears[0].classList.contains('gaip-mc-clear-unavailable'));
      clears[0].click();
      assert.equal(field.value, '', label + ' clear updates original field');
      assert.equal(field.parentElement, parent, label + ' never rewraps or moves the original input');
      w.__GAIP_MODAL_CONTROLS__.scan();
      assert.ok(clears[0].hidden || clears[0].classList.contains('gaip-mc-clear-unavailable'));
      if (field.type === 'search') assert.ok(shell.classList.contains('gaip-mc-search-shell'), label + ' same search prefix slot');
    }
    if (label.startsWith('15 ')) {
      form.querySelector('[data-bulk-sample]').click(); api.adoptForm(form);
      assert.ok(form.querySelector('.gaip-kit-attachment'), '15 uploaded file reuses attachment row');
      form.querySelector('[data-bulk-validate]').click(); api.adoptForm(form);
      assert.ok(form.querySelector('.gaip-kit-table-wrap .gaip-kit-table'), '15 validation reuses table kit');
      assert.equal(form.querySelectorAll('.gaip-kit-table tbody tr').length, 18, 'all validation rows remain');
      form.querySelector('[data-bulk-confirm]').click(); api.adoptForm(form);
      assert.ok(form.querySelector('.gaip-kit-result .gaip-kit-summary'), '15 result reuses summary kit');
      assert.ok(form.querySelector('.gaip-kit-result .gaip-modal__button--primary'), 'result primary action shares modal buttons');
      form.querySelector('[data-bulk-again]').click(); api.adoptForm(form);
      assert.ok(form.querySelector('.gaip-kit-steps')); assert.ok(form.querySelector('[data-bulk-validate]').disabled);
    }
    el.remove(); checked++;
  }
  // Read-only legacy Umi bundles are bridged by their exact business titles.
  // 18 uses Ant TextArea(showCount), not a bare input: border belongs to its affix shell.
  const rename = d.createElement('div'); rename.className = 'ant-modal';
  rename.innerHTML = '<div class="ant-modal-content"><div class="ant-modal-header"><div class="ant-modal-title">编辑对话名称</div></div><div class="ant-modal-body"><span class="ant-input-affix-wrapper ant-input-textarea-affix-wrapper ant-input-textarea-show-count"><textarea class="ant-input" maxlength="100" style="height:48px;min-height:48px;resize:none">测试名称</textarea><span class="ant-input-suffix"><span class="ant-input-data-count">4 / 100</span></span></span></div></div>';
  d.body.appendChild(rename); api.scanForms(rename); w.__GAIP_MODAL_CONTROLS__.scan();
  const renameField = rename.querySelector('textarea'), renameShell = renameField.parentElement, renameCounter = rename.querySelector('.ant-input-data-count');
  assert.ok(renameShell.matches('.gaip-form-input-shell.gaip-form-textarea-shell'));
  assert.ok(renameShell.classList.contains('gaip-kit-counted'));
  assert.ok(renameCounter.classList.contains('gaip-kit-count'));
  assert.ok(renameField.matches('.gaip-form-control.gaip-form-control--inner'));
  countedPaddingContract(renameField);
  // JSDOM cannot lay out pseudo-elements: test the source override and exact
  // host scope rather than claim a rendered top-gap measurement.
  const strutRule = rules.find(rule => rule.selectorText === '.gaip-modal-controls.gaip-modal-controls.gaip-modal-controls .gaip-form-input-shell.gaip-form-textarea-shell::before');
  assert.ok(strutRule, 'Ant textarea baseline strut is explicitly removed');
  for (const property of ['content', 'display']) {
    assert.equal(strutRule.style.getPropertyValue(property), 'none');
    assert.equal(strutRule.style.getPropertyPriority(property), 'important');
  }
  const strutHostSelector = strutRule.selectorText.replace(/::before$/, '');
  assert.ok(renameShell.matches(strutHostSelector));
  const singleShell = d.createElement('span');
  singleShell.className = 'ant-input-affix-wrapper gaip-form-input-shell';
  rename.querySelector('.ant-modal-body').appendChild(singleShell);
  assert.ok(!singleShell.matches(strutHostSelector), 'single-line affix layout is untouched');
  singleShell.remove();
  sharedRule(renameShell, 'padding', '0');
  sharedRule(renameField, 'min-height', 'calc(var(--gaip-modal-body-line) + 20px)');
  sharedRule(renameCounter, 'inset', 'auto');
  let renameChanges = 0; renameField.addEventListener('input', () => renameChanges++);
  renameField.value = '更新名称'; renameField.style.height = '70px'; renameField.dispatchEvent(new w.Event('input', { bubbles: true }));
  api.scanForms(rename); w.__GAIP_MODAL_CONTROLS__.scan();
  assert.equal(renameField.parentElement, renameShell); assert.equal(rename.querySelector('.ant-input-data-count'), renameCounter);
  assert.equal(renameField.maxLength, 100); assert.equal(renameField.style.height, '70px'); assert.equal(renameChanges, 1);
  assert.equal(renameField.value, '更新名称');
  renameField.disabled = true; api.scanForms(rename);
  assert.equal(renameField.parentElement, renameShell, 'disabled textarea retains its original shell');
  assert.equal(renameField.value, '更新名称');
  assert.ok(rules.some(rule => rule.selectorText && rule.selectorText.includes(':has(textarea:disabled)') && rule.style.getPropertyValue('cursor') === 'not-allowed'), 'disabled textarea shell shares disabled interaction styling');
  rename.remove();
  // A fixed overlay count can overlap text at intermediate scroll positions,
  // even with bottom padding. Keep the original count outside that viewport.
  for (const [title, rows, limit] of [['编辑-客户资料介绍', 10, 500], ['新增沟通纪要', 5, 5000]]) {
    const counted = d.createElement('div'); counted.className = 'ant-modal';
    counted.innerHTML = '<div class="ant-modal-content"><div class="ant-modal-title"></div><div class="ant-modal-body"><span class="ant-input-affix-wrapper ant-input-textarea-affix-wrapper ant-input-textarea-show-count"><textarea class="ant-input" style="resize:vertical"></textarea><span class="ant-input-suffix"><span class="ant-input-data-count">0 / ' + limit + '</span></span></span></div></div>';
    counted.querySelector('.ant-modal-title').textContent = title;
    const area = counted.querySelector('textarea'), counter = counted.querySelector('.ant-input-data-count');
    area.rows = rows; area.maxLength = limit;
    d.body.appendChild(counted); api.scanForms(counted); w.__GAIP_MODAL_CONTROLS__.scan();
    const shell = area.parentElement;
    assert.ok(shell.matches(strutHostSelector), title + ' removes the same baseline strut');
    sharedRule(shell, 'padding', '0');
    sharedRule(area, 'display', 'block');
    sharedRule(area, 'padding', '10px 12px');
    countedPaddingContract(area);
    sharedRule(counter, 'inset', 'auto');
    sharedRule(counter, 'position', 'static');
    sharedRule(counter, 'display', 'block');
    sharedRule(counter, 'float', 'none');
    sharedRule(counter, 'padding', '0 12px 4px');
    assert.ok(!area.contains(counter), 'count is outside the scrollable textarea');
    // Ensure no later matching declaration reinstates an absolute overlay.
    const positions = rules.filter(r => r.selectorText && !r.selectorText.includes('::') && r.style.getPropertyValue('position') && counter.matches(r.selectorText));
    assert.ok(positions.length && positions.every(r => r.style.getPropertyValue('position') === 'static'), 'shared count has no competing absolute/fixed positioning');
    for (const top of [0, 100, 1000]) {
      area.value = '长文本\n'.repeat(100); area.scrollTop = top;
      assert.equal(counter.parentNode.closest('.gaip-kit-counted'), shell);
      sharedRule(counter, 'position', 'static');
    }
    sharedRule(counter, 'transform', 'none');
    assert.equal(area.style.resize, 'vertical', 'native resize remains available');
    assert.equal(area.rows, rows); assert.equal(area.maxLength, limit);
    let changed = 0; area.addEventListener('input', () => { changed++; counter.textContent = area.value.length + ' / ' + limit; });
    area.value = '更新纪要'; area.dispatchEvent(new w.Event('input', {bubbles:true}));
    api.scanForms(counted);
    assert.equal(changed, 1); assert.equal(counter.textContent, '4 / ' + limit);
    assert.equal(area.parentElement, shell); assert.equal(counted.querySelector('.ant-input-data-count'), counter);
    counted.remove();
  }
  const titles = ['编辑对话名称', '分配线索', '标记已转化', '新增线索', '编辑-客户资料介绍', '新增沟通纪要'];
  for (const title of titles) {
    const el = d.createElement('div'); el.className = 'ant-modal';
    el.innerHTML = '<div class="ant-modal-content"><button class="ant-modal-close"><span class="ant-modal-close-x"><svg></svg></span></button><div class="ant-modal-header"><div class="ant-modal-title"></div></div><div class="ant-modal-body"><input value="保留输入"><textarea>保留正文</textarea></div><div class="ant-modal-footer"><button class="ant-btn-default">取消</button><button class="ant-btn-primary" disabled>保存</button></div></div>';
    el.querySelector('.ant-modal-title').textContent = title;
    const field = el.querySelector('input'), icon = el.querySelector('svg'), close = el.querySelector('button');
    let clicks = 0; close.addEventListener('click', () => clicks++);
    d.body.appendChild(el);
    await new Promise(resolve => w.setTimeout(resolve, 0));
    assert.ok(el.classList.contains('gaip-modal-form'), title + ' automatically adopted');
    api.scanForms(el); api.scanForms(el);
    assert.equal(el.querySelector('input'), field);
    assert.equal(field.value, '保留输入');
    assert.equal(el.querySelector('svg'), icon, 'React-owned child identity preserved');
    assert.equal(el.querySelector('.gaip-modal__button--primary').disabled, true);
    close.click(); assert.equal(clicks, 1, 'original handler fires once');
    el.querySelector('.ant-modal-footer').innerHTML = '<button class="ant-btn-primary">下一步</button>';
    await new Promise(resolve => w.setTimeout(resolve, 0));
    assert.ok(el.querySelector('.gaip-modal__button--primary'), 'dynamic footer adopts shared button');
    assert.equal(api.getRegions(el).footer.dataset.gaipModalRegion, 'footer');
    el.remove(); checked++;
  }
  const excluded = d.createElement('div');
  // State changes must not replace React fields, lose live handlers, or mark selectors.
  const fieldsDialog = d.createElement('div'); fieldsDialog.className = 'ant-modal';
  fieldsDialog.innerHTML = '<div class="ant-modal-title">编辑对话名称</div><div class="ant-modal-body"><form class="ant-form-vertical"><div class="ant-form-item"><div class="ant-form-item-label"><label for="field">名称</label></div><span class="ant-input-affix-wrapper"><input id="field" class="ant-input" required value="原始名称"><button type="button" class="ant-input-clear-icon">清除</button></span><div class="ant-form-item-explain"><div class="ant-form-item-explain-error" hidden>原校验错误</div></div></div><textarea rows="1" maxlength="100" style="height:48px;min-height:48px;max-height:112px;resize:none">原正文</textarea><span data-count>3/100</span><div class="ant-select"><input type="text" role="combobox"></div><input type="date"><input type="search"><input type="file"><label><input type="checkbox">保留选择</label><input type="text" disabled value="不能编辑"><input type="text" readonly value="只读"><div data-gaip-form-field="exclude"><input type="text"></div></form></div>';
  const field = fieldsDialog.querySelector('#field'), area = fieldsDialog.querySelector('textarea');
  const inline = area.getAttribute('style');
  let inputs = 0; field.addEventListener('input', () => inputs++);
  fieldsDialog.querySelector('button').addEventListener('click', () => { field.value = ''; field.dispatchEvent(new w.Event('input', { bubbles: true })); });
  d.body.appendChild(fieldsDialog); api.scanForms(fieldsDialog);
  assert.equal(field, fieldsDialog.querySelector('#field'));
  assert.equal(field.required, true); assert.equal(field.getAttribute('aria-invalid'), null, 'pristine required field is not made erroneous');
  assert.equal(area.getAttribute('style'), inline, 'autosize geometry is not rewritten');
  assert.equal(area.maxLength, 100); assert.equal(area.rows, 1);
  assert.equal(fieldsDialog.querySelector('input[readonly]').readOnly, true);
  assert.equal(fieldsDialog.querySelector('input[disabled]').disabled, true);
  assert.ok(area.classList.contains('gaip-form-control'));
  assert.ok(fieldsDialog.querySelector('.gaip-form-help'));
  for (const el of fieldsDialog.querySelectorAll('.ant-select input, input[type="date"], input[type="search"], input[type="file"], input[type="checkbox"], [data-gaip-form-field="exclude"] input')) assert.ok(!el.classList.contains('gaip-form-control'));
  fieldsDialog.querySelector('button').click(); assert.equal(field.value, ''); assert.equal(inputs, 1);
  field.value = '重新输入'; field.setSelectionRange(1, 3); api.scanForms(fieldsDialog);
  assert.equal(field.value, '重新输入'); assert.equal(field.selectionStart, 1); assert.equal(field.selectionEnd, 3);
  field.className = 'ant-input ant-input-status-error'; field.setAttribute('aria-invalid', 'true');
  await new Promise(resolve => w.setTimeout(resolve, 0));
  assert.ok(field.classList.contains('gaip-form-control'), 'React validation className updates reattach shared primitives');
  assert.equal(field.getAttribute('aria-invalid'), 'true');
  assert.ok(fieldsDialog.querySelector('.ant-form-item-explain-error').hidden, 'adapter never displays validation messages itself');
  fieldsDialog.remove();
  // Exact legacy structural differences from the read-only Umi bundles.
  const special = [
    ['分配线索', '', '<div class="footer___amsp6"><button class="btnCancel___BC6q2">取消</button><button class="btnConfirm___j71RF">确认分配</button></div>'],
    ['标记已关闭', '', '<div class="footer___pW89H"><button class="btnCancel___JnnA7">取消</button><button class="btnClose___llxYq">确认关闭</button></div>'],
    ['新增线索', '', '<div class="ant-modal-footer"><div class="footerBtns___wyrn2"><button class="cancelBtn___mjxUZ">取消</button><button class="submitBtn___T1eTe">保存线索</button></div></div>'],
    ['', 'modal___wKSui', '<div class="header___EnI5B"><h3>沟通纪要</h3><span class="anticon anticon-close closeIcon___OJKYP"><svg></svg></span></div><div class="footer___ea4l8"><button class="ant-btn-primary">保存</button></div>']
  ];
  for (const [title, cls, body] of special) {
    const el = d.createElement('div'); el.className = 'ant-modal ' + cls;
    el.innerHTML = '<div class="ant-modal-content">' + (title ? '<button class="ant-modal-close"></button><div class="ant-modal-header"><div class="ant-modal-title">' + title + '</div></div>' : '') + '<div class="ant-modal-body">' + body + '</div></div>';
    api.scanForms(el);
    assert.ok(el.querySelector('.gaip-modal__title'));
    assert.ok(el.querySelector('.gaip-modal__close'));
    assert.ok(el.querySelector('.gaip-modal__button--primary'), title || cls);
    assert.ok(el.dataset.gaipModalNestedRegions.includes('footer'), 'legacy nested footer is recorded, not moved');
    if (cls === 'modal___wKSui') {
      assert.ok(el.dataset.gaipModalNestedRegions.includes('header'));
      const footer = el.querySelector('.footer___ea4l8');
      assert.ok(footer.classList.contains('gaip-modal__form-footer--standard'));
      sharedRule(footer, 'border-top', '1px solid rgba(47,54,64,.08)');
      sharedRule(footer, 'margin-inline', 'calc(0px - var(--gaip-modal-space))');
      sharedRule(footer, 'padding-inline', 'var(--gaip-modal-space)');
      assert.equal(footer.parentElement, el.querySelector('.ant-modal-body'), '24 footer is never reparented');
      assert.equal(footer.querySelectorAll('button').length, 1, '24 remains save-only');
    }
    if (title === '新增线索') sharedRule(el.querySelector('.footerBtns___wyrn2'), 'padding', '0');
  }
  const intro = d.createElement('div'); intro.className = 'ant-modal editIntroModal___beZtT';
  intro.innerHTML = '<div class="ant-modal-content"><div class="ant-modal-header"><div class="ant-modal-title"><div class="editIntroModalHeader___Ucvov"><span>编辑-客户资料介绍</span><div class="editIntroModalActions___xav5R"><span>取消</span><span>保存</span></div></div></div></div><div class="ant-modal-body"><textarea>原始资料</textarea></div></div>';
  let cancels = 0, saves = 0;
  const originalActions = intro.querySelectorAll('.editIntroModalActions___xav5R span');
  originalActions[0].addEventListener('click', () => cancels++);
  originalActions[1].addEventListener('click', () => saves++);
  api.scanForms(intro);
  assert.equal(intro.querySelectorAll('[data-gaip-form-proxy-footer]').length, 1);
  const introFooter = intro.querySelector('[data-gaip-form-proxy-footer]');
  assert.ok(introFooter.matches('.gaip-modal__form-footer.gaip-modal__form-footer--standard.gaip-modal__actions'));
  sharedRule(introFooter, 'display', 'flex');
  sharedRule(introFooter, 'justify-content', 'flex-end');
  sharedRule(introFooter, 'gap', 'var(--gaip-modal-action-gap)');
  sharedRule(introFooter, 'border-top', '1px solid rgba(47,54,64,.08)');
  const proxyButtons = introFooter.querySelectorAll('button');
  assert.equal(proxyButtons.length, 2);
  for (const button of proxyButtons) {
    assert.ok(button.matches('.gaip-modal__button.gaip-form-part'), '23 proxy renders with shared button identity on first pass');
    sharedRule(button, 'height', 'var(--gaip-modal-button-height)');
  }
  // Class replacement must be repaired without duplicating proxy DOM or listeners.
  proxyButtons[0].className = 'ant-btn-default';
  proxyButtons[1].className = 'ant-btn-primary';
  api.scanForms(intro); api.scanForms(intro);
  assert.equal(intro.querySelector('[data-gaip-form-proxy-footer]'), introFooter);
  assert.equal(intro.querySelectorAll('[data-gaip-form-proxy-footer]').length, 1);
  assert.ok([...proxyButtons].every(button => button.matches('.gaip-modal__button.gaip-form-part')));
  intro.querySelector('.gaip-modal__close').click();
  intro.querySelector('.gaip-modal__button--primary').click();
  assert.equal(cancels, 1); assert.equal(saves, 1);
  assert.equal(intro.querySelector('textarea').value, '原始资料');
  assert.equal(intro.querySelector('.editIntroModalActions___xav5R span'), originalActions[0]);
  // Real legacy parent relationships, not an invented flat header/body/footer.
  // CSS source contracts cannot prove browser dimensions or clipping.
  const meeting = d.createElement('div'); meeting.className = 'ant-modal modal___wKSui';
  meeting.innerHTML = '<div class="ant-modal-content"><div class="ant-modal-body"><div class="header___EnI5B"><h3>沟通纪要</h3><div><span class="closeIcon___OJKYP"></span></div></div><form class="form___mvOSV"><div class="ant-form-item"><textarea rows="5" maxlength="5000"></textarea></div><div class="ant-form-item-explain-error" hidden>请输入沟通纪要</div></form><div class="footer___ea4l8"><button class="ant-btn-primary">保存</button></div></div></div>';
  api.scanForms(meeting);
  function layoutRule(node, property, value) {
    assert.ok(rules.some(r => r.selectorText && !r.selectorText.includes('::') && r.style.getPropertyValue(property) === value && node.matches(r.selectorText)), node.className + ' has scroll layout ' + property + ': ' + value);
  }
  for (const [id, el] of [['23', intro], ['24', meeting]]) {
    const regions = api.getRegions(el), surface = el.querySelector('.ant-modal-content');
    const scroll = id === '23' ? regions.body : regions.body.querySelector(':scope > form');
    layoutRule(surface, 'display', 'flex');
    layoutRule(surface, 'flex-direction', 'column');
    layoutRule(surface, 'max-height', 'var(--gaip-modal-max-height, calc(100dvh - 48px))');
    layoutRule(surface, 'overflow', 'hidden');
    layoutRule(regions.body, 'min-height', '0');
    layoutRule(scroll, 'flex', '1 1 auto');
    layoutRule(scroll, 'min-height', '0');
    layoutRule(scroll, 'overflow-y', 'auto');
    assert.ok(!scroll.contains(regions.header) && !scroll.contains(regions.footer), id + ' head/footer are outside actual scroll owner');
    const nodes = [...el.querySelectorAll('*')], parents = nodes.map(n => n.parentNode);
    scroll.querySelector('textarea').value = '长文本'.repeat(100);
    api.scanForms(el); api.scanForms(el);
    assert.deepEqual(nodes.map(n => n.parentNode), parents, id + ' retains all React parent relationships');
    assert.equal(scroll.querySelector('textarea').value.length, 300);
    if (id === '24') {
      layoutRule(regions.body, 'display', 'flex');
      layoutRule(regions.body, 'overflow', 'hidden');
      sharedRule(regions.body, 'padding', '0');
      sharedRule(regions.body, 'padding-inline', 'var(--gaip-modal-space)');
      sharedRule(regions.header, 'padding-inline', '0 40px');
      sharedRule(regions.footer, 'margin-inline', 'calc(0px - var(--gaip-modal-space))');
      layoutRule(scroll, 'margin-inline', 'calc(0px - var(--gaip-modal-space))');
      layoutRule(scroll, 'padding-inline', 'var(--gaip-modal-space)');
      assert.equal(scroll.querySelector('.ant-form-item-explain-error').hidden, true);
      const footerButton = regions.footer.querySelector('button');
      let calls = 0; footerButton.addEventListener('click', () => calls++);
      footerButton.disabled = true; footerButton.click(); assert.equal(calls, 0);
      footerButton.disabled = false; footerButton.click(); assert.equal(calls, 1);
    }
  }
  const scrollRules = rules.filter(r => r.selectorText && r.style.getPropertyValue('max-height') === 'var(--gaip-modal-max-height, calc(100dvh - 48px))');
  const other = d.createElement('div'); other.className = 'ant-modal gaip-modal-form'; other.innerHTML = '<div class="ant-modal-content"></div>';
  assert.ok(!scrollRules.some(r => other.firstElementChild.matches(r.selectorText)), '23/24 height rule does not opt in other form dialogs');
  console.log('PASS: 23 body / 24 nested form scroll contracts; retained nodes, values, disabled save and shared inset ownership (source/DOM only)');
  excluded.innerHTML = '<div class="ant-modal agentModal___Nxp06"><div class="ant-modal-title">编辑对话名称</div></div><div class="ant-drawer"><div class="ant-modal"><div class="ant-modal-title">新增线索</div></div></div><div class="ant-modal"><div class="ant-modal-title">操作日志</div></div>';
  api.scanForms(excluded);
  assert.equal(excluded.querySelectorAll('.gaip-modal-form').length, 0, 'Agent main, drawers and information dialogs excluded');
  assert.equal(excluded.querySelectorAll('.gaip-modal-kit').length, 0, 'interior components never attach to excluded categories');
  assert.equal(excluded.querySelectorAll('[data-gaip-modal-region], [data-gaip-modal-regions]').length, 0, 'information, drawers and Agent receive no region marks');
  assert.equal(api.adoptRegions(excluded.lastElementChild), null, 'region API rejects unadopted information dialog');
  const confirmation = factory.createDepartmentDialog('delete');
  const parts = api.adopt(confirmation);
  assert.equal(parts.regions.header.dataset.gaipModalRegion, 'header');
  assert.equal(parts.regions.body.dataset.gaipModalRegion, 'body');
  assert.equal(parts.regions.footer.dataset.gaipModalRegion, 'footer');
  assert.equal(parts.regions.close.dataset.gaipModalControl, 'close');
  const css = read('shared/styles/global-modal.css');
  assert.match(css, /\.gaip-modal-form\.gaip-modal-form\.gaip-modal-form \.gaip-modal__close:where\(\.gaip-form-part\),\s*\.gaip-modal \.gaip-modal__close\s*\{/);
  assert.match(css, /\.gaip-modal-form\.gaip-modal-form\.gaip-modal-form \.gaip-modal__button:where\(\.gaip-form-part\),\s*\.gaip-modal \.gaip-modal__button\s*\{/);
  assert.match(css, /--gaip-form-control-height:\s*48px/);
  assert.match(css, /--gaip-radius-control:\s*4px/);
  assert.match(css, /--gaip-radius-container:\s*8px/);
  assert.match(css, /--gaip-form-control-radius:\s*var\(--gaip-radius-control\)/);
  assert.match(css, /--gaip-modal-body-size:\s*14px/);
  assert.match(css, /--gaip-modal-body-line:\s*22px/);
  assert.match(css, /--gaip-form-text-size:\s*var\(--gaip-modal-body-size\)/);
  assert.match(css, /--gaip-form-text-line:\s*var\(--gaip-modal-body-line\)/);
  assert.match(css, /--gaip-form-textarea-end-space:\s*62px/);
  const style = d.createElement('style'); style.textContent = css; d.head.appendChild(style);
  const spacingRule = Array.from(style.sheet.cssRules).find(rule => rule.selectorText === '.gaip-modal .gaip-modal__footer > .gaip-modal__button');
  assert.ok(spacingRule, 'all shared confirmation buttons use one margin reset');
  assert.equal(spacingRule.style.getPropertyValue('margin'), '0');
  assert.equal(spacingRule.style.getPropertyPriority('margin'), 'important', 'must beat normal scoped Ant sibling margins');
  for (const button of [parts.cancel, parts.confirm]) assert.ok(button.matches(spacingRule.selectorText), '12 source buttons match the shared reset');
  config.openAdjustNodeConfirmation(1);
  const nodeConfirm = d.querySelector('.gaip-adjust-confirm-card');
  assert.ok(nodeConfirm);
  const nodeButtons = nodeConfirm.querySelectorAll('.gaip-modal__footer > button');
  assert.equal(nodeButtons.length, 2);
  for (const button of nodeButtons) assert.ok(button.matches(spacingRule.selectorText), '17 source buttons match the same reset');
  const footerRule = Array.from(style.sheet.cssRules).find(rule => rule.selectorText === '.gaip-modal .gaip-modal__footer');
  assert.equal(footerRule.style.getPropertyValue('gap'), 'var(--gaip-modal-action-gap)');
  assert.match(css, /--gaip-modal-action-gap:\s*12px/);
  for (const rule of style.sheet.cssRules) {
    if (rule.selectorText && rule.selectorText.includes('gaip-form-control')) {
      assert.ok(!rule.selectorText.includes(':invalid'), 'must use business validation, not pristine native :invalid');
      if (rule.selectorText.includes('textarea.gaip-form-control')) {
        assert.equal(rule.style.getPropertyValue('height'), '', 'textarea autosize is not fixed by shared CSS');
        assert.equal(rule.style.getPropertyValue('resize'), '');
      }
    }
  }
  console.log('PASS: source field adoption, clear/input events, validation class changes, disabled/read-only, autosize and excluded selectors (DOM/source checks)');
  console.log(checked + ' form source/legacy adapter contracts passed; fields, events and dynamic footer preserved');
  const warning = d.createElement('div');
  warning.className = 'ant-modal ant-modal-confirm ant-modal-confirm-warning';
  warning.innerHTML = '<div class="ant-modal-content"><div class="ant-modal-body"><div class="ant-modal-confirm-body-wrapper"><div class="ant-modal-confirm-body ant-modal-confirm-body-has-title"><span class="anticon anticon-exclamation-circle"><svg></svg></span><div class="ant-modal-confirm-paragraph"><span class="ant-modal-confirm-title">检测到账号已切换</span><div class="ant-modal-confirm-content"></div></div></div><div class="ant-modal-confirm-btns"><button class="ant-btn ant-btn-primary">立即刷新</button></div></div></div></div>';
  const warningCopy = warning.querySelector('.ant-modal-confirm-content');
  warningCopy.textContent = '其他页面已登录账号 ' + 'long_preview_account_'.repeat(15) + '，当前页面数据可能已与服务器不一致，请立即刷新页面。';
  const originalWarningCopy = warningCopy.textContent;
  d.body.appendChild(warning);
  const warningNodes = [...warning.querySelectorAll('*')];
  const refresh = warning.querySelector('button');
  let refreshCalls = 0;
  refresh.addEventListener('click', () => refreshCalls++);
  api.scanForms(warning); api.scanForms(warning);
  assert.ok(warning.matches('.gaip-modal--system-warning'));
  assert.deepEqual([...warning.querySelectorAll('*')], warningNodes, '32 retains the real warning DOM');
  assert.equal(warning.querySelectorAll('button').length, 1, '32 does not gain cancel or close');
  assert.ok(refresh.matches('.gaip-modal__button--primary'));
  // Real Ant warning has an icon + paragraph flex layout. Adopting just the
  // title font missed its row-gap/max-width entirely; assert that structure.
  const warningBody = warning.querySelector('.ant-modal-confirm-body');
  sharedRule(warningBody, 'display', 'grid');
  sharedRule(warningBody, 'row-gap', 'var(--gaip-modal-title-body-gap)');
  sharedRule(warning.querySelector('.ant-modal-confirm-paragraph'), 'display', 'contents');
  sharedRule(warningCopy, 'margin', '0');
  const sharedHeader = rules.find(r => r.selectorText === '.gaip-modal .ant-modal-header');
  assert.equal(sharedHeader.style.getPropertyValue('margin'), '0 40px var(--gaip-modal-title-body-gap) 0', '32 and normal confirmation headers use one spacing token');
  const tokens = rules.find(r => r.style && r.style.getPropertyValue('--gaip-modal-title-body-gap'));
  assert.equal(tokens.style.getPropertyValue('--gaip-modal-title-body-gap'), '20px');
  const gridCopy = rules.find(r => r.selectorText === '.gaip-modal--system-warning .ant-modal-confirm-body .gaip-modal-confirm__message');
  assert.ok(warningCopy.matches(gridCopy.selectorText));
  assert.equal(gridCopy.style.getPropertyValue('grid-column'), '1 / -1', 'warning copy spans the icon column, not the old narrow paragraph');
  assert.equal(gridCopy.style.getPropertyValue('grid-row'), '2');
  const titleGrid = rules.find(r => r.selectorText === '.gaip-modal--system-warning .ant-modal-confirm-body:has(> .anticon) .gaip-modal__title');
  assert.ok(warning.querySelector('.gaip-modal__title').matches(titleGrid.selectorText));
  assert.equal(titleGrid.style.getPropertyValue('grid-column'), '2');
  const wrapping = rules.find(r => r.style && r.style.getPropertyValue('overflow-wrap') === 'anywhere' && warningCopy.matches(r.selectorText));
  assert.ok(wrapping, 'warning long account uses shared confirmation wrapping');
  assert.equal(wrapping.style.getPropertyValue('word-break'), 'normal');
  const normalCopy = d.createElement('div'); normalCopy.className = 'gaip-modal';
  normalCopy.innerHTML = '<p class="gaip-modal-confirm__message"></p><p class="gaip-modal-confirm__description"></p>';
  for (const copy of normalCopy.children) assert.ok(copy.matches(wrapping.selectorText), 'normal confirmation uses the same copy rule');
  assert.ok(!normalCopy.matches(gridCopy.selectorText), 'warning grid is scoped, not all confirmation layouts');
  assert.equal(warningCopy.textContent, originalWarningCopy, 'long warning copy is not truncated or rewritten');
  refresh.click(); assert.equal(refreshCalls, 1, 'original refresh handler remains single');
  warning.remove();
  assert.ok(rules.some(rule => rule.selectorText && rule.selectorText.includes('gaip-modal__close--preserve') && rule.selectorText.includes('::before') && rule.style.getPropertyValue('display') === 'block' && rule.style.getPropertyPriority('display') === 'important'), '24 shared close overrides Ant hidden pseudo-element');
  console.log('PASS: five-fix source contracts: node search, title gap, no-resize count, Ant close and non-destructive system warning');
  w.__GAIP_MODAL_CONTROLS__.destroy();
  styleRules.window.close();
  localStyles.window.close();
  await new Promise(resolve => w.setTimeout(resolve, 0));
  dom.window.close();
}
main().catch(error => { console.error(error.stack || error); process.exit(1); });
