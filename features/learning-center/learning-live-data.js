/* V1.2 local Banner state. Intentionally separate from course/progress storage. */
(function () {
  'use strict';
  var D = window.__GAIP_LEARNING_DATA__, KEY = 'gaip-learning-live-v12', state;
  function clone(v) { return JSON.parse(JSON.stringify(v)); }
  try { state = JSON.parse(localStorage.getItem(KEY)); } catch (_) {}
  if (!state || state.version !== 1 || !Array.isArray(state.banners) || !Array.isArray(state.logs)) state = { version: 1, banners: [], logs: [] };
  var names = { draft: '草稿', published: '已上架', offline: '已下架' };
  function check(ok, message, field) { if (!ok) { var e = new Error(message); e.field = field; throw e; } }
  function admin() { return D.admin('live'); }
  function permitted() { check(admin(), '没有直播管理权限'); }
  function get(id) { return state.banners.find(function (b) { return b.id === id; }); }
  function stamp(n) { return new Date(n == null ? Date.now() : n).toISOString(); }
  function seedExamples() {
    var batch = 'live-examples-20260916';
    if (state.mockBatches && state.mockBatches[batch]) return;
    var next = clone(state), now = Date.now(), day = 86400000;
    var examples = [
      ['arkos', 'ArkOS 全球市场分享', 'published', 'live-product-service-20260917.jpg', ['all']],
      ['pathway', '财富规划专题交流', 'published', 'live-two-guests-20260917.jpg', ['香港业务']],
      ['camp', '全球财富研习营', 'published', 'course-06-wealth-camp.jpg', ['新加坡业务', '美国业务']],
      ['scheduled', '企业家客户经营专场', 'draft', 'course-04-ceo-luncheon.jpg', ['all'], true],
      ['url', '顾问服务线上交流', 'draft', 'course-05-vessels.jpg', ['香港业务', '新加坡业务']],
      ['incomplete', '待完善的直播配置', 'draft', '', []],
      ['history-market', '往期市场趋势分享', 'offline', 'course-03-reckoning.jpg', ['all']],
      ['history-service', '往期客户服务沙龙', 'offline', 'course-05-vessels.jpg', ['all']]
    ];
    function mockLog(b, action, before, after, at) {
      var id = b.id + '-log-' + action;
      if (next.logs.some(function (r) { return r.id === id; })) return;
      next.logs.push({id:id, project:'直播 Banner', object:b.name, action:action, field:action==='新增'?'Banner':'Banner 状态', before:before, after:after, operator:'示例管理员', account:'mock.live.demo', ip:'192.0.2.10', at:stamp(at), mock:true});
    }
    examples.forEach(function (row, i) {
      var id = 'live-demo-20260916-' + row[0], name = '【示例】' + row[1];
      var content = row[0] === 'incomplete' ? '' : row[0] === 'url' ? 'https://example.com/live/demo?topic=advisor-service&source=gaip-local-preview&campaign=learning-center-demo' : 'MOCK-LIVE-' + row[0].toUpperCase();
      // Never replace an existing record, or introduce a conflicting name/target.
      if (next.banners.some(function (b) { return b.id === id || b.name === name || content && b.status !== 'offline' && b.content === content; })) return;
      var published = row[2] === 'published', offline = row[2] === 'offline';
      var start = published ? now - (i + 1) * 3600000 : offline ? now - (i + 3) * day : now + (i - 2) * day;
      var end = offline ? start + 3600000 : now + 14 * day;
      var b = {id:id, name:name, image:row[3]?'assets/learning/'+row[3]:'', imageName:row[3], type:row[0]==='incomplete'?'':row[0]==='url'?'url':'id', content:content, groups:row[4], startAt:row[0]==='incomplete'?'':stamp(start), endAt:row[0]==='incomplete'?'':stamp(end), status:row[2], scheduled:!!row[5], createdAt:stamp(start-2*day), updatedAt:stamp(offline?end:published?start:now-i*60000), updatedBy:'示例管理员', mock:true};
      if (published || offline) b.publishedAt = stamp(start);
      if (offline) b.offlineAt = stamp(end);
      if (b.status === 'draft') b.createdAt = stamp(now - (i + 2) * day);
      next.banners.push(b);
      mockLog(b,'新增','—',b.name,Date.parse(b.createdAt));
      if (published || offline) mockLog(b,'上架','草稿','已上架',start);
      if (offline) mockLog(b,'下架','已上架','已下架',end);
    });
    next.mockBatches = Object.assign({}, next.mockBatches); next.mockBatches[batch] = stamp(now);
    // Persist the batch and marker together; failed writes remain retryable.
    try { localStorage.setItem(KEY, JSON.stringify(next)); state = next; }
    catch (_) { console.warn('直播示例数据未保存：本地存储不可用或空间不足，原数据保持不变。'); }
  }
  seedExamples();
  // Add public presentation metadata only to the known demo records, once.
  // Never reinterpret advertisement scheduling as the actual broadcast start.
  function seedPresentation() {
    var batch = 'live-presentation-20260917';
    if (state.mockBatches && state.mockBatches[batch]) return;
    var next = clone(state), now = Date.now();
    var samples = {
      arkos: ['GLORY产品及服务说明会预告：全球视野 · 传承洞察', '每周四早八点不见不散', now + 4 * 86400000],
      pathway: ['财富规划专题交流', '资产配置与客户服务实践', now - 15 * 60000],
      camp: ['全球财富研习营', '跨境视野与专业服务交流', now + 86400000]
    };
    Object.keys(samples).forEach(function (key) {
      var b = next.banners.find(function (item) { return item.id === 'live-demo-20260916-' + key && item.mock; });
      if (!b) return;
      var values = samples[key];
      if (b.publicTitle == null) b.publicTitle = values[0];
      if (b.summary == null) b.summary = values[1];
      if (b.liveStartAt == null) b.liveStartAt = stamp(values[2]);
    });
    next.mockBatches = Object.assign({}, next.mockBatches); next.mockBatches[batch] = stamp(now);
    try { localStorage.setItem(KEY, JSON.stringify(next)); state = next; }
    catch (_) { console.warn('直播展示示例未保存，原数据保持不变。'); }
  }
  seedPresentation();
  function replaceDemoCover() {
    var batch = 'live-product-service-cover-20260917';
    if (state.mockBatches && state.mockBatches[batch]) return;
    var next = clone(state), b = next.banners.find(function (item) { return item.id === 'live-demo-20260916-arkos' && item.mock; });
    // Only migrate the known placeholder. Preserve uploads, deleted records and all other data.
    if (b && b.image === 'assets/learning/course-01-arkos.jpg') {
      b.image = 'assets/learning/live-product-service-20260917.jpg';
      b.imageName = 'live-product-service-20260917.jpg';
    }
    next.mockBatches = Object.assign({}, next.mockBatches); next.mockBatches[batch] = stamp();
    try { localStorage.setItem(KEY, JSON.stringify(next)); state = next; }
    catch (_) { console.warn('直播示例封面未保存，原数据保持不变。'); }
  }
  replaceDemoCover();
  function replaceSecondDemoCover() {
    var batch = 'live-two-guests-cover-20260917';
    if (state.mockBatches && state.mockBatches[batch]) return;
    var next = clone(state), b = next.banners.find(function (item) { return item.id === 'live-demo-20260916-pathway' && item.mock; });
    if (b && b.image === 'assets/learning/course-02-pathway.jpg') {
      b.image = 'assets/learning/live-two-guests-20260917.jpg';
      b.imageName = 'live-two-guests-20260917.jpg';
    }
    next.mockBatches = Object.assign({}, next.mockBatches); next.mockBatches[batch] = stamp();
    try { localStorage.setItem(KEY, JSON.stringify(next)); state = next; }
    catch (_) { console.warn('第二个直播示例封面未保存，原数据保持不变。'); }
  }
  replaceSecondDemoCover();
  function updateFirstDemoCopy() {
    var batch = 'live-product-service-copy-20260917';
    if (state.mockBatches && state.mockBatches[batch]) return;
    var next = clone(state), b = next.banners.find(function (item) { return item.id === 'live-demo-20260916-arkos' && item.mock; });
    if (b) {
      if (b.publicTitle == null || b.publicTitle === '全球视野 · 传承洞察') b.publicTitle = 'GLORY产品及服务说明会预告：全球视野 · 传承洞察';
      if (b.summary == null || b.summary === '全球市场与财富规划专题分享') b.summary = '每周四早八点不见不散';
    }
    next.mockBatches = Object.assign({}, next.mockBatches); next.mockBatches[batch] = stamp();
    try { localStorage.setItem(KEY, JSON.stringify(next)); state = next; }
    catch (_) { console.warn('直播示例文案未保存，原数据保持不变。'); }
  }
  updateFirstDemoCopy();
  function validatePresentation(b) {
    check(Array.from(b.publicTitle || '').length <= 100, '直播标题最多 100 个字', 'publicTitle');
    check(Array.from(b.summary || '').length <= 200, '直播简介最多 200 个字', 'summary');
    check(!b.liveStartAt || Number.isFinite(Date.parse(b.liveStartAt)), '请选择有效开播时间', 'liveStartAt');
  }
  function presentation(b, n) {
    n = n == null ? Date.now() : n;
    var start = Date.parse(b.liveStartAt), known = Number.isFinite(start), live = known && start <= n;
    var minutes = known ? Math.max(1, Math.ceil((start - n) / 60000)) : 0;
    function pad(v) { return String(v).padStart(2, '0'); }
    return { title: b.publicTitle || '直播活动', summary: b.summary || '', live: live,
      status: !known ? '开播时间待定' : live ? '直播中' : '距开播：' + pad(Math.floor(minutes / 1440)) + '天' + pad(Math.floor(minutes % 1440 / 60)) + '时' + pad(minutes % 60) + '分' };
  }
  function record(s, b, action, field, before, after, system, at) {
    s.logs.unshift({ id: D.uid('live-log-'), project: '直播 Banner', object: b.name, action: action, field: field, before: before, after: after, operator: system ? '系统' : D.user().name, account: system ? '—' : D.user().account, ip: '本地 Mock', at: stamp(at) });
  }
  function commit(next) {
    // Failed quota writes must not turn into successful saves or half-persisted logs.
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch (_) { throw new Error('本地存储不可用或空间不足，未保存；请缩小图片后重试。'); }
    state = next; window.dispatchEvent(new CustomEvent('gaip:live-change'));
  }
  function validateName(b, s) {
    check(typeof b.name === 'string' && b.name.trim() && Array.from(b.name.trim()).length <= 50, '请填写 Banner 名称，最多 50 个字', 'name');
    check(!s.banners.some(function (x) { return x.id !== b.id && x.name === b.name.trim(); }), 'Banner 名称已存在', 'name');
  }
  function validURL(value) { try { var u = new URL(value); return ['https:', 'http:'].includes(u.protocol) && !!u.hostname; } catch (_) { return false; } }
  function validate(b, s, mode, n) {
    validateName(b, s);
    check(b.image, '请上传 Banner 图片', 'image');
    check(['id', 'url'].includes(b.type), '请选择对接类型', 'type');
    check(String(b.content || '').trim(), b.type === 'id' ? '请填写直播 ID' : '请填写直播链接', 'content');
    check(b.type !== 'url' || validURL(b.content), '请填写完整的 http 或 https 直播链接', 'content');
    check(Array.isArray(b.groups) && b.groups.length && b.groups.every(function (g) { return g === 'all' || D.groups.includes(g); }) && !(b.groups.includes('all') && b.groups.length > 1), '请选择学习群组', 'groups');
    var start = Date.parse(b.startAt), end = Date.parse(b.endAt);
    check(Number.isFinite(start), '请选择上架时间', 'startAt'); check(Number.isFinite(end), '请选择下架时间', 'endAt');
    check(start < end, '下架时间须晚于上架时间', 'endAt');
    check(end > n, '下架时间须晚于当前时间', 'endAt');
    if (mode === 'schedule') check(start > n + 120000, '定时上架须选择距离现在 2 分钟之后的时间', 'startAt');
    check(!s.banners.some(function (x) { return x.id !== b.id && x.status !== 'offline' && x.type === b.type && x.content === b.content; }), '该直播 ID 或链接已关联未下架的 Banner', 'content');
  }
  function fresh() { return { id: D.uid('banner-'), name: '', publicTitle: '', summary: '', liveStartAt: '', image: '', imageName: '', type: '', content: '', groups: [], startAt: '', endAt: '', status: 'draft', scheduled: false }; }
  function save(input) {
    permitted(); tick();
    var s = clone(state), old = s.banners.find(function (b) { return b.id === input.id; }), b;
    check(!old || old.status !== 'offline', '已下架 Banner 只读，不能编辑');
    if (old && old.status === 'published') {
      b = Object.assign({}, old, { name: input.name.trim(), endAt: input.endAt });
      validateName(b, s); check(Date.parse(b.endAt) > Date.now() && Date.parse(b.endAt) > Date.parse(b.startAt), '下架时间须晚于当前时间及上架时间', 'endAt');
      [['name', 'Banner 名称'], ['endAt', '自动下架时间']].forEach(function (pair) { if (old[pair[0]] !== b[pair[0]]) record(s, b, '编辑', pair[1], old[pair[0]], b[pair[0]]); });
    } else {
      b = Object.assign(fresh(), { id: input.id, name: String(input.name || '').trim(), image: input.image || '', imageName: input.imageName || '', type: input.type || '', content: String(input.content || '').trim(), groups: clone(input.groups || []), startAt: input.startAt || '', endAt: input.endAt || '', scheduled: !!(old && old.scheduled) });
      validateName(b, s);
      b.publicTitle = String(input.publicTitle || '').trim(); b.summary = String(input.summary || '').trim(); b.liveStartAt = input.liveStartAt || '';
      validatePresentation(b);
      if (b.scheduled) validate(b, s, b.startAt === old.startAt ? 'scheduled-edit' : 'schedule', Date.now());
      if (!old) record(s, b, '新增', '-', '-', b.name);
    }
    b.createdAt = old ? old.createdAt : stamp(); b.updatedAt = stamp(); b.updatedBy = D.user().name;
    if (old) s.banners[s.banners.indexOf(old)] = b; else s.banners.push(b);
    commit(s); return clone(b);
  }
  function publish(id, mode) {
    permitted(); tick(); check(['schedule', 'now'].includes(mode), '请选择上架方式');
    var s = clone(state), b = s.banners.find(function (x) { return x.id === id; }), n = Date.now();
    check(b && b.status === 'draft', '仅草稿可以上架'); validate(b, s, mode, n);
    b.updatedAt = stamp(n); b.updatedBy = D.user().name;
    if (mode === 'schedule') b.scheduled = true;
    else { b.status = 'published'; b.scheduled = false; b.startAt = b.publishedAt = stamp(n); record(s, b, '上架', 'Banner 状态', '草稿', '已上架', false, n); }
    commit(s);
  }
  function offline(id) {
    permitted(); tick(); var s = clone(state), b = s.banners.find(function (x) { return x.id === id; });
    check(b && b.status === 'published', '仅已上架 Banner 可以下架');
    b.status = 'offline'; b.scheduled = false; b.offlineAt = b.updatedAt = stamp(); b.updatedBy = D.user().name;
    record(s, b, '下架', 'Banner 状态', '已上架', '已下架'); commit(s);
  }
  function remove(id) {
    permitted(); tick(); var s = clone(state), b = s.banners.find(function (x) { return x.id === id; });
    check(b && b.status === 'draft', '仅草稿可以删除'); record(s, b, '删除', '-', b.name, '-');
    s.banners = s.banners.filter(function (x) { return x.id !== id; }); commit(s);
  }
  function tick(n) {
    n = n == null ? Date.now() : n;
    if (!state.banners.some(function(b){return b.status === 'draft' && b.scheduled && Date.parse(b.startAt) <= n || b.status === 'published' && Date.parse(b.endAt) <= n;})) return false;
    var s = clone(state), changed = false;
    s.banners.forEach(function (b) {
      if (b.status === 'draft' && b.scheduled && Date.parse(b.startAt) <= n) {
        b.status = 'published'; b.scheduled = false; b.publishedAt = b.updatedAt = b.startAt; b.updatedBy = '系统';
        record(s, b, '上架', 'Banner 状态', '草稿', '已上架', true, Date.parse(b.startAt)); changed = true;
      }
      if (b.status === 'published' && Date.parse(b.endAt) <= n) {
        b.status = 'offline'; b.offlineAt = b.updatedAt = b.endAt; b.updatedBy = '系统';
        record(s, b, '下架', 'Banner 状态', '已上架', '已下架', true, Date.parse(b.endAt)); changed = true;
      }
    });
    if (changed) commit(s); return changed;
  }
  function list() {
    permitted(); var order = { published: 0, draft: 1, offline: 2 };
    return clone(state.banners).sort(function (a, b) { var key = a.status === 'published' ? 'publishedAt' : a.status === 'offline' ? 'offlineAt' : 'createdAt'; return order[a.status] - order[b.status] || String(b[key]).localeCompare(String(a[key])); });
  }
  function visible() {
    var u = D.user(), n = Date.now();
    if (!u.active) return [];
    return clone(state.banners.filter(function (b) { return b.status === 'published' && Date.parse(b.endAt) > n && (u.roles.includes('super') || b.groups.includes('all') || b.groups.some(function (g) { return u.groups.includes(g); })); })).sort(function (a, b) { return b.publishedAt.localeCompare(a.publishedAt); });
  }
  window.__GAIP_LEARNING_LIVE_DATA__ = { admin: admin, fresh: fresh, presentation: presentation, get: function (id) { return get(id) ? clone(get(id)) : null; }, save: save, publish: publish, offline: offline, remove: remove, tick: tick, list: list, visible: visible, names: names, validURL: validURL, logs: function () { return D.admin('course') || admin() ? clone(state.logs) : []; } };
}());
