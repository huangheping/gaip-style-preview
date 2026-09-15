const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
async function main() {
  const dom = new JSDOM('<body><main><select id="page"><option>A</option></select><input type="date"></main><div class="ant-drawer"><div class="ant-modal"><select><option>A</option></select></div></div><div class="ant-modal agentModal___Nxp06"><select><option>A</option></select></div><dialog open id="modal"><select aria-label="类型" id="select"><option value="a">甲</option><option value="b">乙</option><option disabled value="c">丙</option></select><select multiple id="multi"><option value="a" selected>甲</option><option value="b">乙</option></select><input type="date" aria-label="日期" min="2026-09-02" max="2026-09-20" value="2026-09-08"><input type="time" step="900" value="09:00"><input type="text" value="保留"><div class="ant-select"><input id="ant" aria-expanded="true" aria-controls="list"></div></dialog></body>', { url: 'file://' + root + '/登录.html', runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window, d = w.document, tick = () => new Promise(r => w.setTimeout(r, 5));
  w.eval(read('shared/scripts/global-date-picker.js')); w.eval(read('shared/scripts/modal-controls.js')); await tick();
  const api = w.__GAIP_MODAL_CONTROLS__, modal = d.querySelector('#modal');
  assert.equal(d.querySelectorAll('.gaip-native-trigger').length, 2);
  for (const outside of d.querySelectorAll('main, .ant-drawer, .agentModal___Nxp06')) assert.ok(!outside.querySelector('.gaip-native-trigger'));
  const source = d.querySelector('#select'); let changes = 0; source.addEventListener('change', () => changes++);
  const trigger = source.nextElementSibling; trigger.click();
  assert.ok(modal.querySelector('.gaip-native-popup')); assert.equal(trigger.getAttribute('aria-expanded'), 'true');
  const options = modal.querySelectorAll('[role="option"]'); assert.ok(options[2].disabled); options[1].click(); await tick();
  assert.equal(source.value, 'b'); assert.equal(changes, 1); assert.equal(trigger.textContent, '乙'); assert.equal(d.querySelector('.gaip-native-popup'), null);
  // Regression: the shared dialog transform establishes a fixed containing block.
  // Mock that geometry explicitly; jsdom itself does not perform browser layout.
  const originalRect = w.HTMLElement.prototype.getBoundingClientRect;
  const widthDescriptor = Object.getOwnPropertyDescriptor(w.HTMLElement.prototype, 'offsetWidth');
  const heightDescriptor = Object.getOwnPropertyDescriptor(w.HTMLElement.prototype, 'offsetHeight');
  trigger.getBoundingClientRect = () => ({ left: 260, top: 180, bottom: 228, width: 240, height: 48 });
  Object.defineProperty(w.HTMLElement.prototype, 'offsetWidth', { configurable: true, get() { return parseFloat(this.style.width) || 0; } });
  Object.defineProperty(w.HTMLElement.prototype, 'offsetHeight', { configurable: true, get() { return 320; } });
  w.HTMLElement.prototype.getBoundingClientRect = function () {
    if (!this.classList.contains('gaip-native-popup')) return originalRect.call(this);
    return { left: 180, top: 100, width: this.offsetWidth * .8, height: this.offsetHeight * .8 };
  };
  api.openNative(source, trigger);
  let floating = modal.querySelector('.gaip-native-popup');
  assert.equal(parseFloat(floating.style.left) * .8 + 180, 260, 'fallback accounts for translated/scaled containing block');
  assert.equal(parseFloat(floating.style.top) * .8 + 100, 232);
  assert.equal(parseFloat(floating.style.width) * .8, 240);
  assert.equal(floating.dataset.gaipFormField, 'exclude', 'calendar internals are not plain 48px form fields');
  api.close(false);
  w.HTMLElement.prototype.showPopover = function () { this.dataset.mockTopLayer = 'true'; };
  api.openNative(source, trigger); floating = modal.querySelector('.gaip-native-popup');
  assert.equal(floating.getAttribute('popover'), 'manual');
  assert.equal(floating.style.left, '260px', 'top-layer panels use viewport coordinates');
  assert.equal(floating.style.top, '232px'); assert.equal(floating.style.width, '240px');
  api.close(false);
  delete w.HTMLElement.prototype.showPopover;
  w.HTMLElement.prototype.getBoundingClientRect = originalRect;
  Object.defineProperty(w.HTMLElement.prototype, 'offsetWidth', widthDescriptor);
  Object.defineProperty(w.HTMLElement.prototype, 'offsetHeight', heightDescriptor);
  delete trigger.getBoundingClientRect;
  const multi = d.querySelector('#multi'); multi.nextElementSibling.click(); modal.querySelectorAll('[role="option"]')[1].click();
  assert.equal(multi.selectedOptions.length, 2); api.close(false);
  const date = modal.querySelector('input[type="date"]'); api.openNative(date, date);
  assert.ok(modal.querySelector('[aria-label="2026-09-01"]').disabled); modal.querySelector('[aria-label="2026-09-10"]').click(); assert.equal(date.value, '2026-09-10');
  const time = modal.querySelector('input[type="time"]'); api.openNative(time, time);
  modal.querySelectorAll('.gaip-time-columns [role="listbox"]')[1].querySelectorAll('button')[1].click(); assert.ok(modal.querySelector('.gaip-choice-apply').disabled, 'native step preserved');
  modal.querySelectorAll('.gaip-time-columns [role="listbox"]')[1].querySelectorAll('button')[15].click(); modal.querySelector('.gaip-choice-apply').click(); assert.equal(time.value, '09:15');
  api.openNative(date, date); d.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); assert.equal(d.querySelector('.gaip-native-popup'), null); assert.ok(modal.open);
  source.disabled = true; await tick(); assert.ok(trigger.disabled); api.openNative(source, trigger); assert.equal(d.querySelector('.gaip-native-popup'), null); source.disabled = false;
  date.readOnly = true; api.openNative(date, date); assert.equal(d.querySelector('.gaip-native-popup'), null, 'read-only date cannot open editing panel'); date.readOnly = false;
  date.value = ''; date.dispatchEvent(new w.Event('input', { bubbles: true })); assert.equal(date.dataset.gaipValueState, 'empty');
  date.value = '2026-09-10'; date.dispatchEvent(new w.Event('input', { bubbles: true })); assert.equal(date.dataset.gaipValueState, 'filled');
  // Portals inherit only through ownership, even though physically under body.
  const portal = d.createElement('div'); portal.className = 'ant-select-dropdown'; portal.innerHTML = '<div id="list" role="listbox"></div>'; d.body.appendChild(portal); await tick(); assert.ok(portal.classList.contains('gaip-modal-popup'));
  d.querySelector('#ant').setAttribute('aria-expanded', 'false'); await tick(); assert.ok(!portal.classList.contains('gaip-modal-popup'));
  const outsider = d.createElement('div'); outsider.className = 'ant-picker-dropdown'; d.body.appendChild(outsider); await tick(); assert.ok(!outsider.classList.contains('gaip-modal-popup'));
  // Picker without aria linkage requires a fresh modal interaction.
  const picker = d.createElement('div'); picker.className = 'ant-picker'; modal.appendChild(picker); picker.dispatchEvent(new w.Event('pointerdown', { bubbles: true }));
  const calendar = d.createElement('div'); calendar.className = 'ant-picker-dropdown'; d.body.appendChild(calendar); await tick(); assert.ok(calendar.classList.contains('gaip-modal-popup')); assert.ok(!outsider.classList.contains('gaip-modal-popup'));
  api.openNative(date, date); modal.open = false; await tick(); assert.equal(d.querySelector('.gaip-native-popup'), null); assert.ok(!calendar.classList.contains('gaip-modal-popup'));
  d.querySelector('main').appendChild(source); await tick(); assert.ok(!source.classList.contains('gaip-native-source')); assert.ok(!trigger.isConnected, 'moving a control into a page restores native UI and removes proxy');
  // Styles parse, are scoped, and retain explicit disabled/error state rules.
  const form = d.createElement('div'); form.className = 'ant-modal gaip-modal-form';
  form.innerHTML = '<label>名称<input id="clear-text" type="text" value="甲" required></label><label>锁定<input type="text" readonly value="乙"></label><label>禁用<input type="text" disabled value="丙"></label><label>数量<input type="number" value="3"></label><label>说明<textarea>保留多行</textarea></label><select aria-label="可选类型"><option value="">请选择类型</option><option value="b">乙</option></select>';
  d.body.appendChild(form); api.scan();
  const clearText = form.querySelector('#clear-text'), clearParent = clearText.parentElement;
  const clearButton = clearParent.querySelector('.gaip-mc-clear');
  let clearInputs = 0, clearChanges = 0;
  clearText.addEventListener('input', () => clearInputs++); clearText.addEventListener('change', () => clearChanges++);
  clearButton.click();
  assert.equal(clearText.value, ''); assert.equal(clearInputs, 1); assert.equal(clearChanges, 1);
  assert.equal(clearText.parentElement, clearParent); assert.ok(clearText.required);
  assert.ok(clearButton.hidden);
  for (const input of form.querySelectorAll('input[readonly], input[disabled]')) {
    const clear = input.parentElement.querySelector('.gaip-mc-clear'); assert.ok(clear.hidden); clear.click(); assert.ok(input.value);
  }
  assert.equal(form.querySelector('input[type="number"]').parentElement.querySelector('.gaip-mc-clear'), null);
  assert.equal(form.querySelector('textarea').parentElement.querySelector('.gaip-mc-clear'), null);
  const optionalSelect = form.querySelector('select'); assert.equal(optionalSelect.nextElementSibling.dataset.gaipValueState, 'empty');
  optionalSelect.value = 'b'; optionalSelect.dispatchEvent(new w.Event('change')); assert.equal(optionalSelect.nextElementSibling.dataset.gaipValueState, 'filled');
  const numberBefore = form.querySelectorAll('.gaip-mc-clear').length; api.scan(); api.scan(); assert.equal(form.querySelectorAll('.gaip-mc-clear').length, numberBefore);
  d.querySelector('main').appendChild(clearText); api.scan(); assert.ok(!clearButton.isConnected); assert.ok(!clearText.classList.contains('gaip-mc-clearable'));
  form.remove(); api.scan();
  const css = read('shared/styles/modal-controls.css'), style = d.createElement('style'); style.textContent = css; d.head.appendChild(style);
  assert.ok(style.sheet.cssRules.length > 50);
  for (const rule of style.sheet.cssRules) if (rule.selectorText) {
    let depth = 0, current = ''; const selectors = [];
    for (const c of rule.selectorText) { if (c === '(' || c === '[') depth++; if (c === ')' || c === ']') depth--; if (c === ',' && !depth) { selectors.push(current); current = ''; } else current += c; } selectors.push(current);
    for (const selector of selectors) assert.ok(/gaip-(modal|native|calendar|time|control)/.test(selector), 'unscoped rule: ' + selector);
  }
  assert.match(css, /ant-checkbox-indeterminate/); assert.match(css, /ant-picker-time-panel-cell-selected/); assert.match(css, /ant-select-status-error/); assert.match(css, /ant-radio-disabled/);
  const rules = Array.from(style.sheet.cssRules).filter(r => r.selectorText);
  // Date/time icons follow the control's purpose, not its legacy suffix glyph.
  // 24's two DatePickers pass a down SVG; its ordinary Select must stay a down
  // arrow. Reconstruct these source hosts without replacing their React nodes.
  const customerSource = read('web/p__customer__index.cf63b31b.async.js');
  assert.equal((customerSource.match(/suffixIcon:\(0,e\.jsx\)\(Fe\.r,\{className:Z\.selectArrow\}\)/g) || []).length, 3, '24 has two custom date suffixes and one Select suffix');
  const icons = d.createElement('div'); icons.className = 'ant-modal';
  icons.innerHTML = '<div class="ant-select"><span class="ant-select-arrow"><svg class="selectArrow___R46ag"></svg></span></div><div class="ant-picker"><span class="ant-picker-suffix"><svg class="selectArrow___R46ag"></svg></span></div><div class="ant-picker"><span class="ant-picker-suffix"><svg class="selectArrow___R46ag"></svg></span></div><div class="ant-picker"><span class="ant-picker-suffix"><span class="anticon anticon-calendar"><svg></svg></span></span></div><div class="ant-picker ant-picker-range"><span class="ant-picker-suffix"><span class="anticon anticon-calendar"><svg></svg></span></span></div><div class="ant-picker"><span class="ant-picker-suffix"><span class="anticon anticon-clock-circle"><svg></svg></span></span></div><input type="date"><input type="datetime-local"><input type="time">';
  d.body.appendChild(icons); api.scan();
  const iconScope = '.gaip-modal-controls.gaip-modal-controls.gaip-modal-controls ';
  const calendarRule = rules.find(r => r.selectorText === iconScope + '.ant-picker-suffix');
  const clockRule = rules.find(r => r.selectorText === iconScope + '.ant-picker-suffix:has(.anticon-clock-circle)');
  assert.ok(calendarRule && clockRule, 'shared date and pure-time semantic icons are present');
  assert.match(calendarRule.style.getPropertyValue('background'), /var\(--mc-calendar\) center\/16px 16px no-repeat/);
  assert.equal(calendarRule.style.getPropertyPriority('background'), 'important');
  assert.equal(calendarRule.style.getPropertyValue('mask'), 'none', 'file icons render directly, not via an external SVG mask');
  assert.equal(calendarRule.style.getPropertyValue('-webkit-mask'), 'none');
  assert.equal(clockRule.style.getPropertyValue('background-image'), 'var(--mc-clock)');
  assert.equal(clockRule.style.getPropertyPriority('background-image'), 'important');
  const suffixes = [...icons.querySelectorAll('.ant-picker-suffix')];
  assert.ok(suffixes.every(el => el.matches(calendarRule.selectorText)), 'custom date, standard date and range all receive the shared calendar base');
  assert.deepEqual(suffixes.map(el => el.matches(clockRule.selectorText)), [false, false, false, false, true], 'only pure time overrides the calendar with the clock');
  const selectArrow = icons.querySelector('.ant-select-arrow');
  const selectArrowRule = rules.find(r => r.selectorText === iconScope + ':is(.ant-select-arrow, .gaipMultiSelect__arrow)' && r.style.getPropertyValue('background'));
  assert.ok(selectArrow.matches(selectArrowRule.selectorText));
  assert.match(selectArrowRule.style.getPropertyValue('background'), /var\(--mc-down\)/);
  assert.ok(!selectArrow.matches(calendarRule.selectorText), 'ordinary Select is not a calendar');
  assert.ok(!rules.some(r => r.selectorText.includes('.ant-picker-suffix') && /--mc-down/.test(r.style.cssText)), 'no old down-arrow override may win on date pickers');
  const oldGlyphRule = rules.find(r => r.selectorText === calendarRule.selectorText + ' > *');
  for (const suffix of suffixes) {
    const glyph = suffix.firstElementChild;
    assert.ok(glyph.matches(oldGlyphRule.selectorText));
    assert.equal(oldGlyphRule.style.getPropertyValue('visibility'), 'hidden');
    api.scan(); assert.equal(suffix.firstElementChild, glyph, 'React source icon node is not replaced');
  }
  const nativeCalendarRule = rules.find(r => r.selectorText === iconScope + '.gaip-native-date');
  const nativeClockRule = rules.find(r => r.selectorText === iconScope + '.gaip-native-date[type="time"]');
  const nativeDates = [...icons.querySelectorAll('input')];
  assert.ok(nativeDates.every(el => el.matches(nativeCalendarRule.selectorText)));
  assert.deepEqual(nativeDates.map(el => el.matches(nativeClockRule.selectorText)), [false, false, true], 'native date/datetime show a calendar, time shows a clock');
  assert.match(nativeCalendarRule.style.getPropertyValue('background'), /var\(--mc-calendar\)/);
  assert.equal(nativeClockRule.style.getPropertyValue('background-image'), 'var(--mc-clock)');
  const iconTokens = rules.find(r => r.selectorText === '.gaip-modal-controls, .gaip-modal-popup').style;
  for (const [token, asset] of [['--mc-calendar', 'modal-calendar.svg'], ['--mc-clock', 'modal-clock.svg']]) {
    assert.ok(iconTokens.getPropertyValue(token).includes('../assets/' + asset));
    const svg = read('shared/assets/' + asset);
    assert.match(svg, /viewBox="0 0 32 32"/, 'retain user attachment geometry');
    assert.match(svg, /#2F3640/, 'retain user attachment color');
  }
  assert.match(read('shared/assets/modal-calendar.svg'), /ICON\/通用\/日历/);
  assert.match(read('shared/assets/modal-clock.svg'), /ICON\/通用\/时间/);
  d.querySelector('main').appendChild(suffixes[0]);
  assert.ok(!suffixes[0].matches(calendarRule.selectorText), 'page picker remains outside modal icon scope');
  assert.ok(!d.querySelector('main input[type="date"]').matches(nativeCalendarRule.selectorText));
  suffixes[0].remove(); icons.remove();
  // Cascade regression: retain the target class OUTSIDE :where so the state
  // ties the base (0,4,0) instead of losing at (0,3,0), even with !important.
  const controlBaseSelector = '.gaip-modal-controls.gaip-modal-controls.gaip-modal-controls :is(.ant-select-selector, .ant-picker, .ant-input-number, .gaipMultiSelect__control, .gaip-native-trigger, .gaip-native-date)';
  const baseIndex = rules.findIndex(r => r.selectorText === controlBaseSelector);
  const hoverIndex = rules.findIndex(r => r.selectorText === controlBaseSelector + ':where(:hover)');
  const focusIndex = rules.findIndex(r => r.selectorText.startsWith(controlBaseSelector + ':where(:focus,'));
  const activeIndex = rules.findIndex(r => r.selectorText.startsWith(controlBaseSelector + ':where(:active)'));
  assert.ok(baseIndex >= 0 && hoverIndex > baseIndex && focusIndex > hoverIndex && activeIndex > focusIndex, 'default < hover < focus < active at equal specificity');
  assert.equal(rules[hoverIndex].style.getPropertyPriority('border-color'), 'important');
  assert.ok(!rules.some(r => r.selectorText.endsWith('.gaip-native-trigger[aria-expanded="true"]')), 'expanded must not override active at higher specificity');
  assert.ok(rules.findIndex(r => r.selectorText.includes('.ant-select-status-error')) > activeIndex, 'error border remains after interaction rules');
  assert.equal(rules.find(r => r.selectorText === '.gaip-modal-controls, .gaip-modal-popup').style.getPropertyValue('--mc-ring').trim(), 'none');
  const fieldCss = read('shared/styles/global-modal.css');
  assert.match(fieldCss, /--gaip-form-interaction: #24D4C9/);
  assert.match(fieldCss, /--gaip-form-active: #1FBFB5/);
  assert.ok(!/--gaip-form-focus-ring: (?!none)[^;]+;/.test(fieldCss), 'no normal/error form focus halo');
  for (const rule of rules.filter(r => /:hover|:focus|:active/.test(r.selectorText))) {
    assert.ok(!/2px solid/.test(rule.style.getPropertyValue('outline')), 'form states must not restore an outer focus ring');
    if (rule.selectorText.includes('.ant-select-selector')) assert.equal(rule.style.getPropertyValue('border-color'), rule.selectorText.includes(':active') ? 'var(--gaip-form-active)' : 'var(--gaip-form-interaction)');
  }
  const radioTokens = rules.find(r => r.selectorText === '.gaip-modal-controls, .gaip-modal-popup').style;
  assert.equal(radioTokens.getPropertyValue('--mc-radio-size').trim(), '16px');
  assert.equal(radioTokens.getPropertyValue('--mc-radio-dot-size').trim(), '6px');
  const radioBase = rules.find(r => r.selectorText.includes('.ant-radio-inner, .gaip-adjust-node-radio, input[type="radio"]'));
  assert.equal(radioBase.style.getPropertyValue('box-shadow'), 'none', '16 must not retain the legacy white inset ring');
  assert.equal(radioBase.style.getPropertyPriority('box-shadow'), 'important');
  const radioDot = rules.find(r => r.selectorText.endsWith(':is(.ant-radio-inner, .gaip-adjust-node-radio, .gaip-bulk-node-radio)::after'));
  assert.equal(radioDot.style.getPropertyValue('width'), 'var(--mc-radio-dot-size)');
  assert.equal(radioDot.style.getPropertyValue('margin'), '0', 'legacy Ant negative margins must not shift the shared dot');
  const checkedDot = rules.find(r => r.selectorText.endsWith(':is(.ant-radio-checked .ant-radio-inner, .gaip-adjust-node-row.is-selected .gaip-adjust-node-radio, .gaip-bulk-node-row.is-selected .gaip-bulk-node-radio)::after'));
  assert.equal(checkedDot.style.getPropertyValue('transform'), 'translate(-50%, -50%) scale(1)');
  assert.ok(rules.some(r => r.selectorText.includes(':checked:disabled') && r.style.getPropertyValue('background-image').includes('--mc-radio-dot-size')), 'native disabled checked state retains the same dot size');
  const searchPrefix = rules.find(r => r.selectorText.endsWith('.gaip-mc-search-shell::before'));
  assert.equal(searchPrefix.style.getPropertyValue('mask'), 'none', 'file previews must not rely on external SVG mask loading for the search prefix');
  assert.equal(searchPrefix.style.getPropertyValue('-webkit-mask'), 'none');
  assert.match(searchPrefix.style.getPropertyValue('background'), /url\(['"]?\.\.\/assets\/modal-search\.svg['"]?\)/);
  assert.equal(searchPrefix.style.getPropertyValue('flex'), '0 0 16px');
  assert.match(read('shared/assets/modal-search.svg'), /<svg[^>]+viewBox=/, 'the direct image asset exists and retains SVG geometry');
  assert.equal(rules.find(r => r.selectorText === '.gaip-modal-controls, .gaip-modal-popup').style.getPropertyValue('--mc-selection').trim(), '#24D4C9');
  const clearPosition = rules.find(r => r.selectorText.endsWith(':is(.ant-select-clear, .ant-picker-clear)'));
  const clearImage = rules.find(r => r.selectorText.endsWith('.gaip-mc-clear)::before'));
  assert.equal(clearImage.style.getPropertyValue('mask'), 'none', 'clear glyph must not depend on an external SVG mask');
  assert.equal(clearImage.style.getPropertyValue('-webkit-mask'), 'none');
  assert.match(clearImage.style.getPropertyValue('background'), /var\(--mc-clear\)/);
  for (const property of ['height', 'min-height', 'max-height', 'width', 'min-width', 'max-width']) {
    assert.equal(clearImage.style.getPropertyValue(property), '16px', 'clear glyph cannot shrink or inherit a clipped size');
    assert.equal(clearImage.style.getPropertyPriority(property), 'important');
  }
  const clearBox = rules.find(r => r.selectorText.endsWith('.gaip-mc-clear)'));
  assert.equal(clearBox.style.getPropertyValue('display'), 'inline-flex');
  assert.equal(clearBox.style.getPropertyPriority('display'), 'important');
  assert.equal(clearBox.style.getPropertyValue('overflow'), 'visible');
  assert.equal(clearBox.style.getPropertyValue('min-height'), '24px');
  const clearHover = rules.find(r => r.selectorText.endsWith('.gaip-mc-clear):is(:hover, :active)'));
  assert.equal(clearHover.style.getPropertyValue('background'), clearBox.style.getPropertyValue('background'), 'pointer interaction keeps the default backing without a gray square');
  assert.match(read('shared/assets/modal-clear.svg'), /fill="#2F3640"/, 'direct SVG has its own color instead of document currentColor');
  assert.equal(clearPosition.style.getPropertyValue('margin-top'), '0');
  assert.equal(clearPosition.style.getPropertyValue('transform'), 'translateY(-50%)');
  const arrowPosition = rules.find(r => r.selectorText.endsWith(':is(.ant-select-arrow, .gaipMultiSelect__arrow)') && r.style.getPropertyValue('top'));
  assert.equal(arrowPosition.style.getPropertyValue('transform'), 'translateY(-50%)');
  const arrowImages = rules.filter(r => (r.selectorText.endsWith(':is(.ant-select-arrow, .gaipMultiSelect__arrow)') || r.selectorText.endsWith('.gaip-native-trigger::after')) && r.style.getPropertyValue('background'));
  assert.equal(arrowImages.length, 2, 'native and Ant/custom arrows use the same image contract');
  for (const rule of arrowImages) {
    assert.equal(rule.style.getPropertyValue('mask'), 'none', 'local arrows must not depend on external mask loading');
    assert.equal(rule.style.getPropertyValue('-webkit-mask'), 'none');
    assert.match(rule.style.getPropertyValue('background'), /var\(--mc-down\)/);
  }
  assert.match(css, /\[hidden\] \{ display: none !important;/, 'clear enhancement must not reveal hidden business buttons');
  const positioning = d.createElement('style'); positioning.textContent = read('shared/styles/global-modal-position.css'); d.head.appendChild(positioning);
  const clueRule = Array.from(positioning.sheet.cssRules).find(r => r.selectorText && r.selectorText.endsWith('> .ant-modal.createClueWrapper___mpoSg'));
  assert.equal(clueRule.style.getPropertyValue('transform'), 'none', '22 removes legacy translate after shared grid centering');
  assert.equal(clueRule.style.getPropertyPriority('transform'), 'important');
  for (const file of ['登录.html', '工作台.html', '全局组件/弹窗预览.html']) assert.match(read(file), /shared\/scripts\/modal-controls\.js/);
  api.destroy(); await tick(); dom.window.close();
  console.log('PASS: modal-only scope; native select/multi/date/time; min/max/step; event identity; Escape; disabled; popup ownership and cleanup (DOM/source, not visual QA).');
}
async function testBulkImportSelect() {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'file://' + root + '/全局组件/弹窗预览.html?embed=config-bulk-import-members', runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window, d = w.document;
  w.__GAIP_CONFIG_DIALOG_PREVIEW__ = true;
  w.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  w.HTMLDialogElement.prototype.close = function () { this.open = false; this.dispatchEvent(new w.Event('close')); };
  // Use the actual Ant owner rule: a DOM .click() alone ignores hit-testing CSS.
  const antRule = read('features/config-center/ant-source.css').match(/:where\(\.css-10wz6x1\)\.ant-modal\{[^}]+\}/)[0];
  const style = d.createElement('style');
  style.textContent = antRule + '\n' + read('shared/styles/modal-controls.css'); d.head.appendChild(style);
  for (const file of ['shared/config/channels.js', 'shared/scripts/global-modal.js', 'shared/scripts/global-date-picker.js', 'shared/scripts/modal-controls.js', 'shared/scripts/organization-store.js', 'shared/scripts/organization-tree.js', 'features/config-center/source-markup.js', 'features/config-center/config-center.js']) w.eval(read(file));
  const dialog = w.__GAIP_CONFIG_DIALOGS__.openBulkImport(), api = w.__GAIP_MODAL_CONTROLS__;
  const tick = () => new Promise(r => w.setTimeout(r, 10));
  await tick(); api.scan();
  assert.equal(w.getComputedStyle(dialog).pointerEvents, 'none', 'Ant owner hit-testing contract stays untouched');
  const rules = [...style.sheet.cssRules].filter(r => r.selectorText);
  const radioBase = rules.find(r => r.selectorText.includes('.gaip-bulk-node-radio') && r.style.getPropertyValue('width') === 'var(--mc-radio-size)');
  const selectedRadio = rules.find(r => r.selectorText.includes('.gaip-bulk-node-row.is-selected .gaip-bulk-node-radio') && r.style.getPropertyValue('background-color'));
  const radioDot = rules.find(r => r.selectorText.endsWith('.gaip-bulk-node-radio)::after') && r.style.getPropertyValue('width') === 'var(--mc-radio-dot-size)');
  // JSDOM's selector engine cannot match this valid outer :is with an inner
  // :not followed by another branch. Expand only the outer list; retain every
  // branch/condition from the actual shared rule, not a replacement fixture.
  const matchesRadioRule = (element, rule) => {
    const match = rule.selectorText.replace(/::after$/, '').match(/^(.*?):is\((.*)\)$/);
    assert.ok(match, 'expected a single shared outer selector list');
    let depth = 0, branch = ''; const branches = [];
    for (const char of match[2]) {
      if (char === '(' || char === '[') depth++;
      if (char === ')' || char === ']') depth--;
      if (char === ',' && depth === 0) { branches.push(branch); branch = ''; }
      else branch += char;
    }
    branches.push(branch);
    return branches.some(part => element.matches(match[1] + part.trim()));
  };
  const selectedBulkRadios = () => [...dialog.querySelectorAll('.gaip-bulk-node-radio')].filter(el => matchesRadioRule(el, selectedRadio));
  const assertSharedRadio = radio => {
    assert.ok(matchesRadioRule(radio, radioBase), '15 and 16 share the same circle base declaration');
    assert.ok(matchesRadioRule(radio, radioDot), '15 and 16 share the same centered dot declaration');
  };
  assertSharedRadio(dialog.querySelector('.gaip-bulk-node-radio'));
  assert.equal(dialog.querySelector('.gaip-bulk-node-check'), null);
  dialog.querySelector('[data-bulk-node-toggle="department-1"]').click(); await tick();
  assert.ok(matchesRadioRule(dialog.querySelector('[data-bulk-department-option="all"] .gaip-bulk-node-radio'), selectedRadio), 'expansion leaves the root selected');
  dialog.querySelector('[data-bulk-department-option="department-1"] .gaip-bulk-node-radio').click(); await tick();
  assert.ok(matchesRadioRule(dialog.querySelector('[data-bulk-department-option="department-1"] .gaip-bulk-node-radio'), selectedRadio), 'clicking the indicator delegates to the existing row selection handler');
  assert.equal(selectedBulkRadios().length, 1, 'only one indicator is selected');
  dialog.querySelector('[data-bulk-node-toggle="department-1"]').click(); await tick();
  assert.ok(matchesRadioRule(dialog.querySelector('[data-bulk-department-option="department-1"] .gaip-bulk-node-radio'), selectedRadio), 'collapsing does not deselect the chosen parent');
  for (const index of [1, 2, 0]) {
    const source = dialog.querySelector('[data-bulk-channel-select]'), trigger = source.nextElementSibling;
    trigger.click();
    const panel = dialog.querySelector('.gaip-native-popup'); assert.ok(panel);
    assert.equal(w.getComputedStyle(panel).pointerEvents, 'auto', 'popup must not inherit the Ant owner pointer-events:none');
    const option = panel.querySelectorAll('[role="option"]')[index], name = option.textContent;
    assert.equal(w.getComputedStyle(option).pointerEvents, 'auto', 'visible options accept pointer input');
    option.click(); await tick();
    const current = dialog.querySelector('[data-bulk-channel-select]');
    assert.equal(current.value, String(index));
    assert.equal(current.nextElementSibling.textContent, name);
    assert.equal(dialog.querySelector('[data-bulk-path] strong').textContent, name);
    assert.equal(dialog.querySelector('.gaip-native-popup'), null);
    assertSharedRadio(dialog.querySelector('.gaip-bulk-node-radio'));
    assert.equal(selectedBulkRadios().length, 1, 'source rerender keeps exactly one selected indicator');
  }
  dialog.querySelector('[data-bulk-channel-select]').nextElementSibling.click();
  d.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  assert.equal(dialog.querySelector('.gaip-native-popup'), null); assert.ok(dialog.open);
  dialog.querySelector('[data-bulk-close]').click(); await tick();
  assert.equal(d.querySelector('.gaip-native-popup'), null);
  const reopened = w.__GAIP_CONFIG_DIALOGS__.openBulkImport(); await tick(); api.scan();
  assertSharedRadio(reopened.querySelector('.gaip-bulk-node-radio'));
  reopened.querySelector('[data-bulk-close]').click(); await tick();
  const adjust = w.__GAIP_CONFIG_DIALOGS__.openAdjustNode(1); await tick(); api.scan();
  assertSharedRadio(adjust.querySelector('.gaip-adjust-node-radio'));
  adjust.querySelector('.gaip-adjust-node-option:not(:disabled)').click(); await tick();
  assert.ok(matchesRadioRule(adjust.querySelector('.gaip-adjust-node-row.is-selected .gaip-adjust-node-radio'), selectedRadio), '16 still uses that same selected color rule');
  assert.ok(adjust.querySelector('.gaip-adjust-node-option:disabled'), '16 current-node disabled behavior is retained');
  adjust.querySelector('[data-adjust-node-close]').click(); await tick();
  api.destroy(); dom.window.close();
  console.log('PASS: 15/16 shared Radio declarations; single selection, independent expansion, channel rerender/reopen; bulk select pointer inheritance, Escape and close (DOM/CSS, not browser hit-testing).');
}
async function testCountedResize() {
  const field = (id, resize = 'vertical') => `<span class="gaip-kit-counted gaip-form-input-shell gaip-form-textarea-shell"><textarea id="${id}" class="gaip-form-control" rows="5" maxlength="500" style="resize:${resize};height:200px;min-height:42px">原内容</textarea><span class="gaip-kit-count">3 / 500</span></span>`;
  const dom = new JSDOM(`<style>${read('shared/styles/global-modal.css')}</style><dialog open class="gaip-modal-kit gaip-modal-form">${field('text')}${field('auto', 'none')}</dialog><main>${field('outside')}</main>`, { runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window, d = w.document;
  w.eval(read('shared/scripts/global-date-picker.js')); w.eval(read('shared/scripts/modal-controls.js'));
  await new Promise(r => w.setTimeout(r, 5));
  const api = w.__GAIP_MODAL_CONTROLS__, text = d.querySelector('#text'), shell = text.parentElement, owner = text.closest('dialog');
  api.scan(); api.scan();
  const handle = shell.querySelector('.gaip-mc-resize-handle');
  assert.ok(handle); assert.equal(d.querySelectorAll('.gaip-mc-resize-handle').length, 1, 'no grip for autosize or normal page');
  assert.equal(w.getComputedStyle(handle).inset, 'auto 2px 2px auto');
  handle.focus();
  assert.equal(w.getComputedStyle(handle).outline, 'none', 'focused grip has no surrounding square');
  assert.equal(w.getComputedStyle(handle).boxShadow, 'none');
  assert.equal(w.getComputedStyle(handle).backgroundColor, 'rgba(0, 0, 0, 0)');
  const gripState = [...d.styleSheets[0].cssRules].find(r => r.selectorText === '.gaip-modal-kit.gaip-modal-kit.gaip-modal-kit .gaip-mc-resize-handle:is(:hover, :focus-visible)');
  assert.equal(gripState.style.color, '#24D4C9', 'grip lines retain hover and keyboard focus indication');
  const suppress = [...d.styleSheets[0].cssRules].find(r => r.selectorText && r.selectorText.endsWith('textarea.gaip-mc-resize-source'));
  assert.ok(text.matches(suppress.selectorText)); assert.equal(suppress.style.resize, 'none'); assert.equal(suppress.style.getPropertyPriority('resize'), 'important');
  assert.equal(text.style.resize, 'vertical', 'original inline resize policy retained; CSS !important suppresses native grip (JSDOM does not resolve inline priority correctly)');
  Object.defineProperty(text, 'offsetHeight', { get: () => parseFloat(text.style.height) });
  text.getBoundingClientRect = () => ({ height: text.offsetHeight * 2 });
  let changes = 0; text.addEventListener('input', () => changes++); text.addEventListener('change', () => changes++);
  const pointer = (target, type, y) => target.dispatchEvent(new w.MouseEvent(type, { bubbles: true, button: 0, clientY: y }));
  pointer(handle, 'pointerdown', 100); pointer(w, 'pointermove', 200); pointer(w, 'pointerup', 200);
  assert.equal(text.style.height, '250px', 'drag respects preview scaling');
  pointer(w, 'pointermove', 300); assert.equal(text.style.height, '250px', 'pointerup removes listeners');
  handle.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })); assert.equal(text.style.height, '260px');
  for (const top of [0, 100, 1000]) {
    text.scrollTop = top;
    assert.equal(w.getComputedStyle(shell.querySelector('.gaip-kit-count')).position, 'static');
    assert.equal(handle.parentElement, shell, 'handle is outside the scrolling textarea');
  }
  text.readOnly = true; api.scan(); assert.ok(handle.disabled);
  pointer(handle, 'pointerdown', 100); pointer(w, 'pointermove', 300); assert.equal(text.style.height, '260px');
  text.readOnly = false; text.disabled = true; api.scan(); assert.ok(handle.disabled);
  text.disabled = false; api.scan();
  pointer(handle, 'pointerdown', 100); owner.removeAttribute('open'); api.scan(); pointer(w, 'pointermove', 300);
  assert.equal(text.style.height, '260px', 'close cancels drag'); owner.open = true; api.scan();
  assert.equal(shell.querySelectorAll('.gaip-mc-resize-handle').length, 1, 'reopen does not duplicate');
  pointer(handle, 'pointerdown', 100); pointer(w, 'pointercancel', 100); pointer(w, 'pointermove', 300); assert.equal(text.style.height, '260px');
  pointer(handle, 'pointerdown', 100); w.dispatchEvent(new w.Event('blur')); pointer(w, 'pointermove', 300); assert.equal(text.style.height, '260px');
  assert.equal(text.value, '原内容'); assert.equal(text.maxLength, 500); assert.equal(text.rows, 5); assert.equal(changes, 0);
  pointer(handle, 'pointerdown', 100); shell.remove(); api.scan(); pointer(w, 'pointermove', 300); assert.equal(text.style.height, '260px');
  assert.ok(!text.classList.contains('gaip-mc-resize-source')); assert.ok(!shell.querySelector('.gaip-mc-resize-handle'));
  owner.appendChild(shell); api.scan(); assert.equal(shell.querySelectorAll('.gaip-mc-resize-handle').length, 1);
  const fieldset = d.createElement('fieldset'); owner.appendChild(fieldset); fieldset.appendChild(shell); fieldset.disabled = true; api.scan();
  assert.ok(shell.querySelector('.gaip-mc-resize-handle').disabled, 'fieldset disabled inherits into resize behavior');
  fieldset.disabled = false; api.scan(); assert.equal(shell.querySelector('.gaip-mc-resize-handle').disabled, false);
  shell.setAttribute('data-gaip-form-field', 'exclude'); await new Promise(r => w.setTimeout(r, 5));
  assert.equal(shell.querySelector('.gaip-mc-resize-handle'), null, 'dynamic exclusion cleans enhancement');
  shell.removeAttribute('data-gaip-form-field'); await new Promise(r => w.setTimeout(r, 5)); assert.ok(shell.querySelector('.gaip-mc-resize-handle'));
  // A new business source can opt in without imitating Ant's private classnames.
  w.eval(read('shared/scripts/global-modal.js'));
  const custom = d.createElement('div'); custom.className = 'ant-modal';
  custom.innerHTML = '<div class="ant-modal-content"><div class="ant-modal-header"><h3>新业务</h3></div><div class="ant-modal-body"><span data-gaip-modal-part="counted-textarea"><textarea style="resize:vertical">原字段</textarea><span data-gaip-modal-part="count">3 / 100</span></span></div></div>';
  d.body.appendChild(custom); w.__GAIP_MODAL_COMPONENT__.adoptForm(custom); api.scan();
  const customArea = custom.querySelector('textarea');
  assert.ok(customArea.closest('.gaip-kit-counted.gaip-form-textarea-shell'));
  assert.equal(custom.querySelectorAll('.gaip-mc-resize-handle').length, 1);
  assert.equal(customArea.value, '原字段'); custom.remove(); api.scan();
  api.destroy(); assert.equal(shell.querySelector('.gaip-mc-resize-handle'), null); assert.equal(text.style.resize, 'vertical');
  dom.window.close();
  console.log('PASS: shared outer resize handle; drag/scale/keyboard, count isolation, readonly/disabled, close/reopen/cancel/blur/unmount cleanup (DOM/CSS, not browser geometry).');
}
async function testInvalidFocus() {
  const dom = new JSDOM('<body><input id="outside"><dialog open class="gaip-modal-form"><div id="scroll" style="overflow-y:auto"><div class="ant-form-item" id="first"><select required><option value="">请选择</option><option>A</option></select></div><div class="ant-form-item"><input required id="second"></div></div><footer><button id="save">保存</button></footer></dialog><dialog open class="gaip-modal"><input id="confirm"></dialog></body>', {runScripts:'outside-only', pretendToBeVisual:true});
  const w = dom.window, d = w.document, tick = () => new Promise(r => w.setTimeout(r, 5));
  w.eval(read('shared/scripts/global-date-picker.js')); w.eval(read('shared/scripts/modal-controls.js')); await tick();
  const api = w.__GAIP_MODAL_CONTROLS__, select = d.querySelector('select'), trigger = select.nextElementSibling, input = d.querySelector('#second');
  const scroll = d.querySelector('#scroll'), first = d.querySelector('#first');
  Object.defineProperties(scroll, {scrollHeight:{value:800}, clientHeight:{value:200}, offsetHeight:{value:200}});
  scroll.getBoundingClientRect = () => ({top:100,bottom:300,height:200});
  first.getBoundingClientRect = () => ({top:420,bottom:490,height:70});
  // Error block includes its help line; calculations are mocked, not pixel QA.
  d.querySelector('#save').focus();
  select.dispatchEvent(new w.Event('invalid', {cancelable:true}));
  input.dispatchEvent(new w.Event('invalid', {cancelable:true}));
  await tick();
  assert.equal(d.activeElement, trigger, 'first invalid native select wins over later fields');
  assert.equal(scroll.scrollTop, 190, 'only modal scroll ancestor reveals field plus help line');
  assert.equal(d.documentElement.scrollTop, 0, 'background document is not scrolled');
  assert.equal(api.revealInvalidField(d.querySelector('#outside')), false);
  assert.equal(api.revealInvalidField(d.querySelector('#confirm')), false, 'confirmation excluded');
  scroll.scrollTop = 0;
  select.dispatchEvent(new w.Event('invalid', {cancelable:true}));
  d.querySelector('dialog').open = false; d.querySelector('#outside').focus(); await tick();
  assert.equal(d.activeElement.id, 'outside', 'closing before scheduled focus must not steal focus');
  d.querySelector('dialog').open = true;
  select.dispatchEvent(new w.Event('invalid', {cancelable:true}));
  api.destroy(); d.querySelector('#outside').focus(); await tick();
  assert.equal(d.activeElement.id, 'outside', 'destroy cancels pending error focus');
  dom.window.close();
  console.log('PASS: first native error, proxy focus, bounded modal-only scroll, close and destroy cleanup (DOM/mocked geometry).');
}
main().then(testBulkImportSelect).then(testCountedResize).then(testInvalidFocus).catch(e => { console.error(e.stack || e); process.exit(1); });
