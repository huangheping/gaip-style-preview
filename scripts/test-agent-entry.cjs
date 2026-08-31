/* Code-only lifecycle regression. Uses temporary jsdom via NODE_PATH.
   WebGL/video/Lottie are stubbed; this is not browser visual or real Umi QA. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'AI Agent/AI Agent入口动效.js'), 'utf8');
const header = '<header><div class="right___fv3yS"><span class="date___mF83s">2026年08月31日 星期一</span></div></header>';
const entry = '<div class="globalButton___DVYbX"><div class="aiIcon___EMC2z"></div><div class="tipCard___OaM88"><span class="tipText___XhZAA">AI助手</span></div></div>';
const tick = () => new Promise(resolve => setTimeout(resolve, 80));

async function scenario(mode) {
  const dom = new JSDOM('<!doctype html><div id="root"></div><section id="business"></section>', {
    url: 'file://' + root + '/登录.html#/login', runScripts: 'outside-only', pretendToBeVisual: true
  });
  const w = dom.window, d = w.document, app = d.getElementById('root');
  const storage = new Map();
  const animations = [], observers = [];
  let destroyedOrbs = 0, frames = 0, pauses = 0;
  Object.defineProperty(w, 'localStorage', { value: {
    getItem: key => storage.get(key) || null,
    setItem: (key, value) => storage.set(key, value)
  }});
  w.ResizeObserver = class { observe() {} disconnect() { destroyedOrbs++; } };
  w.HTMLCanvasElement.prototype.getContext = () => null;
  w.HTMLMediaElement.prototype.play = () => Promise.resolve();
  w.HTMLMediaElement.prototype.pause = () => { pauses++; };
  const nativeRaf = w.requestAnimationFrame.bind(w);
  w.requestAnimationFrame = callback => { frames++; return nativeRaf(callback); };
  const NativeObserver = w.MutationObserver;
  w.MutationObserver = class extends NativeObserver {
    constructor(callback) { super(callback); observers.push(this); }
  };
  w.lottie = { loadAnimation(options) {
    const animation = { options, destroyed: false, destroy() { this.destroyed = true; },
      play() {}, goToAndStop() {}, addEventListener() {} };
    animations.push(animation);
    return animation;
  }};
  const icon = () => app.querySelector('.aiIcon___EMC2z');
  const version = () => app.querySelector('.globalButton___DVYbX').getAttribute('data-gaip-agent-entry-version');
  const assertReady = expected => {
    assert.equal(version(), expected, mode);
    assert.equal(icon().querySelectorAll('.gaip-agent-entry-orb').length, 1);
    assert.equal(icon().querySelectorAll('.gaip-agent-entry-lottie').length, 1);
    assert.equal(icon().querySelectorAll('video').length, 2);
    assert.equal(app.querySelectorAll('[data-gaip-agent-entry-version-trigger="time"]').length, 1);
  };
  try {
    if (mode === 'direct') app.innerHTML = header + entry;
    w.eval(source);
    await tick();
    if (mode === 'header-first') {
      app.innerHTML = header;
      await tick();
      app.insertAdjacentHTML('beforeend', entry);
    } else if (mode === 'entry-first') {
      app.innerHTML = entry;
      await tick();
      app.insertAdjacentHTML('afterbegin', header);
    }
    w.location.hash = '#/workspace';
    await tick();
    assertReady('2');
    app.querySelector('.date___mF83s').click();
    assertReady('1');
    assert.equal(storage.get('gaip-agent-entry-version'), '1');

    // Whole shell replacement, followed by header-only replacement.
    app.innerHTML = header + entry;
    w.location.hash = '#/clues';
    await tick();
    assertReady('1');
    assert.ok(destroyedOrbs >= 1);
    assert.ok(pauses >= 2);
    app.querySelector('header').outerHTML = header;
    await tick();
    app.querySelector('.date___mF83s').click();
    assertReady('2');
    assert.equal(storage.get('gaip-agent-entry-version'), '2');

    // Same icon node can have its injected children replaced by React.
    const oldIcon = icon();
    oldIcon.replaceChildren(d.createElement('svg'));
    await tick();
    assert.equal(icon(), oldIcon);
    assertReady('2');

    // Repeated Hash changes must neither duplicate mounts nor bind clicks twice.
    for (const hash of ['#/activity', '#/policy', '#/learning', '#/workspace']) {
      w.location.hash = hash;
      await tick();
      assertReady('2');
    }
    app.querySelector('.date___mF83s').click();
    assertReady('1');
    await tick();
    const beforeFrames = frames;
    for (let i = 0; i < 10; i++) d.getElementById('business').append(d.createElement('p'));
    await tick();
    assert.equal(frames, beforeFrames, 'unrelated business renders do not schedule entry work');

    // State, minimized flag, and selected version survive a processing remount.
    w.setGaipAgentProcessing(true);
    d.dispatchEvent(new w.CustomEvent('gaip-agent-entry-modal-minimized', { detail: { minimized: true } }));
    await tick();
    const previousAnimation = animations.at(-1);
    app.innerHTML = header + entry;
    await tick();
    assertReady('1');
    assert.equal(previousAnimation.destroyed, true);
    assert.notEqual(animations.at(-1), previousAnimation);
    assert.equal(animations.at(-1).options.container.isConnected, true);
    assert.equal(icon().getAttribute('data-gaip-agent-entry-state'), 'processing');
    assert.equal(app.querySelector('.globalButton___DVYbX').getAttribute('data-gaip-agent-modal-minimized'), 'true');
    w.setGaipAgentCompleted(true);
    await tick();
    assert.equal(icon().getAttribute('data-gaip-agent-entry-state'), 'completed');

    // Logout removes old resources; a later login mounts once with saved version.
    const lastAnimation = animations.at(-1);
    app.replaceChildren();
    w.location.hash = '#/login';
    await tick();
    assert.equal(lastAnimation.destroyed, true);
    app.innerHTML = header + entry;
    w.location.hash = '#/workspace';
    await tick();
    assertReady('1');
    w.setGaipAgentProcessing(false);
    console.log('PASS:', mode);
  } finally {
    observers.forEach(observer => observer.disconnect());
    w.close();
  }
}

(async () => {
  for (const mode of ['direct', 'header-first', 'entry-first']) await scenario(mode);
  for (const file of fs.readdirSync(root).filter(file => file.endsWith('.html'))) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    assert.equal(html.split('AI Agent/AI Agent入口动效.js').length - 1, 1, file);
    assert.ok(html.includes('AI Agent/AI Agent入口动效.js?v=20260831-1'), file);
  }
  console.log('PASS: all entry shells use the updated shared script.');
  console.log('NOT VERIFIED: actual Umi login/navigation, video playback or WebGL rendering.');
})().catch(error => { console.error(error); process.exitCode = 1; });
