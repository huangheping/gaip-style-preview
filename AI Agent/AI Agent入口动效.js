(function () {
const items = [
  {
    key: "creative-3",
    fallback: "./assets/elevenlabs/creative-3.04cea590.png",
    texture: "./assets/elevenlabs/creative-3.b08cc4fe.webp",
  },
  {
    key: "creative-9",
    fallback: "./assets/elevenlabs/creative-9.e00adc24.png",
    texture: "./assets/elevenlabs/creative-9.1a6c0a5a.webp",
  },
  {
    key: "creative-5",
    fallback: "./assets/elevenlabs/creative-5.f21107e1.png",
    texture: "./assets/elevenlabs/creative-5.d389d3b1.webp",
  },
  {
    key: "creative-1",
    fallback: "./assets/elevenlabs/creative-1.be8a6b68.png",
    texture: "./assets/elevenlabs/creative-1.18030cd4.webp",
  },
  {
    key: "creative-4",
    fallback: "./assets/elevenlabs/creative-4.60676b95.png",
    texture: "./assets/elevenlabs/creative-4.b3ca4b88.webp",
  },
  {
    key: "creative-8",
    fallback: "./assets/elevenlabs/creative-8.2ab723e3.png",
    texture: "./assets/elevenlabs/creative-8.70d73cd4.webp",
  },
];

const orbs = document.querySelector("#orbs");

function render() {
  orbs.replaceChildren();

  items.forEach((item, index) => {
    const card = document.createElement("article");
    card.className = "orb-card";
    card.dataset.key = item.key;
    card.setAttribute("aria-label", `Orb ${index + 1}: ${item.key}`);

    const frame = document.createElement("div");
    frame.className = "orb-frame";

    const image = document.createElement("img");
    image.className = "fallback";
    image.src = item.fallback;
    image.alt = "";
    frame.append(image);

    const host = document.createElement("div");
    host.className = "shader-host";
    frame.append(host);
    new VoiceOrb(host, item.texture);

    const label = document.createElement("div");
    label.className = "orb-label";
    label.textContent = `${String(index + 1).padStart(2, "0")} · ${item.key}`;

    card.append(frame);
    card.append(label);
    orbs.append(card);
  });
}

class VoiceOrb {
  constructor(container, textureUrl) {
    this.container = container;
    this.textureUrl = textureUrl;
    this.gl = null;
    this.program = null;
    this.texture = null;
    this.frame = 0;
    this.start = performance.now();
    this.last = this.start;
    this.audioAverage = new Float32Array(4);
    this.cumulativeAudio = new Float32Array(4);
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.init();
  }

  async init() {
    const canvas = document.createElement("canvas");
    this.container.append(canvas);
    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
      powerPreference: "high-performance",
    });

    if (!gl) return;
    this.gl = gl;
    this.canvas = canvas;
    this.program = createProgram(gl, vertexShader, fragmentShader);

    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    const position = gl.getAttribLocation(this.program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    this.uniforms = {
      time: gl.getUniformLocation(this.program, "uTime"),
      resolution: gl.getUniformLocation(this.program, "uResolution"),
      audio: gl.getUniformLocation(this.program, "uAudioAverage"),
      cumulative: gl.getUniformLocation(this.program, "uCumulativeAudio"),
      texture: gl.getUniformLocation(this.program, "uTexture"),
    };

    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([20, 54, 47, 255]),
    );

    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      if (!this.gl) return;
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    };
    image.src = this.textureUrl;

    this.resizeObserver.observe(this.container);
    this.resize();
    this.tick = this.tick.bind(this);
    this.frame = requestAnimationFrame(this.tick);
  }

  resize() {
    if (!this.gl) return;
    const dpr = Math.min(devicePixelRatio, 2);
    const width = Math.max(1, Math.round(this.container.clientWidth * dpr));
    const height = Math.max(1, Math.round(this.container.clientHeight * dpr));
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
    this.gl.viewport(0, 0, width, height);
  }

  tick(now) {
    if (!this.gl) return;
    this.last = now;

    const gl = this.gl;
    gl.useProgram(this.program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.uniform1i(this.uniforms.texture, 0);
    gl.uniform1f(this.uniforms.time, ((now - this.start) / 1000) * 1.4);
    gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
    gl.uniform4fv(this.uniforms.audio, this.audioAverage);
    gl.uniform4fv(this.uniforms.cumulative, this.cumulativeAudio);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    this.frame = requestAnimationFrame(this.tick);
  }

  destroy() {
    cancelAnimationFrame(this.frame);
    this.resizeObserver.disconnect();
    if (this.gl) {
      this.gl.getExtension("WEBGL_lose_context")?.loseContext();
    }
    this.gl = null;
  }
}

