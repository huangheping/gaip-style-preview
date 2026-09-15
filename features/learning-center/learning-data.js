/* Learning V1.1 local-only domain model. No network or real-user records. */
(function () {
  'use strict';
  var KEY = 'gaip-learning-v11';
  var root = new URL('../../', document.currentScript.src).href;
  var courseAccesses = new WeakSet();
  var groups = ['香港业务', '新加坡业务', '美国业务'];
  var users = [
    { id: 'u1', name: '本地预览用户', account: 'mock.admin', org: '总部/香港/顾问一组', groups: ['香港业务'], roles: ['super'], scope: '总部', active: true },
    { id: 'u2', name: '林晓（模拟）', account: 'mock.lin', org: '总部/香港/顾问一组', groups: ['香港业务'], roles: ['learner'], scope: '', active: true },
    { id: 'u3', name: '陈宁（模拟）', account: 'mock.chen', org: '总部/新加坡/顾问二组', groups: ['新加坡业务'], roles: ['course'], scope: '', active: true },
    { id: 'u4', name: '王悦（模拟）', account: 'mock.wang', org: '总部/香港', groups: ['香港业务'], roles: ['study'], scope: '总部/香港', active: true },
    { id: 'u5', name: '赵安（模拟）', account: 'mock.zhao', org: '总部/美国', groups: ['美国业务'], roles: ['learner'], scope: '', active: true },
    { id: 'u6', name: '无群组学员（模拟）', account: 'mock.none', org: '总部/香港/顾问二组', groups: [], roles: ['learner'], scope: '', active: true }
  ];
  function clone(v) { return JSON.parse(JSON.stringify(v)); }
  function now() { return new Date().toISOString(); }
  function check(ok, message, field, lessonId) { if (!ok) { var error = new Error(message); if (field) error.field = field; if (lessonId) error.lessonId = lessonId; throw error; } }
  function admin(kind) { return user().active && (user().roles.includes('super') || user().roles.includes(kind)); }
  function user() { return state.users.find(function (u) { return u.id === state.userId; }) || state.users[0]; }
  function course(id) { return state.courses.find(function (c) { return c.id === id; }); }
  function uid(prefix) { return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function seed() {
    var titles = ['保险展业科技赋能', '《综合整治非法跨境证券期货基金经营活动》', '全球财富管理趋势洞察', '企业家客户经营实战', '客户需求洞察与沟通', '以诺全球财富研习营'];
    var images = ['01-arkos', '02-pathway', '03-reckoning', '04-ceo-luncheon', '05-vessels', '06-wealth-camp'];
    var descriptions = ['面向一线展业顾问的科技工具全景课，覆盖 APP 基础操作、计划书制作与智能获客，帮助顾问提升服务体验。', '面向一线展业顾问的合规与风险管理课程，快速掌握跨境业务展业边界及客户沟通要点。', '系统梳理全球财富管理新趋势、资产配置逻辑与重点市场变化，提升高净值客户服务的专业深度。', '聚焦企业家客户的需求识别、关系经营与服务场景，以真实案例拆解高价值客户的长期陪伴方法。', '从感知、提问到方案表达，构建顾问式沟通框架，让每一次客户对话都更加真诚、清晰与有效。', '围绕全球资产配置、跨境服务与家族传承开展系统研学，连接专业视野与一线客户服务实践。'];
    var names = ['APP 基础介绍', '计划书的制作', '智能获客工具', '账号注册与基础设置', '客户画像配置指南', '移动端展业操作', '内容素材管理', '智能客服应用', '高净值客户服务案例解析与专业沟通方法实践', '常见问题音频解答', '展业流程复盘', '课程总结与实践'];
    var cs = titles.map(function (title, i) {
      var time = new Date(Date.UTC(2026, 7, 20 - i)).toISOString();
      return { id: 'c' + (i + 1), title: title, description: descriptions[i], image: 'assets/learning/course-' + images[i] + '.jpg', groups: i === 2 ? ['新加坡业务'] : ['all'], required: i === 0, featured: i === 0, status: 'published', everPublished: true, createdAt: time, updatedAt: time, updatedBy: '本地预览用户', lessons: Array.from({ length: i === 0 ? 12 : 3 }, function (_, j) {
        return { id: 'c' + (i + 1) + 'l' + (j + 1), title: i === 0 ? names[j] : ['核心内容导读', '专业场景与案例', '实践工具与方法'][j], type: j === 2 ? 'pdf' : (j === 9 ? 'audio' : 'video'), status: 'published', locked: true, file: { name: j === 2 ? '本地图文讲义.pdf' : '本地媒体占位', size: 1024, mock: true }, handout: j === 0 ? { name: '课程讲义.pdf', mock: true } : null, duration: 180 };
      }) };
    });
    cs.push(Object.assign(clone(cs[1]), { id: 'c7', title: '新顾问入门（草稿示例）', status: 'draft', everPublished: false, createdAt: now(), updatedAt: now(), lessons: [] }));
    cs.push(Object.assign(clone(cs[3]), { id: 'c8', title: '历史课程（下架示例）', status: 'offline' }));
    var s = { version: 1, userId: 'u1', users: clone(users), courses: cs, records: {}, completions: {}, logs: [] };
    var old = {}; try { old = JSON.parse(localStorage.getItem('gaip-learning-lesson-progress') || '{}'); } catch (_) { /* optional old local data */ }
    cs.slice(0, 6).forEach(function (c, i) { c.lessons.forEach(function (l, j) {
      var oldValue = old[i + ':' + j];
      var p = Number(typeof oldValue === 'object' && oldValue ? oldValue.progress : oldValue);
      if (!Number.isFinite(p)) p = i >= 4 ? 100 : (i === 0 && j === 0 ? 45 : 0);
      p = Math.max(0, Math.min(100, p)); if (l.type === 'pdf' && p < 100) p = 0;
      if (p) s.records['u1/' + c.id + '/' + l.id] = { progress: p, position: l.duration * p / 100, highWater: l.duration * p / 100, firstAt: c.createdAt, lastAt: c.updatedAt, completedAt: p === 100 ? c.updatedAt : null };
    }); });
    // Synthetic staff histories make scoped statistics inspectable without online personal data.
    [['u2','c1',0,100],['u2','c1',1,30],['u3','c3',0,65],['u4','c2',0,100],['u4','c2',1,100],['u4','c2',2,100],['u6','c5',0,20]].forEach(function (a) {
      var c = cs.find(function (x) { return x.id === a[1]; }), l = c.lessons[a[2]], p = a[3];
      s.records[a[0] + '/' + c.id + '/' + l.id] = { progress: p, position: l.duration*p/100, highWater: l.duration*p/100, firstAt: c.createdAt, lastAt: c.updatedAt, completedAt: p === 100 ? c.updatedAt : null };
    });
    cs[7].lessons.forEach(function(l) { s.records['u2/c8/'+l.id] = { progress:100,position:l.duration,highWater:l.duration,firstAt:cs[7].createdAt,lastAt:cs[7].updatedAt,completedAt:cs[7].updatedAt }; });
    return s;
  }
  // Additive demo batch: never replace existing browser edits or restore deleted drafts.
  var MOCK_BATCH = 'course-management-20260909';
  function managementMocks() {
    var titles = ['顾问服务流程与客户接待规范', '家庭资产配置基础与需求分析', '香港业务服务流程培训', '新加坡业务入门与服务规范', '美国业务客户沟通基础', '客户风险偏好识别与问卷解读', '年度客户服务计划制定', '客户信息维护与数据质量管理', '跨区域客户协同服务实践', '高净值客户需求访谈与家庭资产配置方案表达', '财富传承需求沟通基础', '企业家客户年度回访实务', '线上会议组织与演示技巧', '客户活动策划与邀约实践', '客户分层经营与跟进记录', '产品资料阅读与信息检索', '服务过程中的合规沟通要点', '团队知识共享与案例复盘', '新顾问三十天学习计划', '客户异议回应与服务改进', '家庭保障需求梳理方法', '客户服务工具进阶应用', '跨团队任务协作与交接规范', '季度业务复盘与个人成长计划'];
    var images = ['01-arkos', '02-pathway', '03-reckoning', '04-ceo-luncheon', '05-vessels', '06-wealth-camp'];
    var scopes = [['all'], ['香港业务'], ['新加坡业务'], ['美国业务'], ['香港业务', '新加坡业务'], ['香港业务', '美国业务']];
    var lessonNames = ['课程导读与学习目标', '基础概念与服务流程', '实践工具与方法', '典型场景演示', '客户沟通案例', '操作要点与注意事项', '常见问题解析', '服务记录与跟进', '团队协作实践', '案例复盘与方法总结', '综合场景练习', '课程总结'];
    return titles.map(function (title, i) {
      var id = 'mock-course-20260909-' + String(i + 1).padStart(2, '0');
      var status = ['published', 'published', 'draft', 'offline'][i % 4];
      var created = new Date(Date.UTC(2026, 6, i + 1, 1 + i % 8)).toISOString();
      var updated = new Date(Date.UTC(2026, 7, 1 + i % 14, 2 + i % 7)).toISOString();
      return { id: id, title: title, description: '本地模拟课程：' + title + '。通过基础讲解、场景演示和案例练习，帮助顾问熟悉服务流程并提升实际操作能力。内容仅用于功能预览。', image: 'assets/learning/course-' + images[i % images.length] + '.jpg', groups: clone(scopes[i % scopes.length]), required: i % 3 === 0, featured: i % 5 === 0, status: status, everPublished: status !== 'draft', createdAt: created, updatedAt: updated, updatedBy: '本地预览用户', lessons: Array.from({ length: [3, 6, 1, 8, 12, 4][i % 6] }, function (_, j) {
        var type = j === 2 ? 'pdf' : 'video';
        return { id: id + '-lesson-' + (j + 1), title: lessonNames[j], type: type, status: status === 'published' ? 'published' : 'offline', locked: status !== 'draft', file: { name: type === 'pdf' ? '本地图文讲义.pdf' : '本地视频占位', size: 1024, mock: true }, handout: j === 0 ? { name: '课程讲义.pdf', mock: true } : null, duration: 180 + j * 60 };
      }) };
    });
  }
  var state;
  try { state = JSON.parse(localStorage.getItem(KEY)); } catch (_) { /* memory fallback */ }
  if (!state || state.version !== 1 || !Array.isArray(state.courses)) state = seed();
  var addedMockBatch = !(state.mockBatches && state.mockBatches[MOCK_BATCH]);
  if (addedMockBatch) {
    var existingIds = new Set(state.courses.map(function (c) { return c.id; }));
    managementMocks().forEach(function (c) { if (!existingIds.has(c.id)) state.courses.push(c); });
    state.mockBatches = Object.assign({}, state.mockBatches);
    state.mockBatches[MOCK_BATCH] = true;
  }
  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); return true; }
    catch (_) { window.dispatchEvent(new CustomEvent('gaip:learning-storage-error')); return false; }
  }
  var organization=window.__GAIP_ORGANIZATION__, migratedOrganizations=false;
  if(organization){
    var legacyNodes={'总部/香港/顾问一组':'1:mock-level-3-east','总部/香港/顾问二组':'1:mock-level-3-institution','总部/香港':'1:department-3','总部/新加坡/顾问二组':'0:department-4','总部/美国':'2:department-4'};
    state.users.forEach(function(u){
      if(!u.orgNodeId&&legacyNodes[u.org]){u.legacyOrg=u.org;u.orgNodeId=legacyNodes[u.org];migratedOrganizations=true;}
      if(!u.scopeNodeId&&u.scope==='总部/香港'){u.legacyScope=u.scope;u.scopeNodeId='1:department-2';migratedOrganizations=true;}
    });
    function syncOrganizations(){state.users.forEach(function(u){if(u.orgNodeId)u.org=organization.path(u.orgNodeId)||u.org;if(u.scopeNodeId)u.scope=organization.path(u.scopeNodeId)||u.scope;});}
    syncOrganizations();
    window.addEventListener('gaip:organization-change',function(){syncOrganizations();persist();});
    organization.registerReferences(function(id){return state.users.some(function(u){return u.orgNodeId===id||u.scopeNodeId===id;});});
    if(migratedOrganizations)persist();
  }
  function matchesOrg(u,id){if(!id)return true;return organization&&u.orgNodeId?organization.contains(id,u.orgNodeId):u.org===id||u.org.startsWith(id+'/');}
  function organizationNodes(){
    check(admin('study'),'没有学情管理权限');
    if(!organization)return Array.from(new Set(scopeUsers().flatMap(function(u){var a=u.org.split('/');return a.map(function(_,i){return a.slice(0,i+1).join('/');});}))).filter(function(id){return user().roles.includes('super')||id===user().scope||id.startsWith(user().scope+'/');}).map(function(id){var a=id.split('/');return {id:id,name:a[a.length-1],parent:a.slice(0,-1).join('/')||null,path:id};});
    return organization.nodes().filter(function(n){return user().roles.includes('super')||!!user().scopeNodeId&&organization.contains(user().scopeNodeId,n.id);}).map(function(n){return Object.assign({},n,{path:organization.path(n.id)});});
  }
  // One-time additive fictional audit examples; never reconstruct or overwrite user history.
  var LOG_MOCK_BATCH = 'course-logs-20260910';
  var addedLogMockBatch = !(state.mockBatches && state.mockBatches[LOG_MOCK_BATCH]);
  if (addedLogMockBatch) {
    var examples = [
      ['新增', '课程', '-', '顾问服务基础（日志演示）'],
      ['上架', '课程状态', '草稿', '已上架'],
      ['下架', '课程状态', '已上架', '已下架'],
      ['上架', '课程状态', '已下架', '已上架'],
      ['编辑', '课程名称', '客户沟通入门', '客户沟通与需求分析'],
      ['编辑', '学习群组', '香港业务', '香港业务、新加坡业务'],
      ['编辑', '必修', '否', '是'],
      ['编辑', '课程介绍', '掌握基础沟通方法。', '通过需求访谈、家庭资产分析与案例练习，掌握完整的顾问沟通流程。'],
      ['编辑', '讲义', '客户需求分析V1.pdf', '客户需求分析V2.pdf'],
      ['上架课节', '课节状态', '已下架', '已上架'],
      ['下架课节', '课节状态', '已上架', '已下架'],
      ['删除', '课程', '历史培训草稿（日志演示）', '-']
    ];
    var mockTitles = ['顾问服务基础（日志演示）', '客户沟通与需求分析（日志演示）'];
    var existingLogIds = new Set(state.logs.map(function (r) { return r.id; }));
    examples.forEach(function (item, i) {
      [0, 1].forEach(function (batch) {
        var index = batch * examples.length + i, id = 'mock-course-log-20260910-' + index;
        if (existingLogIds.has(id)) return;
        var title = mockTitles[batch], object = item[2] !== '-' && item[0] === '删除' ? item[2] : title;
        if (item[1] === '讲义' || item[1] === '课节状态') object += ' / 需求访谈实践';
        state.logs.push({ id: id, mock: true, at: new Date(Date.UTC(2026, 8, 9 - batch, 1, i * 5)).toISOString(), operator: batch ? '陈宁（模拟）' : '林晓（模拟）', account: batch ? 'mock.chen' : 'mock.lin', ip: batch ? '198.51.100.22' : '192.0.2.18', action: item[0], courseId: 'log-demo-' + batch, course: title, details: '', changes: [{ object: object, field: item[1], before: item[2], after: item[0] === '新增' ? title : item[3] }] });
      });
    });
    state.mockBatches = Object.assign({}, state.mockBatches); state.mockBatches[LOG_MOCK_BATCH] = true;
  }
  var EXPAND_MOCK_BATCH = 'course-log-expand-20260910';
  var addedExpandMockBatch = !(state.mockBatches && state.mockBatches[EXPAND_MOCK_BATCH]);
  if (addedExpandMockBatch) {
    var oldIntro = '课程目标：帮助新顾问掌握客户需求访谈和基础沟通方法。\n学习内容：围绕首次接触、家庭资产梳理、风险偏好了解与服务记录整理，介绍常见业务场景。\n实践安排：完成一次模拟访谈，并根据案例整理客户需求清单，记录尚未确认的信息。';
    var newIntro = '课程目标：帮助顾问建立完整的客户需求分析与持续服务方法。\n学习内容：新增家庭保障缺口分析、跨境服务注意事项和多轮沟通案例，并补充不同客户阶段的提问示范。\n实践安排：完成两次模拟访谈，形成需求分析报告与后续服务计划；课后结合讲义复盘沟通过程。';
    var oldOrder = '01 客户接待与初步了解\n02 需求访谈的方法\n03 家庭资产梳理\n04 风险偏好识别\n05 服务方案沟通\n06 常见问题处理\n07 案例练习\n08 总结与行动计划';
    var newOrder = '01 客户接待与初步了解\n02 家庭资产梳理\n03 需求访谈的方法\n04 风险偏好识别\n05 案例练习\n06 服务方案沟通\n07 常见问题处理\n08 总结与行动计划';
    var expansionExamples = [
      ['双侧长文本', '课程介绍', oldIntro, newIntro],
      ['短内容改长内容', '课程介绍', '客户沟通基础课程。', newIntro],
      ['长内容改短内容', '课程介绍', oldIntro, '客户需求分析与持续服务实务。'],
      ['多行课节排序', '课节顺序', oldOrder, newOrder],
      ['学习群组', '学习群组', '香港业务', '香港业务\n新加坡业务\n美国业务'],
      ['短字段对照', '必修', '否', '是']
    ];
    var expansionTime = now(), expansionIds = new Set(state.logs.map(function (r) { return r.id; }));
    expansionExamples.forEach(function (item, i) {
      var id = 'mock-log-expand-20260910-' + i, title = '展开演示 · ' + item[0];
      if (!expansionIds.has(id)) state.logs.push({ id: id, mock: true, at: expansionTime, action: '编辑', operator: '林晓（模拟）', account: 'mock.lin', ip: '192.0.2.18', courseId: 'log-expand-demo', course: title, details: '', changes: [{ object: title, field: item[1], before: item[2], after: item[3] }] });
    });
    state.mockBatches = Object.assign({}, state.mockBatches); state.mockBatches[EXPAND_MOCK_BATCH] = true;
  }
  function record(c, l, u) { return state.records[(u || user().id) + '/' + c.id + '/' + l.id] || { progress: 0, position: 0, highWater: 0 }; }
  function active(c) { return c.lessons.filter(function (l) { return l.status === 'published'; }); }
  function entitled(c, u) { return !!u.active && (c.groups.includes('all') || c.groups.some(function (g) { return u.groups.includes(g); })); }
  function accessible(c) { return !!c && user().active && (c.status === 'draft' ? admin('course') : c.status === 'published' && (admin('course') || entitled(c, user()))); }
  function summary(c, u) {
    var ls = active(c), rs = ls.map(function (l) { return record(c, l, u); });
    var done = rs.filter(function (r) { return r.progress === 100; }).length;
    var percent = rs.length ? Math.round(rs.reduce(function (a, r) { return a + r.progress; }, 0) / rs.length) : 0;
    if (done !== ls.length) percent = Math.min(99, percent);
    return { total: ls.length, completed: done, progress: percent, status: ls.length && done === ls.length ? '已完成' : (rs.some(function (r) { return r.progress > 0; }) ? '学习中' : '未学习') };
  }
  function updateCompletion(c, u) {
    var key = u + '/' + c.id, s = summary(c, u), entry = state.completions[key] || {};
    if (s.status === '已完成' && !entry.current) { entry.firstAt = entry.firstAt || now(); entry.latestAt = now(); }
    entry.current = s.status === '已完成'; state.completions[key] = entry;
  }
  function reconcile(c) { state.users.forEach(function (u) { updateCompletion(c, u.id); }); }
  function log(action, c, details) {
    var entry = { id: uid('log'), at: now(), operator: user().name, account: user().account, ip: '本地 Mock', action: action, courseId: c ? c.id : '', course: c ? c.title : '', details: typeof details === 'string' ? details : '' };
    if (Array.isArray(details)) { entry.schemaVersion = 2; entry.changes = clone(details); }
    state.logs.unshift(entry);
  }
  var statusNames = { draft: '草稿', published: '已上架', offline: '已下架' };
  var typeNames = { video: '视频', audio: '音频', pdf: '图文（PDF）' };
  function fileName(file) {
    if (!file) return '-';
    var value = typeof file === 'object' ? file.name : file;
    if (!value || /^(data:|blob:)/i.test(value)) return '文件名未记录';
    value = String(value).split(/[?#]/)[0].split(/[\\/]/).pop();
    try { return decodeURIComponent(value) || '文件名未记录'; } catch (_) { return value; }
  }
  function change(c, lesson, field, before, after) {
    return { object: c.title + (lesson ? ' / ' + lesson.title : ''), lessonId: lesson ? lesson.id : '', field: field, before: String(before == null || before === '' ? '-' : before), after: String(after == null || after === '' ? '-' : after) };
  }
  function edits(before, after) {
    var changes = [];
    function add(key, label, format) {
      if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) changes.push(change(after, null, label, format ? format(before[key], before) : before[key], format ? format(after[key], after) : after[key]));
    }
    add('title', '课程名称'); add('image', '课程图标', function (v, c) { return fileName(c.imageName || v); }); add('description', '课程介绍');
    if (JSON.stringify((before.groups || []).slice().sort()) !== JSON.stringify((after.groups || []).slice().sort())) changes.push(change(after, null, '学习群组', (before.groups || []).map(function (g) { return g === 'all' ? '所有人' : g; }).join('、'), (after.groups || []).map(function (g) { return g === 'all' ? '所有人' : g; }).join('、')));
    add('required', '必修', function (v) { return v ? '是' : '否'; }); add('featured', '精选', function (v) { return v ? '是' : '否'; });
    (before.lessons || []).forEach(function (l) { if (!(after.lessons || []).some(function (n) { return n.id === l.id; })) changes.push(change(after, l, '删除课节', l.title, '-')); });
    (after.lessons || []).forEach(function (l) {
      var old = (before.lessons || []).find(function (n) { return n.id === l.id; });
      if (!old) { changes.push(change(after, l, '新增课节', '-', l.title)); return; }
      [['title', '课节名称'], ['type', '课节类型'], ['file', '课节内容'], ['handout', '讲义']].forEach(function (pair) {
        var key = pair[0]; if (JSON.stringify(old[key]) === JSON.stringify(l[key])) return;
        function value(v) { return key === 'file' || key === 'handout' ? fileName(v) : key === 'type' ? (typeNames[v] || v) : v; }
        changes.push(change(after, l, pair[1], value(old[key]), value(l[key])));
      });
    });
    return changes;
  }
  // Normalize legacy records for display only. Never rewrite existing history or invent missing values.
  function courseLogs() {
    var aliases = { '创建课程': '新增', '编辑课程': '编辑', '保存课节': '编辑', '修改课程': '编辑', '删除草稿': '删除', '上架课程': '上架', '下架课程': '下架', '自动下架课程': '下架', '课节排序': '编辑' };
    var rows = [];
    state.logs.filter(function (r) { return r.action !== '导出学情'; }).slice().sort(function (a, b) { return String(b.at || '').localeCompare(String(a.at || '')); }).forEach(function (r) {
      var changes = r.changes, action = aliases[r.action] || r.action, snapshot;
      if (!Array.isArray(changes)) {
        try { snapshot = JSON.parse(r.details); } catch (_) { /* old free-text record */ }
        if (snapshot && snapshot.before && snapshot.after && !Array.isArray(snapshot.before) && !Array.isArray(snapshot.after)) changes = edits(snapshot.before, snapshot.after);
        else if (action === '新增' || action === '删除') changes = [{ object: r.course, field: '课程', before: action === '新增' ? '-' : r.course, after: action === '删除' ? '-' : r.course }];
        else if (['上架', '下架'].includes(action)) changes = [{ object: r.course, field: '课程状态', before: action === '下架' ? '已上架' : '历史未记录', after: action === '下架' ? '已下架' : '已上架' }];
        else if (['上架课节', '下架课节'].includes(action)) changes = [{ object: r.course + ' / ' + (r.details || '课节名未记录'), field: '课节状态', before: '历史未记录', after: action === '下架课节' ? '已下架' : '已上架' }];
        else if (snapshot && Array.isArray(snapshot.before) && Array.isArray(snapshot.after)) changes = snapshot.after.reduce(function (out, id, i) { var from = snapshot.before.indexOf(id); if (from !== i) out.push({ object: r.course + ' / 课节ID：' + id, field: '课节顺序', before: '第 ' + (from + 1) + ' 位', after: '第 ' + (i + 1) + ' 位' }); return out; }, []);
        if (!changes || !changes.length) changes = [{ object: r.course || '历史未记录', field: '历史记录（未结构化）', before: '历史未记录', after: snapshot ? '旧记录未保存可还原的字段差异' : String(r.details || '历史未记录').replace(/(?:https?:\/\/|file:\/\/|data:|blob:)[^\s]+/g, '[文件地址已隐藏]') }];
      }
      changes.forEach(function (item, i) { rows.push(Object.assign({ at: r.at, operator: r.operator, account: r.account, ip: r.ip || '历史未记录' }, item, { id: r.id + ':' + i, action: action })); });
    });
    return rows;
  }
  function availableCourses() {
    return state.courses.filter(function (c) { return c.status === 'published' && accessible(c); }).sort(function (a, b) { return b.createdAt.localeCompare(a.createdAt); });
  }
  function validateBase(c) {
    check(c.title.trim() && Array.from(c.title.trim()).length <= 100, '课程名称必填，最多 100 个字', 'title');
    check(c.description.trim() && Array.from(c.description.trim()).length <= 200, '课程描述必填，最多 200 个字', 'description');
    check(c.image, '请上传课程封面或选择本地示例封面', 'image');
    check(c.groups.length && !(c.groups.includes('all') && c.groups.length > 1), '请选择学习群组；全部不能与其他群组同时选择', 'groups');
    check(typeof c.required === 'boolean', '请选择必修属性：非必修或必修', 'required');
  }
  function validateLesson(l) {
    check(l.title.trim() && Array.from(l.title.trim()).length <= 100, '课节名称必填，最多 100 个字', 'title', l.id);
    check(['video', 'audio', 'pdf'].includes(l.type), '请选择课节类型', 'type', l.id); check(l.file, '请添加课节内容', 'file', l.id);
  }
  function guardExisting(old, next) {
    if (!old || !old.everPublished) return;
    check(next.groups.includes('all') || (!old.groups.includes('all') && old.groups.every(function (g) { return next.groups.includes(g); })), '已发布课程的学习群组只能扩大，不能缩小', 'groups');
    old.lessons.forEach(function (l) {
      var n = next.lessons.find(function (x) { return x.id === l.id; });
      check(n, '已发布过的课程不能删除已有课节');
      if (l.locked) check(n.type === l.type && JSON.stringify(n.file) === JSON.stringify(l.file), '已发布课节不能更换类型或内容');
    });
  }
  function save(c, lessonId) {
    check(admin('course'), '没有课程管理权限'); var next = clone(c), old = course(c.id);
    validateBase(next); guardExisting(old, next);
    if (lessonId) {
      var one = next.lessons.find(function (l) { return l.id === lessonId; }); validateLesson(one);
      if (old) { next.lessons = clone(old.lessons); var idx = next.lessons.findIndex(function (l) { return l.id === lessonId; }); if (idx < 0) next.lessons.push(one); else next.lessons[idx] = one; }
      else next.lessons = [one];
    } else next.lessons.forEach(validateLesson);
    // Once a course exists, status is changed only through explicit publish/offline operations.
    if (old) { next.status = old.status; next.everPublished = old.everPublished; next.lessons.forEach(function (l) { var before = old.lessons.find(function (x) { return x.id === l.id; }); l.status = before ? before.status : 'offline'; l.locked = before ? before.locked : false; }); }
    next.title = next.title.trim(); next.updatedAt = now(); next.updatedBy = user().name;
    if (!old) { state.courses.push(next); log('新增', next, [change(next, null, '课程', '-', next.title)]); }
    else { state.courses[state.courses.indexOf(old)] = next; if (old.status !== 'draft') { var changes = edits(old, next); if (changes.length) log('编辑', next, changes); } }
    reconcile(next); persist(); return clone(next);
  }
  function publish(id, on) {
    check(admin('course'), '没有课程管理权限'); var c = course(id); check(c, '课程不存在');
    var previous = c.status; if (previous === (on ? 'published' : 'offline')) return;
    if (on) { validateBase(c); check(c.lessons.length > 0, '至少添加一个有效课节后才能上架'); c.lessons.forEach(validateLesson); c.lessons.forEach(function (l) { l.status = 'published'; l.locked = true; }); c.everPublished = true; }
    else check(c.status === 'published', '只有已上架课程可以下架');
    c.status = on ? 'published' : 'offline'; c.updatedAt = now(); c.updatedBy = user().name;
    log(on ? '上架' : '下架', c, [change(c, null, '课程状态', statusNames[previous], statusNames[c.status])]); reconcile(c); persist();
  }
  function publishLesson(id, lid, on) {
    check(admin('course'), '没有课程管理权限'); var c = course(id); check(c && c.everPublished, '草稿课节随课程首次发布');
    var l = c.lessons.find(function (x) { return x.id === lid; }); check(l, '课节不存在');
    var previous = l.status; if (previous === (on ? 'published' : 'offline')) return;
    if (on) { check(c.status === 'published', '请先上架课程'); validateLesson(l); l.locked = true; }
    else check(c.status !== 'published' || active(c).length > 1, '已上架课程至少保留一个上架课节，无法下架最后一个课节。');
    l.status = on ? 'published' : 'offline'; log(on ? '上架课节' : '下架课节', c, [change(c, l, '课节状态', statusNames[previous], statusNames[l.status])]);
    c.updatedAt = now(); c.updatedBy = user().name; reconcile(c); persist();
  }
  function remove(id) { check(admin('course'), '没有课程管理权限'); var c = course(id); check(c && !c.everPublished && c.status === 'draft', '仅草稿课程可以删除'); log('删除', c, [change(c, null, '课程', c.title, '-')]); state.courses = state.courses.filter(function (x) { return x.id !== id; }); persist(); }
  function saveOrder(id, ids) {
    check(admin('course'), '没有课程管理权限'); var c = course(id); check(c && ids.length === c.lessons.length && new Set(ids).size === ids.length && ids.every(function (x) { return c.lessons.some(function (l) { return l.id === x; }); }), '请先保存新增课节，再保存排序');
    var before = c.lessons.map(function (l) { return l.id; }); c.lessons = ids.map(function (lid) { return c.lessons.find(function (l) { return l.id === lid; }); });
    c.updatedAt = now(); c.updatedBy = user().name;
    var changes = c.lessons.reduce(function (out, l, i) { var from = before.indexOf(l.id); if (from !== i) out.push(change(c, l, '课节顺序', '第 ' + (from + 1) + ' 位', '第 ' + (i + 1) + ' 位')); return out; }, []);
    if (c.status !== 'draft' && changes.length) log('编辑', c, changes); persist();
  }
  function newCourse() { return { id: uid('c'), title: '', description: '', image: '', required: null, featured: false, groups: [], status: 'draft', everPublished: false, createdAt: now(), updatedAt: now(), lessons: [] }; }
  function newLesson() { return { id: uid('l'), title: '', type: null, file: null, handout: null, duration: 180, status: 'offline', locked: false }; }
  function openCourseAccess(id) {
    check(accessible(course(id)), '课程已下架或当前身份没有访问权限');
    var access = { courseId: id, userId: user().id, preview: course(id).status === 'draft' };
    courseAccesses.add(access); return access;
  }
  function validAccess(access, id) { return !!access && courseAccesses.has(access) && access.courseId === id && access.userId === user().id; }
  function openSession(id, lid, access) {
    var c = course(id); check(c && (validAccess(access, id) || accessible(c)), '课程已下架或当前身份没有访问权限');
    var l = c.lessons.find(function (x) { return x.id === lid; }); check(l && (c.status === 'draft' || l.status === 'published'), '课节已下架');
    var r = record(c, l); return { courseId: id, lessonId: lid, userId: user().id, preview: validAccess(access,id) ? access.preview : c.status === 'draft', required: c.required, type: l.type, duration: l.duration, position: r.progress === 100 ? 0 : r.position || 0, completed: r.progress === 100 };
  }
  function progress(session, pos, seek) {
    var c = course(session.courseId), l = c && c.lessons.find(function (x) { return x.id === session.lessonId; }); check(l, '课节不存在');
    var r = record(c, l, session.userId), max = session.duration;
    check(Number.isFinite(pos), '无效的进度');
    check(!seek || session.preview || !session.required || r.progress === 100, '必修课未完成前不支持拖动进度');
    session.position = Math.min(max, Math.max(0, pos));
    if (session.preview) return { progress: Math.floor(session.position / max * 100), position: session.position, highWater: 0 };
    var t = now(), next = Object.assign({}, r, { firstAt: r.firstAt || t, lastAt: t, position: session.position });
    next.progress = r.progress === 100 ? 100 : Math.floor(session.position / max * 100);
    if (session.type === 'pdf') next.progress = pos >= max ? 100 : 0;
    // PDF has completion, not media duration. Do not fabricate a played duration for a document.
    next.highWater = session.type === 'pdf' ? 0 : Math.min(max, Math.max(r.highWater || 0, session.position));
    if (next.progress === 100) next.completedAt = r.completedAt || t;
    state.records[session.userId + '/' + c.id + '/' + l.id] = next; updateCompletion(c, session.userId); persist(); return clone(next);
  }
  function scopeUsers() { check(admin('study'), '没有学情管理权限'); return state.users.filter(function (u) { return u.active && (user().roles.includes('super') || (user().scopeNodeId ? matchesOrg(u,user().scopeNodeId) : !!user().scope && (u.org === user().scope || u.org.startsWith(user().scope + '/')))); }); }
  function history(c, u) {
    var rs = c.lessons.map(function (l) { return record(c, l, u); });
    return { duration: rs.reduce(function (s, r, i) { return s + (c.lessons[i].type === 'pdf' ? 0 : r.highWater || 0); }, 0), firstAt: rs.map(function (r) { return r.firstAt || ''; }).filter(Boolean).sort()[0] || '', lastAt: rs.map(function (r) { return r.lastAt || ''; }).sort().pop() || '', completion: state.completions[u + '/' + c.id] || {} };
  }
  // Reporting uses only currently published lessons; archive records remain untouched.
  function studyHistory(c, u) {
    var h = history(Object.assign({}, c, { lessons: active(c) }), u);
    if (summary(c, u).status !== '已完成') h.completion = {};
    return h;
  }
  state.courses.forEach(reconcile);
  if (addedMockBatch || addedLogMockBatch || addedExpandMockBatch) persist();
  window.__GAIP_LEARNING_DATA__ = { root: root, groups: groups, state: function () { return state; }, user: user, admin: admin, course: course, clone: clone, uid: uid, record: record, active: active, entitled: entitled, accessible: accessible, summary: summary, history: history, availableCourses: availableCourses, scopeUsers: scopeUsers, organizationNodes: organizationNodes, matchesOrg: matchesOrg, newCourse: newCourse, newLesson: newLesson, save: save, saveOrder: saveOrder, publish: publish, publishLesson: publishLesson, remove: remove, openSession: openSession, openCourseAccess: openCourseAccess, validAccess: validAccess, closeAccess: function(a) { if (a) courseAccesses.delete(a); }, progress: progress, log: log, persist: persist, setUser: function (id) { check(state.users.some(function (u) { return u.id === id; }), '身份不存在'); state.userId = id; persist(); } };
  window.__GAIP_LEARNING_DATA__.courseLogs = courseLogs;
  window.__GAIP_LEARNING_DATA__.studyHistory = studyHistory;
})();
