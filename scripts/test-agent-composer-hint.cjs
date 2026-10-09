/* Lifecycle/state regression; animation pixels and native Umi remain separate checks. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const source = fs.readFileSync('components/ai-agent/AI Agent本地Mock.js', 'utf8');
const tick = () => new Promise(resolve => setTimeout(resolve, 80));

async function scenario(version) {
  const dom = new JSDOM('<section class="agentModal___Nxp06"><div class="modalRenderWrapper___qz3XP"><div id="agentModalContentArea"><div class="chatPanel___qIDO_"><ul class="msgBox___NYtlO"><li>Existing</li></ul></div></div><div class="footerBox___QzN5g"><div class="container___jv7uB"></div><div class="inputRow___Sqmy8"><textarea class="textarea___GMXtD" placeholder="建议说你的目标或补充信息，我可以记住上下文"></textarea><button class="sendBtn___m_z0G">Send</button></div></div></div></section>', {
    url: 'http://localhost/channels/workspace/index.html?agentPlanPicker=' + version + '#/workspace',
    runScripts: 'outside-only', pretendToBeVisual: true
  });
  const w = dom.window, d = w.document;
  const observers = [], NativeObserver = w.MutationObserver;
  w.MutationObserver = class extends NativeObserver { constructor(cb) { super(cb); observers.push(this); } };
  let callbacks = 0;
  const monitoring = new NativeObserver(() => callbacks++);
  monitoring.observe(d.body, { childList: true, subtree: true, attributes: true });
  const original = d.querySelector('textarea');
  const change = value => {
    const input = d.querySelector('textarea');
    input.value = value;
    input.dispatchEvent(new w.Event('input', { bubbles: true }));
    return input;
  };
  try {
    w.eval(source); await tick();
    const hint = () => d.querySelector('.gaip-agent-composer-placeholder');
    assert.equal(d.querySelector('textarea'), original, 'React textarea remains the original node');
    assert.equal(original.placeholder, '有问题，随时问我…');
    assert.equal(hint().hidden, false);
    assert.equal(hint().getAttribute('aria-hidden'), 'true');
    assert.deepEqual([...hint().querySelectorAll('span')].map(x => x.textContent), ['有问题，随时问我…', '输入 / 以查看可用方案技能', '有问题，随时问我…']);
    change('已有草稿 /');
    assert.equal(hint().hidden, true, 'Typing hides the overlay synchronously');
    original.setSelectionRange(2, 4);
    original.placeholder = 'React reapplies old placeholder'; await tick();
    assert.equal(original.value, '已有草稿 /', 'Hint updates preserve draft text');
    assert.equal(original.selectionStart, 2);
    assert.equal(original.selectionEnd, 4);
    assert.equal(original.placeholder, '有问题，随时问我…');
    change(''); assert.equal(hint().hidden, false);
    change(' '); assert.equal(hint().hidden, true, 'Whitespace is still input, matching mobile');
    const tag = d.createElement('span'); tag.className = 'tag___PKl7Z skillTag___g4XXW'; tag.textContent = 'Selected plan';
    d.querySelector('.container___jv7uB').append(tag);
    change(''); await tick();
    assert.equal(hint().hidden, false, 'Selected plan alone does not replace the hints');
    const replacement = original.cloneNode(); replacement.value = 'React remounted draft';
    original.replaceWith(replacement); await tick();
    assert.equal(hint().hidden, true, 'Remount picks up the new textarea value');
    assert.equal(d.querySelectorAll('.gaip-agent-composer-placeholder').length, 1);
    replacement.value = '';
    d.querySelector('.sendBtn___m_z0G:not(.gaip-agent-stop):not(.gaip-agent-voice-send)').click(); await tick();
    assert.equal(hint().hidden, false, 'Native send clearing restores hints without replacing controls');
    const stable = callbacks; await tick();
    assert.equal(callbacks, stable, 'Hint observer settles rather than continuously mutating');
    console.log('PASS composer hints: ' + version + ', typing/clear/plan/send/remount, native draft/selection, settled observer');
  } finally {
    monitoring.disconnect(); observers.forEach(x => x.disconnect()); w.close();
  }
}
(async () => { await scenario('transition'); await scenario('current'); })().catch(error => { console.error(error); process.exitCode = 1; });