function createProgram(gl, vertex, fragment) {
  const program = gl.createProgram();
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vertex));
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fragment));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program));
  }
  gl.useProgram(program);
  return program;
}

function compile(gl, type, sourceCode) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, sourceCode);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader));
  }
  return shader;
}

const vertexShader = `#version 300 es
in vec2 position;
out vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const fragmentShader = `#version 300 es
precision highp float;

in vec2 vUv;
uniform float uTime;
uniform vec2 uResolution;
uniform vec4 uAudioAverage;
uniform vec4 uCumulativeAudio;
uniform sampler2D uTexture;
out vec4 outColor;

vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
vec4 permute(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 1.0 / 7.0;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m *= m;
  return 42.0 * dot(m * m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float valueNoise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x)
    + (c - a) * u.y * (1.0 - u.x)
    + (d - b) * u.x * u.y;
}

float fbm(vec2 st) {
  float value = 0.0;
  float amplitude = 0.5;
  vec2 shift = vec2(100.0);
  mat2 rotation = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
  for (int i = 0; i < 4; i++) {
    value += amplitude * valueNoise(st);
    st = rotation * st * 2.0 + shift;
    amplitude *= 0.5;
  }
  return value;
}

float overlay(float base, float blend) {
  return base < 0.5 ? 2.0 * base * blend : 1.0 - 2.0 * (1.0 - base) * (1.0 - blend);
}

vec3 hardLight(vec3 base, vec3 blend, float opacity) {
  vec3 result;
  result.r = overlay(blend.r, base.r);
  result.g = overlay(blend.g, base.g);
  result.b = overlay(blend.b, base.b);
  return mix(base, result, opacity);
}

void main() {
  vec2 uv = vec2(1.0 - vUv.x, vUv.y);
  vec2 sphere = (uv - 0.5) * 2.0;
  float depth = sqrt(max(1.0 - clamp(dot(sphere, sphere), 0.0, 1.0), 0.0));
  depth = pow(depth, 1.1);
  vec3 normals = vec3(sphere, depth);
  sphere /= (vec2(depth) + 1.0) * (1.0 / 0.9);
  uv = (sphere + 1.0) * 0.5;

  float t1 = uTime * 4.5;
  float t2 = uTime * 2.25 + uCumulativeAudio.x * 0.25;
  vec2 p = uv * 3.25;
  vec2 q = vec2(fbm(p), fbm(p + vec2(1.0)));
  vec2 r = vec2(
    fbm(p + q + vec2(91.3, 0.55) + 0.15 * t2),
    fbm(p + q - vec2(45.33, 1.2) + 0.126 * t2)
  );
  float f = fbm(p + r + vec2(t1 * 0.01));
  float warp = mix(0.8, 0.66, clamp(f * f * 2.75, 0.0, 1.0));
  warp = mix(warp, 0.0, clamp(length(q), 0.0, 1.0));
  warp = mix(warp, 1.0, clamp(abs(r.x), 0.0, 1.0));

  float noiseTimeA = uTime * 0.125 + uCumulativeAudio.z * 0.1;
  float noiseTimeB = uTime * 0.25;
  vec2 noiseDisp = vec2(
    snoise(vec3(vUv * 0.65, noiseTimeA)),
    snoise(vec3(vUv * 0.65 + vec2(54.0), noiseTimeB))
  );
  noiseDisp *= 1.0 + uAudioAverage.z * 0.25;
  uv += normals.xy * (warp - 0.5) * 0.65;
  uv += noiseDisp * 0.15;

  vec3 color = texture(uTexture, clamp(uv, 0.001, 0.999)).rgb;

  vec2 ringUv = (vUv - 0.5) * 1.5;
  float angle = atan(ringUv.y, ringUv.x);
  float radius = length(ringUv);
  float ringTime = -uTime * 0.5 - uCumulativeAudio.a * 0.2;
  ringUv.x += 1.0 + uAudioAverage.y * 1.5;
  float n = snoise(vec3(ringUv * (0.65 + uAudioAverage.x * 0.4), ringTime * 0.5)) * 0.5 + 0.5;
  float edge = mix(mix(0.25, 1.0, 0.75), mix(0.25, 1.0, 0.2), n);
  float light = cos(angle + ringTime * 2.0) * 0.5 + 0.5;
  float v2 = smoothstep(1.0, mix(0.25, 1.0, n * 0.5), radius);
  float v3 = pow(smoothstep(0.25, mix(0.25, 1.0, n * 0.75), radius), 2.0);
  light = clamp(pow(light * v2 * v3 * min(uAudioAverage.a * 4.0, 1.0), 3.0), 0.0, 1.0);
  color += vec3(light) * 0.25;
  color = hardLight(color, vec3(1.0), length(noiseDisp) * 0.01 * 0.1);
  color = clamp(color * 1.15, 0.0, 1.0);

  outColor = vec4(color, 1.0);
}`;

const gaipAgentEntryAssets = {
  lottieRuntime: './AI Agent/素材/lottie.min.js',
  processing: './AI Agent/素材/ai-agent-radar.json',
  completed: './AI Agent/素材/ai-agent-completed.json',
  version1: './AI Agent/素材/creative-3.04cea590.png',
  version2Poster: './AI Agent/素材/入口版本2.png',
  version2Video: './AI Agent/素材/机器人猫客服悬浮入口循环动画v2.mp4',
  version2ProcessingVideo: './AI Agent/素材/机器人猫小面罩代码滚动悬浮入口循环动画v2.mp4',
};

let gaipAgentEntryObserver = null;
let gaipAgentEntryLottieRuntimePromise = null;
let gaipAgentEntryAnimation = null;
let gaipAgentEntryAnimationState = '';
let gaipAgentEntryRequestedState = 'idle';
let gaipAgentEntryVersion = 2;
let gaipAgentEntryModalMinimized = false;
let gaipAgentEntryTipTimer = null;
let gaipAgentEntryTipIndex = 0;

const gaipAgentEntryProcessingTips = [
  '自动化AI正在处理中',
  '正在加速处理中',
  '方案内容生成中',
];

function readGaipAgentEntryVersion() {
  let stored = '';
  let defaultV2Applied = false;
  try {
    if (window.localStorage) {
      stored = window.localStorage.getItem('gaip-agent-entry-version');
      defaultV2Applied = window.localStorage.getItem('gaip-agent-entry-default-v2-applied') === 'true';
      if (!defaultV2Applied) {
        window.localStorage.setItem('gaip-agent-entry-version', '2');
        window.localStorage.setItem('gaip-agent-entry-default-v2-applied', 'true');
        return 2;
      }
    }
  } catch (error) {
    stored = '';
  }
  return stored === '1' ? 1 : 2;
}

function saveGaipAgentEntryVersion(version) {
  gaipAgentEntryVersion = version === 2 ? 2 : 1;
  try {
    if (window.localStorage) window.localStorage.setItem('gaip-agent-entry-version', String(gaipAgentEntryVersion));
  } catch (error) {
    // 本地预览环境可能禁用 localStorage，禁用时只保留当前页面状态。
  }
}

function applyGaipAgentEntryVersion(entry) {
  const targetEntry = entry || document.querySelector('[class*="globalButton___"]');
  const icon = targetEntry && targetEntry.querySelector('[data-gaip-agent-entry-orb-ready="true"]');
  const fallback = icon && icon.querySelector('.gaip-agent-entry-orb-fallback');
  const videos = icon ? Array.prototype.slice.call(icon.querySelectorAll('.gaip-agent-entry-orb-video')) : [];
  const version = gaipAgentEntryVersion === 2 ? 2 : 1;
  const imagePath = version === 2 ? gaipAgentEntryAssets.version2Poster : gaipAgentEntryAssets.version1;

  if (targetEntry) {
    targetEntry.setAttribute('data-gaip-agent-entry-version', String(version));
    targetEntry.setAttribute('title', 'AI Agent入口样式 V' + version);
    targetEntry.setAttribute('data-gaip-agent-modal-minimized', gaipAgentEntryModalMinimized ? 'true' : 'false');
  }
  if (icon) icon.setAttribute('data-gaip-agent-entry-version', String(version));
  if (fallback && fallback.getAttribute('src') !== imagePath) fallback.setAttribute('src', imagePath);
  videos.forEach(function (video) {
    if (version === 2) {
      video.play && video.play().catch(function () {});
    } else {
      video.pause && video.pause();
    }
  });
}

function toggleGaipAgentEntryVersion() {
  saveGaipAgentEntryVersion(gaipAgentEntryVersion === 1 ? 2 : 1);
  applyGaipAgentEntryVersion();
}

function isGaipAgentHeaderTimeText(text) {
  const normalizedText = String(text || '').replace(/\s+/g, ' ').trim();
  return /(\d{4}[年/-]\d{1,2}[月/-]\d{1,2})|(\d{1,2}:\d{2})|(星期|周)[一二三四五六日天]/.test(normalizedText);
}

function findGaipAgentHeaderTimeTarget() {
  const hosts = Array.prototype.slice.call(document.querySelectorAll('[data-gaip-region="user-actions"], [class*="right___"], .umi-plugin-layout-right'));
  let match = null;

  hosts.some(function (host) {
    const nodes = Array.prototype.slice.call(host.querySelectorAll('time, span, div, p'));
    return nodes.some(function (node) {
      const text = node.textContent || '';
      const hasInteractiveChild = !!node.querySelector('button, a, input, textarea, select, [role="button"], .umi-plugin-layout-avatar, [class*="avatar"]');
      const hasNestedTimeText = Array.prototype.slice.call(node.children || []).some(function (child) {
        return isGaipAgentHeaderTimeText(child.textContent || '');
      });
      if (hasInteractiveChild || hasNestedTimeText || !isGaipAgentHeaderTimeText(text)) return false;
      match = node;
      return true;
    });
    return !!match;
  });

  return match;
}

function ensureGaipAgentEntryVersionTimeToggle() {
  const oldButton = document.querySelector('.gaip-agent-entry-version-switch');
  const timeTarget = findGaipAgentHeaderTimeTarget();
  if (oldButton) oldButton.remove();
  if (!timeTarget || timeTarget.__gaipAgentEntryVersionTimeBound) return;

  timeTarget.__gaipAgentEntryVersionTimeBound = true;
  timeTarget.setAttribute('data-gaip-agent-entry-version-trigger', 'time');
  timeTarget.addEventListener('click', function (event) {
    event.stopPropagation();
    toggleGaipAgentEntryVersion();
  });

  const host = timeTarget.closest('[data-gaip-region="user-actions"], [class*="right___fv3yS"]');
  if (host && !host.__gaipAgentEntryVersionTimeCleanupBound) {
    host.__gaipAgentEntryVersionTimeCleanupBound = true;
    host.addEventListener('click', function () {
      window.setTimeout(ensureGaipAgentEntryVersionTimeToggle, 0);
    });
  }

  applyGaipAgentEntryVersion();
}

function normalizeGaipAgentEntryState(state) {
  return ['idle', 'processing', 'completed'].includes(state) ? state : 'idle';
}

function findGaipAgentEntryTipCard(entry) {
  return entry && entry.querySelector('[class*="tipCard___"]');
}

function setGaipAgentEntryTipMessage(message) {
  const entry = document.querySelector('[class*="globalButton___"]');
  const tipCard = findGaipAgentEntryTipCard(entry);
  const tipText = tipCard && (tipCard.querySelector('[class*="tipText___"]') || tipCard.firstElementChild || tipCard);
  if (!entry || !tipCard) return;
  if (!tipText.__gaipAgentOriginalTipHTML) {
    tipText.__gaipAgentOriginalTipHTML = tipText.innerHTML;
  }

  if (message) {
    entry.setAttribute('data-gaip-agent-tip-mode', 'custom');
    tipText.textContent = message;
    return;
  }

  entry.removeAttribute('data-gaip-agent-tip-mode');
  tipText.innerHTML = tipText.__gaipAgentOriginalTipHTML;
}

function syncGaipAgentEntryTipMessage() {
  if (gaipAgentEntryRequestedState === 'processing') {
    setGaipAgentEntryTipMessage(gaipAgentEntryProcessingTips[gaipAgentEntryTipIndex % gaipAgentEntryProcessingTips.length]);
    return;
  }

  if (gaipAgentEntryRequestedState === 'completed' && gaipAgentEntryModalMinimized) {
    setGaipAgentEntryTipMessage('AI自动化处理已完成');
    return;
  }

  setGaipAgentEntryTipMessage('');
}

function syncGaipAgentEntryTipTimer() {
  if (gaipAgentEntryRequestedState !== 'processing') {
    if (gaipAgentEntryTipTimer) {
      window.clearInterval(gaipAgentEntryTipTimer);
      gaipAgentEntryTipTimer = null;
    }
    return;
  }

  if (gaipAgentEntryTipTimer) return;
  gaipAgentEntryTipTimer = window.setInterval(function () {
    if (gaipAgentEntryRequestedState !== 'processing') {
      syncGaipAgentEntryTipTimer();
      return;
    }
    gaipAgentEntryTipIndex = (gaipAgentEntryTipIndex + 1) % gaipAgentEntryProcessingTips.length;
    syncGaipAgentEntryTipMessage();
  }, 1800);
}

function loadGaipAgentEntryLottieRuntime() {
  if (window.lottie) return Promise.resolve(window.lottie);
  if (gaipAgentEntryLottieRuntimePromise) return gaipAgentEntryLottieRuntimePromise;

  gaipAgentEntryLottieRuntimePromise = new Promise(function (resolve, reject) {
    const script = document.createElement('script');
    script.src = gaipAgentEntryAssets.lottieRuntime;
    script.async = true;
    script.onload = function () { resolve(window.lottie); };
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return gaipAgentEntryLottieRuntimePromise;
}

function mountGaipAgentEntryStateAnimation(icon, state) {
  const host = icon && icon.querySelector('.gaip-agent-entry-lottie');
  if (!host || state === 'idle') {
    if (gaipAgentEntryAnimation) gaipAgentEntryAnimation.goToAndStop(0, true);
    gaipAgentEntryAnimationState = 'idle';
    return;
  }

  loadGaipAgentEntryLottieRuntime().then(function (lottie) {
    if (!lottie || !host.isConnected) return;
    const latestState = normalizeGaipAgentEntryState(gaipAgentEntryRequestedState);
    if (latestState !== state || latestState === 'idle') return;
    const isCompleted = latestState === 'completed';
    const animationPath = isCompleted ? gaipAgentEntryAssets.completed : gaipAgentEntryAssets.processing;

    if (gaipAgentEntryAnimationState !== latestState) {
      if (gaipAgentEntryAnimation) gaipAgentEntryAnimation.destroy();
      host.replaceChildren();
      gaipAgentEntryAnimation = lottie.loadAnimation({
        container: host,
        renderer: 'svg',
        loop: !isCompleted,
        autoplay: !isCompleted,
        path: animationPath,
      });
      gaipAgentEntryAnimationState = latestState;
      if (isCompleted) {
        gaipAgentEntryAnimation.addEventListener('DOMLoaded', function () {
          gaipAgentEntryAnimation.goToAndStop(0, true);
        });
      }
      return;
    }

    if (isCompleted) gaipAgentEntryAnimation.goToAndStop(0, true);
    else gaipAgentEntryAnimation.play();
  }).catch(function () {
    gaipAgentEntryAnimationState = 'idle';
  });
}

function setGaipAgentEntryState(state) {
  const normalizedState = normalizeGaipAgentEntryState(state);
  const entry = document.querySelector('[class*="globalButton___"]');
  const icon = entry && entry.querySelector('[data-gaip-agent-entry-orb-ready="true"]');

  gaipAgentEntryRequestedState = normalizedState;
  syncGaipAgentEntryTipTimer();
  syncGaipAgentEntryTipMessage();
  if (!entry || !icon) return;

  entry.dataset.agentState = normalizedState;
  entry.setAttribute('data-gaip-agent-entry-state', normalizedState);
  icon.setAttribute('data-gaip-agent-entry-state', normalizedState);
  applyGaipAgentEntryVersion(entry);
  mountGaipAgentEntryStateAnimation(icon, normalizedState);
  syncGaipAgentEntryTipMessage();
}

function mountGaipAgentEntryOrb() {
  const entry = document.querySelector('[class*="globalButton___"]');
  if (!entry) return;

  const icon = entry.querySelector('[class*="aiIcon___"]');
  if (!icon || icon.getAttribute('data-gaip-agent-entry-orb-ready') === 'true') return;

  entry.setAttribute('data-gaip-agent-entry', 'true');
  icon.setAttribute('data-gaip-agent-entry-orb-ready', 'true');

  const orb = document.createElement('div');
  orb.className = 'gaip-agent-entry-orb';

  const image = document.createElement('img');
  image.className = 'gaip-agent-entry-orb-fallback';
  image.src = gaipAgentEntryVersion === 2 ? gaipAgentEntryAssets.version2Poster : gaipAgentEntryAssets.version1;
  image.alt = '';
  orb.append(image);

  function createEntryVideo(className, src) {
    const video = document.createElement('video');
    video.className = className;
    video.src = src;
    video.poster = gaipAgentEntryAssets.version2Poster;
    video.muted = true;
    video.loop = true;
    video.autoplay = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.setAttribute('muted', '');
    video.setAttribute('loop', '');
    video.setAttribute('autoplay', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('preload', 'auto');
    video.setAttribute('aria-hidden', 'true');
    return video;
  }

  orb.append(createEntryVideo('gaip-agent-entry-orb-video gaip-agent-entry-orb-video-idle', gaipAgentEntryAssets.version2Video));
  orb.append(createEntryVideo('gaip-agent-entry-orb-video gaip-agent-entry-orb-video-processing', gaipAgentEntryAssets.version2ProcessingVideo));

  const host = document.createElement('div');
  host.className = 'gaip-agent-entry-orb-shader';
  orb.append(host);

  const lottieHost = document.createElement('div');
  lottieHost.className = 'gaip-agent-entry-lottie';
  lottieHost.setAttribute('aria-hidden', 'true');

  icon.insertBefore(orb, icon.firstChild);
  icon.insertBefore(lottieHost, orb.nextSibling);
  new VoiceOrb(host, './AI Agent/素材/creative-3.b08cc4fe.webp');
  applyGaipAgentEntryVersion(entry);
  setGaipAgentEntryState(gaipAgentEntryRequestedState);

  if (gaipAgentEntryObserver) {
    gaipAgentEntryObserver.disconnect();
    gaipAgentEntryObserver = null;
  }
}

let gaipAgentEntryOrbScheduled = false;

function scheduleGaipAgentEntryOrb() {
  if (gaipAgentEntryOrbScheduled) return;
  gaipAgentEntryOrbScheduled = true;
  requestAnimationFrame(function () {
    gaipAgentEntryOrbScheduled = false;
    ensureGaipAgentEntryVersionTimeToggle();
    mountGaipAgentEntryOrb();
  });
}

gaipAgentEntryVersion = readGaipAgentEntryVersion();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scheduleGaipAgentEntryOrb, { once: true });
} else {
  scheduleGaipAgentEntryOrb();
}

gaipAgentEntryObserver = new MutationObserver(scheduleGaipAgentEntryOrb);
gaipAgentEntryObserver.observe(document.documentElement, {
  childList: true,
  subtree: true,
});

document.addEventListener('gaip-agent-entry-state', function (event) {
  setGaipAgentEntryState(event && event.detail && event.detail.state);
});

document.addEventListener('gaip-agent-entry-modal-minimized', function (event) {
  gaipAgentEntryModalMinimized = !!(event && event.detail && event.detail.minimized);
  applyGaipAgentEntryVersion();
  syncGaipAgentEntryTipMessage();
});

document.addEventListener('click', function (event) {
  if (!event.target || !event.target.closest || !event.target.closest('[class*="globalButton___"]')) return;
  if (gaipAgentEntryRequestedState === 'completed') {
    setGaipAgentEntryState('idle');
  }
}, true);

document.addEventListener('gaip-agent-entry-completed-consumed', function () {
  if (gaipAgentEntryRequestedState === 'completed') {
    setGaipAgentEntryState('idle');
  }
});

window.setGaipAgentEntryVersion = function (version) {
  saveGaipAgentEntryVersion(version);
  applyGaipAgentEntryVersion();
};

window.toggleGaipAgentEntryVersion = toggleGaipAgentEntryVersion;

window.setGaipAgentState = function (state) {
  setGaipAgentEntryState(state);
};

window.setGaipAgentProcessing = function (processing) {
  setGaipAgentEntryState(processing ? 'processing' : 'idle');
};

window.setGaipAgentCompleted = function (completed) {
  setGaipAgentEntryState(completed === false ? 'idle' : 'completed');
};
})();
