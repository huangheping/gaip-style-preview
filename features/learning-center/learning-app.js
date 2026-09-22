(function () {
  'use strict';
  var D = window.__GAIP_LEARNING_DATA__, host, listHeader = '', view = 'list', currentId = '', session, timer, playing = false, speed = 1;
  var editing, savedEditor = '', lessonDrag, dragFrame, filters = {}, pageNumber = 1, statsTab = 'users';
  var editorFeedback, lastFocus, popup, toastTimer, courseAccess, filterBar, manageTable, editorGroups, bypassNavigation = false;
  var lessonUploads = Object.create(null), localFiles = Object.create(null);
  var liveCleanup, liveClock, previewInitialized = false;
  function pendingUploads() { return Object.values(lessonUploads).some(function (s) { return s.status === 'uploading'; }); }
  function clearUploads(lessonId, kind) { Object.keys(lessonUploads).forEach(function (key) { var s=lessonUploads[key];if((!lessonId||s.lessonId===lessonId)&&(!kind||s.kind===kind)){clearInterval(s.timer);delete lessonUploads[key];} }); }
  var labels = { published: '已上架', offline: '已下架', draft: '草稿', video: '视频', audio: '音频', pdf: '图文 PDF' };
  function e(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (x) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[x]; }); }
  function asset(path) { return /^(data:|blob:)/.test(path) ? path : new URL(path, D.root).href; }
  function btn(text, action, id, style, disabled) { return '<button type="button" class="lc-button ' + (style || '') + '" data-lc="' + action + '" data-id="' + e(id || '') + '"' + (disabled ? ' disabled' : '') + '>' + text + '</button>'; }
  function badge(text, color) { return '<span class="gaip-course-tag gaip-course-tag--' + (color || 'gray') + '">' + e(text) + '</span>'; }
  function tags(c, status) { return (c.featured ? badge('精选', 'gold') : '') + (c.required ? badge('必修课', 'orange') : '') + (c.status === 'draft' ? badge('仅限管理员预览') : (status ? badge(status, status === '学习中' ? 'green' : status === '未学习' ? 'bronze' : 'gray') : '')); }
  function date(t) { return t ? new Date(t).toLocaleString('zh-CN', { hour12: false }) : '—'; }
  function time(t) { var s = Math.floor(t || 0); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }
  function groupText(c) { return c.groups.includes('all') ? '全部' : c.groups.join('、'); }
  function toast(message) {
    var el = document.querySelector('.gaip-learning-toast'); if (!el) { el = document.createElement('div'); el.className = 'gaip-learning-toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.textContent = message; el.classList.add('is-visible'); clearTimeout(toastTimer); toastTimer = setTimeout(function () { el.classList.remove('is-visible'); }, 3200);
  }
  function attempt(fn) { try { return fn(); } catch (err) { toast(err.message); return false; } }
  function back(label, action, actions) { return '<header class="gaip-course-detail-header' + (actions ? ' lc-manage-header' : '') + (action === 'leave-editor' ? ' lc-editor-header' : '') + '"><button class="gaip-course-detail-back" type="button" data-lc="' + action + '"><span class="gaip-course-detail-back-icon" aria-hidden="true"></span>' + label + '</button>' + (actions ? '<div class="lc-manage-header-actions">' + actions + '</div>' : '') + '</header>'; }
  function initializePreview() {
    if (previewInitialized) return;
    previewInitialized = true;
    // Local preview only: keep domain permission checks, but do not expose a role switcher.
    var admin = D.state().users.find(function (u) { return u.active && u.roles.includes('super'); });
    if (admin && D.user().id !== admin.id) D.setUser(admin.id);
  }
  function stop() { clearInterval(timer); timer = null; playing = false; }
  function setView(next) { if(view==='edit'&&next!=='edit'){clearUploads();}stop(); finishLessonDrag(false); if (next !== 'detail' && next !== 'player') { D.closeAccess(courseAccess); courseAccess = null; } view = next; filters = {}; pageNumber = 1; render(); }
  function syncBreadcrumb() {
    var controller = window.__GAIP_BREADCRUMB__;
    if (!controller) return;
    if (host && (view === 'manage' || view === 'stats' || view === 'live')) controller.setDetail('learning', view === 'manage' ? '课程管理' : view === 'live' ? '直播管理' : '学情管理', function () { setView('list'); });
    else controller.clearDetail('learning');
  }
  function render() {
    if (!host) return;
    if (liveCleanup) { liveCleanup(); liveCleanup = null; }
    pruneLocalFiles();
    clearEditorFeedback();
    if (editorGroups) { editorGroups.destroy(); editorGroups = null; }
    if (filterBar) { filterBar.destroy(); filterBar = null; }
    if (manageTable) { manageTable.destroy(); manageTable = null; }
    if (view === 'live' && window.__GAIP_LEARNING_LIVE_DATA__ && window.__GAIP_LEARNING_LIVE_DATA__.admin()) liveCleanup = window.__GAIP_LEARNING_LIVE__.mountManager(host, {back:function(){setView('list');}, logs:openCourseLog});
    else if (view === 'list' || view === 'live') renderList(); else if (view === 'detail') renderDetail(); else if (view === 'player') renderPlayer(); else if (view === 'manage') renderManage(); else if (view === 'edit') renderEditor(); else if (view === 'stats') renderStats();
    host.dataset.learningView = view;
    syncBreadcrumb();
  }
  function renderList() {
    host.innerHTML = '<div class="gaip-course-list-view">' + listHeader + '<div class="gaip-learning-scroll"><section data-live-cards hidden></section><h2 class="lc-live-courses-heading" hidden>课程学习</h2><div class="gaip-learning-grid">' + D.availableCourses().map(function (c) {
      return '<article class="gaip-course-card" role="link" tabindex="0" data-lc="course" data-id="' + c.id + '" aria-label="查看课程详情：' + e(c.title) + '"><div class="gaip-course-cover"><img class="gaip-course-image" src="' + e(asset(c.image)) + '" alt="' + e(c.title) + '"></div><div class="gaip-course-body"><h2 class="gaip-course-title" title="' + e(c.title) + '">' + e(c.title) + '</h2><p class="gaip-course-description">' + e(c.description) + '</p><div class="gaip-course-footer"><div class="gaip-course-tags">' + tags(c, D.summary(c).status) + '</div></div></div></article>';
    }).join('') + '</div>' + (D.availableCourses().length ? '' : '<div class="lc-empty">当前暂无可学习课程</div>') + '</div></div>';
    var study = host.querySelector('[data-learning-action="学情管理"]'), manage = host.querySelector('[data-learning-action="课程管理"]');
    study.hidden = !D.admin('study'); manage.hidden = !D.admin('course');
    var live = window.__GAIP_LEARNING_LIVE__, data = window.__GAIP_LEARNING_LIVE_DATA__;
    if (live && data) {
      if (data.admin()) {
        var entry = manage.cloneNode(true); entry.hidden = false; entry.dataset.learningAction = '直播管理'; entry.textContent = '直播管理'; manage.before(entry);
      }
      liveCleanup = live.mountCards(host.querySelector('[data-live-cards]'), host.querySelector('.lc-live-courses-heading'));
    }
  }
  function openCourse(id) { var c = D.course(id); if (!D.accessible(c)) return toast('课程已下架或当前身份没有访问权限'); D.closeAccess(courseAccess); courseAccess = D.openCourseAccess(id); currentId = id; setView('detail'); }
  function previewCourse(id) {
    var c = D.course(id);
    if (!D.admin('course') || !c || c.status !== 'draft') return toast('仅课程管理员可预览已保存的草稿课程');
    if (!D.persist()) return;
    // Keep the same document: file:// storage may be isolated per entry file.
    var url = new URL(window.location.href);
    url.hash = '/clues?gaip-channel=learning&gaip-preview=' + encodeURIComponent(id);
    window.open(url.href, '_blank', 'noopener');
  }
  function visibleLessons(c) { return c.status === 'draft' ? c.lessons : D.active(c); }
  function renderDetail() {
    var c = D.course(currentId); if (!c || (!D.validAccess(courseAccess,currentId) && !D.accessible(c))) return setView('list'); var ls = visibleLessons(c), s = D.summary(c);
    host.innerHTML = '<section class="gaip-course-detail-page">' + back('返回学习中心', 'list') + '<div class="gaip-course-detail-scroll"><div class="gaip-course-detail-layout"><aside class="gaip-course-detail-sidebar"><div class="gaip-course-detail-visual"><img class="gaip-course-detail-image" src="' + e(asset(c.image)) + '" alt="' + e(c.title) + '"></div><div class="gaip-course-detail-content"><h2 class="gaip-course-detail-title">' + e(c.title) + '</h2><p class="gaip-course-detail-description">' + e(c.description) + '</p><div class="gaip-course-detail-tags">' + tags(c) + '</div></div></aside><div class="gaip-course-detail-main">' + (c.status === 'draft' ? '<p class="lc-notice">仅限管理员预览 · 不记录学习进度、时长及学情数据</p>' : '') + '<section class="gaip-course-detail-summary"><div class="gaip-course-detail-stats">' + [[ls.length, '课节总数'], [c.status === 'draft' ? '草稿预览' : s.status, '状态'], [c.status === 'draft' ? '—' : s.progress + '%', '总进度']].map(function (a) { return '<div class="gaip-course-detail-stat"><strong>' + a[0] + '</strong><span>' + a[1] + '</span></div>'; }).join('') + '</div></section><section class="gaip-course-lessons"><div class="gaip-course-lessons-heading"><h3>全部课节</h3><span class="gaip-course-lessons-count">' + ls.length + ' 个课节' + (c.status !== 'draft' ? ' · 已完成 ' + s.completed + ' 个' : '') + '</span></div><div class="gaip-course-lesson-list">' + ls.map(function (l, i) {
      var p = c.status === 'draft' ? 0 : D.record(c, l).progress, completed = p === 100;
      return '<article class="gaip-course-lesson" role="link" tabindex="0" data-lc="lesson" data-id="' + l.id + '"><div class="gaip-lesson-name"><span>' + String(i + 1).padStart(2, '0') + '</span><i></i><strong title="' + e(l.title) + '">' + e(l.title) + '</strong></div><div class="gaip-lesson-progress"><span class="gaip-lesson-progress-label"><span class="gaip-lesson-progress-icon"></span>' + (completed ? '已完成' : p ? '已学 ' + p + '%' : '未学习') + '</span><span class="gaip-lesson-progress-track"><i style="width:' + p + '%"></i></span></div><div class="gaip-lesson-actions">' + (l.handout ? '<button type="button" class="gaip-lesson-action gaip-lesson-action--secondary" data-lc="handout" data-id="' + l.id + '">下载/查看讲义</button>' : '') + '<button type="button" class="gaip-lesson-action gaip-lesson-action--primary ' + (l.type === 'pdf' ? 'gaip-lesson-action--reading' : completed ? 'gaip-lesson-action--review' : '') + '" data-lc="lesson" data-id="' + l.id + '">' + (l.type === 'pdf' ? '图文学习 &gt;' : '<span class="gaip-lesson-action-icon gaip-lesson-action-icon--' + (completed ? 'review' : 'play') + '"></span>' + (completed ? '回看' : '播放')) + '</button></div></article>';
    }).join('') + (ls.length ? '' : '<div class="lc-empty">暂无课节，请在课程管理中添加</div>') + '</div></section></div></div></div></section>';
  }
  function openLesson(id) { stop(); session = D.openSession(currentId, id, courseAccess); D.progress(session,session.position,false); speed = 1; view = 'player'; render(); }
  function watermark() { return '<div class="lc-watermark" aria-hidden="true">' + Array.from({ length: 32 }, function () { return '<span>' + e(D.user().name + ' · ' + D.user().account) + '</span>'; }).join('') + '</div>'; }
  function renderPlayer() {
    var c = D.course(currentId), l = c.lessons.find(function (x) { return x.id === session.lessonId; }), ls = visibleLessons(c), idx = ls.indexOf(l);
    var nav = '<nav class="gaip-course-player-lesson-nav">' + btn('← 上一节课', 'adjacent', ls[idx - 1] ? ls[idx - 1].id : '', '', idx === 0) + btn('下一节课 →', 'adjacent', ls[idx + 1] ? ls[idx + 1].id : '', '', idx === ls.length - 1) + '</nav>';
    var p = D.record(c, l).progress;
    if (l.type === 'pdf') {
      host.innerHTML = '<section class="gaip-course-reader-page">' + back('返回课程详情', 'detail') + '<div class="gaip-course-reader-scroll lc-pdf-scroll"><div class="gaip-course-reader-shell"><header class="gaip-course-reader-heading"><div><span class="gaip-course-reader-type">PDF 图文课节' + (session.preview ? ' · 管理员预览，不计进度' : '') + '</span><h2 class="gaip-course-reader-title">' + e(l.title) + '</h2></div><div class="lc-reader-tools">' + btn('缩小', 'zoom-out') + '<output data-zoom>100%</output>' + btn('放大', 'zoom-in') + btn('全屏', 'fullscreen-pdf') + '</div></header><div class="lc-pdf-pages" data-zoom-value="100">' + [1, 2, 3, 4].map(function (n) { return '<figure class="lc-pdf-page"><img width="935" height="1210" src="' + asset('assets/learning/reader-page-' + n + '.jpg') + '" alt="本地 PDF 示例第 ' + n + ' 页">' + watermark() + '<figcaption>' + n + ' / 4</figcaption></figure>'; }).join('') + '</div><div class="gaip-course-reader-complete' + (p === 100 ? ' is-complete' : '') + '"><span class="gaip-course-reader-complete-icon"></span><strong>' + (p === 100 ? '本课节已阅读完成' : '阅读中') + '</strong></div>' + nav + '</div></div></section>';
      var scroll = host.querySelector('.lc-pdf-scroll');
      scroll.addEventListener('scroll', function () {
        var imagesReady = Array.from(scroll.querySelectorAll('.lc-pdf-page img')).every(function (img) { return img.complete && img.naturalWidth > 0; });
        if (!imagesReady || scroll.scrollHeight <= scroll.clientHeight || scroll.scrollTop + scroll.clientHeight < scroll.scrollHeight - 12) return;
        D.progress(session, session.duration, false);
        var complete = scroll.querySelector('.gaip-course-reader-complete'); complete.classList.add('is-complete'); complete.querySelector('strong').textContent = session.preview ? '已浏览完成（预览不计进度）' : '本课节已阅读完成';
      }, { passive: true });
      return;
    }
    host.innerHTML = '<section class="gaip-course-player-page">' + back('返回课程详情', 'detail') + '<div class="gaip-course-player-scroll"><div class="gaip-course-player-shell"><div class="gaip-course-player-stage ' + (l.type === 'audio' ? 'lc-audio' : '') + '"><img class="gaip-course-player-poster" src="' + e(asset(c.image)) + '" alt="' + e(c.title) + '">' + (l.type === 'video' ? watermark() : '<span class="lc-audio-label">音频课节 · 本地模拟</span>') + '<button class="gaip-course-player-toggle" data-lc="toggle" type="button" aria-label="播放课程" aria-pressed="false"></button>' + (l.type === 'video' ? btn('全屏', 'fullscreen', '', 'lc-fullscreen') : '') + '</div><section class="gaip-course-player-controls"><h3 class="gaip-course-player-lesson-title">' + e(l.title) + '</h3><input class="gaip-course-player-progress" data-seek type="range" min="0" max="' + session.duration + '" step="1" value="' + session.position + '" aria-label="播放进度"><div class="gaip-course-player-meta"><span><strong data-current>' + time(session.position) + '</strong><em>/</em>' + time(session.duration) + '</span><span data-learned></span></div><div class="gaip-course-player-speed-row"><span>播放速度</span><div class="gaip-course-player-speeds">' + [.75, 1, 1.5, 2].map(function (s) { return '<button class="gaip-course-player-speed' + (s === 1 ? ' is-selected' : '') + '" data-lc="speed" data-id="' + s + '" aria-pressed="' + (s === 1) + '">' + s + 'x</button>'; }).join('') + '</div></div><p class="lc-hint">本地模拟播放，不加载真实媒体。' + (session.preview ? '管理员预览，不记录进度。' : c.required && p !== 100 ? '必修课完成前不能拖动进度。' : '可拖动进度，完成后回看不清除完成记录。') + '</p></section>' + nav + '</div></div></section>';
    updatePlayer();
  }
  function updatePlayer() {
    if (!host || !session || session.type === 'pdf') return;
    var c = D.course(session.courseId), l = c.lessons.find(function (x) { return x.id === session.lessonId; }), r = D.record(c, l, session.userId), range = host.querySelector('[data-seek]'); if (!range) return;
    range.value = session.position; range.style.setProperty('--gaip-player-progress', (session.position / session.duration * 100) + '%');
    range.disabled = !session.preview && session.required && r.progress < 100;
    range.setAttribute('aria-valuetext', time(session.position) + ' / ' + time(session.duration));
    host.querySelector('[data-current]').textContent = time(session.position); host.querySelector('[data-learned]').textContent = session.preview ? '管理员预览 · 不计进度' : '已学 ' + r.progress + '%';
    var t = host.querySelector('.gaip-course-player-toggle'); t.classList.toggle('is-playing', playing); t.setAttribute('aria-pressed', String(playing)); t.setAttribute('aria-label', playing ? '暂停课程' : '播放课程');
  }
  function toggle() {
    if (playing) { stop(); updatePlayer(); return; }
    if (session.position >= session.duration) session.position = 0;
    playing = true; var previous = performance.now();
    timer = setInterval(function () {
      var t = performance.now(), delta = Math.min(2, (t - previous) / 1000) * speed; previous = t;
      attempt(function () { D.progress(session, session.position + delta, false); });
      if (session.position >= session.duration) stop(); updatePlayer();
    }, 500); updatePlayer();
  }
  function select(name, choices, selected, attr) { return '<select ' + (attr || 'data-filter') + '="' + name + '" aria-label="' + e(name) + '">' + choices.map(function (x) { return '<option value="' + e(x[0]) + '"' + (String(selected || '') === String(x[0]) ? ' selected' : '') + '>' + e(x[1]) + '</option>'; }).join('') + '</select>'; }
  function search(placeholder) { return '<input class="lc-search" data-search type="search" value="' + e(filters.q || '') + '" placeholder="' + e(placeholder) + '" aria-label="' + e(placeholder) + '">'; }
  function table(headers, rows) { return '<div class="lc-table-scroll"><table class="lc-table"><thead><tr>' + headers.map(function (h) { return '<th>' + e(h) + '</th>'; }).join('') + '</tr></thead><tbody>' + (rows.length ? rows.map(function (cells) { return '<tr>' + cells.map(function (cell) { return '<td>' + cell + '</td>'; }).join('') + '</tr>'; }).join('') : '<tr><td colspan="' + headers.length + '"><div class="lc-empty">暂无符合条件的数据</div></td></tr>') + '</tbody></table></div>'; }
  function paginate(items) { pageNumber = Math.max(1, Math.min(pageNumber, Math.ceil(items.length / 10) || 1)); return items.slice((pageNumber - 1) * 10, pageNumber * 10); }
  function pages(total) { return '<div class="lc-pagination"><span>共 ' + total + ' 条 · 每页 10 条</span>' + btn('上一页', 'page', '-1', '', pageNumber === 1) + '<span>' + pageNumber + ' / ' + (Math.ceil(total / 10) || 1) + '</span>' + btn('下一页', 'page', '1', '', pageNumber * 10 >= total) + '</div>'; }
  function adminHeader(title, action) { return '<div class="lc-admin-heading"><h2>' + title + '</h2><div>' + (action || '') + btn('操作日志', 'logs') + '</div></div>'; }
  function manageCourses() { return D.state().courses.filter(function (c) { return (!filters.status || c.status === filters.status) && (!filters.group || !filters.group.length || filters.group.some(function (group) { return c.groups.includes(group); })) && (!filters.required || c.required) && (!filters.q || c.title.includes(filters.q)); }).sort(function (a, b) { return ['published','draft','offline'].indexOf(a.status) - ['published','draft','offline'].indexOf(b.status) || b.updatedAt.localeCompare(a.updatedAt); }); }
  function updateManageResults(resetPage) {
    var cs = manageCourses();
    var rows = cs.map(function (c) {
      var deleteAction = btn('删除', 'delete', c.id, 'lc-link lc-manage-delete gaip-table__button is-danger', c.status !== 'draft');
      if (c.status !== 'draft') deleteAction = '<span class="lc-manage-disabled-action" tabindex="0" title="仅草稿课程可以删除" aria-label="删除不可用：仅草稿课程可以删除">' + deleteAction + '</span>';
      return [
        '<strong class="lc-title-cell" title="' + e(c.title) + '">' + e(c.title) + '</strong>' + (c.featured ? window.__GAIP_TABLE__.tag('精选', { tone: 'highlight' }).outerHTML : ''),
        window.__GAIP_TABLE__.tag(labels[c.status], { tone: c.status === 'published' ? 'success' : 'neutral' }).outerHTML,
        '<span class="lc-manage-group">' + e(groupText(c)) + '</span>',
        c.required ? '是' : '否',
        c.lessons.length,
        '<span class="lc-manage-time">' + date(c.createdAt) + '</span>',
        '<span class="lc-manage-time">' + date(c.updatedAt) + '</span><small>' + e(c.updatedBy) + '</small>',
        '<div class="lc-row-actions gaip-table__row-actions">' + btn('编辑', 'edit', c.id, 'lc-link gaip-table__button') + (c.status === 'draft' ? btn('预览', 'preview-course', c.id, 'lc-link gaip-table__button') : '') + btn(c.status === 'published' ? '下架' : '上架', 'publish', c.id, 'lc-link gaip-table__button') + deleteAction + '</div>'
      ];
    });
    if (manageTable) { manageTable.setRows(rows, !!resetPage); return; }
    var widths = [248,100,164,72,80,168,184,176];
    manageTable = window.__GAIP_TABLE__.mount(host.querySelector('.lc-manage-results'), {
      title: '课程列表', rows: rows, minWidth: 1192, tableClass: 'lc-table', scrollClass: 'lc-table-scroll',
      boundary: host.querySelector('.lc-manage'), bottomGap: 0, emptyText: '暂无符合条件的记录',
      columns: ['课程名称','状态','学习群组','必修','课节数','创建时间','最近更新','操作'].map(function (label, i) {
        return { label: label, width: widths[i], fixed: i === 0 ? 'left' : i === 7 ? 'right' : null,
          align: i === 3 || i === 4 ? 'center' : 'left', renderHTML: function (row) { return row[i]; } };
      })
    });
  }
  function renderManage() {
    if (!D.admin('course')) return setView('list');
    host.innerHTML = back('返回学习中心', 'list', btn('操作日志', 'logs', '', 'gaip-table__button') + btn('＋ 新增课程', 'create', '', 'lc-primary gaip-table__button is-primary')) + '<main class="lc-admin lc-manage" aria-label="课程管理"><div class="lc-manage-filter-slot"></div><section class="lc-manage-results" aria-label="课程列表"></section></main>';
    host.querySelector('.lc-manage-header-actions').classList.add('gaip-table-tools');
    filterBar = window.__GAIP_FILTER_BAR__.mount(host.querySelector('.lc-manage-filter-slot'), {
      label: '课程筛选', mode: 'instant', values: filters, actions: { reset: true, submit: false, more: true },
      fields: [
        { key: 'q', type: 'search', label: '课程名称', placeholder: '搜索课程名称', wide: true },
        { key: 'group', type: 'multiSelect', label: '学习群组', placeholder: '全部学习群组', options: [{value:'all',label:'全部用户'}].concat(D.groups.map(function (g) { return {value:g,label:g}; })) },
        { key: 'status', type: 'select', label: '课程状态', options: [{value:'',label:'全部状态'},{value:'published',label:'已上架'},{value:'draft',label:'草稿'},{value:'offline',label:'已下架'}] },
        { key: 'required', type: 'switch', label: '必修属性', text: '只看必修课' }
      ],
      onChange: function (value) { filters = value; pageNumber = 1; updateManageResults(true); }
    });
    updateManageResults();
  }
  function beginEdit(id) { clearUploads();editing = id ? D.clone(D.course(id)) : D.newCourse(); savedEditor = JSON.stringify(editing); setView('edit'); }
  function field(label, control) { return '<label class="lc-field"><span>' + label + '</span>' + control + '</label>'; }
  function input(key, value, max, lesson) { return '<input data-field="' + key + '"' + (lesson ? ' data-lesson="' + lesson + '"' : '') + ' value="' + e(value) + '" maxlength="' + max + '"><small>' + Array.from(value || '').length + ' / ' + max + '</small>'; }
  function courseBasics() {
    var required = '<span class="lc-required" aria-hidden="true">*</span>';
    return '<section class="lc-panel lc-course-basics" aria-labelledby="lc-basics-title"><div class="lc-basics-heading"><h3 id="lc-basics-title">基本信息</h3></div>' +
      '<div class="lc-basics-content"><div class="lc-basics-copy">' +
      '<label class="lc-field" for="lc-course-title"><span>' + required + '课程名称</span><div class="gaip-form-counted lc-counted"><input class="gaip-form-control" id="lc-course-title" data-field="title" value="' + e(editing.title) + '" maxlength="100" aria-required="true" placeholder="请输入课程名称"><small>' + Array.from(editing.title).length + ' / 100</small></div></label>' +
      '<label class="lc-field" for="lc-course-description"><span>' + required + '课程描述</span><div class="gaip-form-counted lc-counted lc-counted--textarea"><textarea class="gaip-form-control" id="lc-course-description" data-field="description" maxlength="200" rows="4" aria-required="true" placeholder="介绍课程内容与学习收获">' + e(editing.description) + '</textarea><small>' + Array.from(editing.description).length + ' / 200</small></div></label></div>' +
      '<div class="lc-field lc-basics-cover"><span id="lc-cover-label">' + required + '课程封面</span><label class="lc-cover-picker" aria-labelledby="lc-cover-label" tabindex="0" role="button">' + (editing.image ? '<img src="' + e(asset(editing.image)) + '" alt="当前课程封面"><span class="lc-cover-picker-caption">更换封面</span>' : '<span>上传课程封面</span><span class="lc-cover-picker-caption">点击选择图片</span>') + '<input type="file" accept="image/jpeg,image/png,image/webp" data-upload="cover" hidden></label><div class="lc-cover-help"><span>JPG / PNG / WebP，最大 10MB</span><span>建议使用 16:9 比例图片</span>' + btn('使用本地示例','sample-cover','','lc-link') + '</div></div></div>' +
      '<section class="lc-basics-settings" aria-labelledby="lc-settings-title"><h3 id="lc-settings-title">学习设置</h3><div class="lc-settings-grid">' +
      '<div class="lc-field lc-basics-groups"><span id="lc-groups-label">' + required + '学习群组</span><div data-editor-groups></div><p class="lc-field-help">' + (editing.everPublished ? '已发布课程的学习群组只可扩大，不可缩小。' : '选择可学习本课程的群组；选择“所有人”则向全部学员开放。') + '</p></div>' +
      '<fieldset class="gaip-form-choices lc-basic-radio"><legend>' + required + '必修属性</legend><div>' + [['false','非必修'],['true','必修']].map(function (option) { return '<label><input type="radio" name="lc-course-required" data-course-boolean="required" value="' + option[0] + '"' + (String(editing.required) === option[0] ? ' checked' : '') + '><span>' + option[1] + '</span></label>'; }).join('') + '</div></fieldset>' +
      '<div class="lc-field"><span>精选推荐</span><label class="gaip-filter-bar__switch-line"><input class="gaip-filter-bar__switch-input" type="checkbox" role="switch" data-course-boolean="featured"' + (editing.featured ? ' checked' : '') + '><span class="gaip-filter-bar__switch-track" aria-hidden="true"></span><span>设为精选</span></label></div></div></section></section>';
  }
  function mountEditorGroups() {
    var root = host.querySelector('[data-editor-groups]');
    editorGroups = window.__GAIP_MULTI_SELECT__.mount(root, {
      options: [{value:'all',label:'所有人'}].concat(D.groups.map(function (g) { return {value:g,label:g}; })), value: editing.groups, placeholder: '请选择学习群组', maxVisible: 2,
      onChange: function (value) {
        if (value.includes('all') && !editing.groups.includes('all')) value = ['all'];
        else if (value.includes('all') && value.length > 1) value = value.filter(function (g) { return g !== 'all'; });
        if (editorFeedback && editorFeedback.container.contains(root)) clearEditorFeedback();
        editing.groups = value; editorGroups.setValue(value);
      }
    });
    root.querySelector('[role="combobox"]').setAttribute('aria-labelledby','lc-groups-label');
    root.querySelector('[role="combobox"]').setAttribute('aria-required','true');
  }
  // Paths are from the user's 上传.svg and 更换.svg; inherit each button's text color.
  function lessonUploadIcon(replace) {
    return '<svg class="lc-upload-icon" viewBox="0 0 32 32" width="16" height="16" aria-hidden="true" focusable="false"><path fill="currentColor" d="'+(replace?'M27.3928571,16.7877944 L27.3928571,23.5711278 C27.3928571,24.7355802 26.4455011,25.6877944 25.2857143,25.6877944 L7.129,25.6874611 L10.2240812,28.7977944 L8.57142857,30.4589222 L2.64734738,24.5044611 L8.57142857,18.55 L10.2240812,20.2111278 L7.129,23.3204611 L25.035,23.3204611 L25.0357143,16.7877944 L27.3928571,16.7877944 Z M21.7759188,3.41112776 L23.4285714,1.75 L29.3526526,7.7044611 L23.4285714,13.6589222 L21.7759188,11.9977944 L24.87,8.8874611 L6.964,8.8874611 L6.96428571,15.4211278 L4.60714286,15.4211278 L4.60714286,8.63779443 C4.60714286,7.47334203 5.55449888,6.52112776 6.71428571,6.52112776 L24.87,6.5204611 L21.7759188,3.41112776 Z':'M3.2,22 L3.2,27.83 L28.8,27.83 L28.8,22 L31.2,22 L31.2,30.230303 L0.8,30.230303 L0.8,22 L3.2,22 Z M16,3 L22,11 L17.2,11 L17.2,25 L14.8,25 L14.8,11 L10,11 L16,3 Z')+'"></path></svg>';
  }
  function lessonFilePicker(l, kind) {
    var content = kind === 'content', file = content ? l.file : l.handout;
    var key=l.id+'/'+kind, state=lessonUploads[key], busy=state&&state.status==='uploading';
    if (content && !l.type) return '<section class="lc-lesson-file" aria-label="课节内容"><h5><span class="lc-required" aria-hidden="true">*</span>课节内容</h5><div class="lc-lesson-file-box"><p class="lc-field-help">请先选择课节类型，再添加对应内容。</p></div></section>';
    var accept = !content || l.type === 'pdf' ? '.pdf' : l.type === 'audio' ? '.mp3,.m4a,.wav' : '.mp4,.mov,.webm';
    var help = !content || l.type === 'pdf' ? 'PDF，最大 100MB' : l.type === 'video' ? 'MP4 / MOV / WebM，最大 3GB' : 'MP3 / M4A / WAV，最大 100MB';
    var status = !state ? '' : '<div class="lc-upload-state is-'+state.status+'" data-upload-state="'+e(key)+'"><p class="lc-upload-status-label" role="status" title="'+e(busy&&file?state.file.name:'')+'">'+(busy?(file?'更换中 · '+e(state.file.name):'上传中'):state.status==='success'?'<svg class="lc-upload-complete-icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M8,0 C12.3999913,0 16,3.60000457 16,8 C16,12.4000137 12.3999913,16 8,16 C3.59999041,16 0,12.3999954 0,7.99998173 C0,3.60000457 3.59999041,0 8,0 Z M11.3386718,4.45738699 L6.551,9.24338699 L4.61559784,7.30867773 L3,8.92427557 L6.53553391,12.4598095 L6.574,12.420387 L6.59031046,12.4369477 L12.9542715,6.07298667 L11.3386718,4.45738699 Z"></path></svg><span>上传成功，待保存</span>':file?'更换失败，原文件未变':'上传失败')+'</p>'+(busy?'<div class="lc-upload-meter"><progress max="100" value="'+state.progress+'" aria-label="模拟上传进度"></progress><output>'+state.progress+'%</output></div>':state.status==='failed'?'<p>'+e(state.retryable?'请重试或重新选择文件':state.message)+'</p>':'')+'</div>';
    var picker='<label class="lc-button lc-file-picker'+(file?' lc-file-replace':'')+'" tabindex="0" role="button" title="'+e(help)+'">'+lessonUploadIcon(!!file)+'<span>'+(content?(file?'更换':'上传')+(l.type==='pdf'?'PDF':labels[l.type]):file?'更换讲义':'上传讲义')+'</span><input type="file" hidden data-upload="'+kind+'" data-lesson="'+e(l.id)+'" accept="'+accept+'"></label>';
    var demo=busy?btn('模拟失败','fail-upload',key,'lc-link'):content?btn('使用示例','sample-content',l.id,'lc-link'):'';
    var actions=content&&l.locked?'<span class="lc-lesson-locked">已发布，内容不可替换</span>':(busy?btn('取消上传','cancel-upload',key):picker+(state&&state.status==='failed'&&state.retryable?btn('重试上传','retry-upload',key):'')+(!content&&file?btn('移除讲义','remove-handout',l.id,'lc-link'):''))+(demo?'<details class="lc-upload-demo"><summary>演示选项</summary><div>'+demo+'</div></details>':'');
    // Keep the existing file as the one visible, working link until replacement succeeds.
    var shown=file||state&&state.file;
    var name=file?lessonFileName(file):shown?'<strong title="'+e(shown.name)+'">'+e(shown.name)+'</strong>':'<strong>'+e(content?'请添加'+labels[l.type]+'文件':'未添加讲义')+'</strong>';
    var fileHint=file&&!localFiles[file.localFileId]?(file.localFileId?(content&&l.locked?'请在本地文件夹中打开确认':'请重新选择本地文件以打开'):'示例文件，未关联本地文件'):'';
    return '<section class="lc-lesson-file" aria-label="'+(content?'课节内容':'课节讲义')+'"><h5>'+(content?'<span class="lc-required" aria-hidden="true">*</span>课节内容':'课节讲义 <span>选填</span>')+'</h5><div class="lc-lesson-file-box"><div class="lc-lesson-file-description">'+name+'<p class="lc-field-help">'+help+'</p>'+'</div><div class="lc-upload-feedback">'+(status|| (fileHint?'<p class="lc-field-help">'+fileHint+'</p>':''))+'</div><div class="lc-lesson-file-actions">'+actions+'</div></div></section>';
  }
  // Only keep selected File objects in this tab, never in Mock/localStorage.
  function pruneLocalFiles(excludeDraft) {
    var ids=new Set();
    var courses=D.state().courses.slice();if(!excludeDraft&&view==='edit'&&editing)courses.push(editing);
    courses.forEach(function(c){c.lessons.forEach(function(l){[l.file,l.handout].forEach(function(f){if(f&&f.localFileId)ids.add(f.localFileId);});});});
    Object.keys(localFiles).forEach(function(id){if(!ids.has(id)){URL.revokeObjectURL(localFiles[id].url);delete localFiles[id];}});
  }
  function lessonFileName(file) {
    var local=localFiles[file.localFileId];
    return local?'<a class="lc-local-file-link" href="'+e(local.url)+'" target="_blank" rel="noopener noreferrer" title="'+e(file.name)+'（打开文件）">'+e(file.name)+'</a>':'<strong title="'+e(file.name)+'">'+e(file.name)+'</strong>';
  }
  function courseLessonEditor(l, i) {
    var saved = D.course(editing.id), existing = saved && saved.lessons.some(function (x) { return x.id === l.id; });
    var lessonLabel = !existing ? '未保存' : l.status === 'published' ? '已上架' : l.locked ? '已下架' : '未上架';
    var required = '<span class="lc-required" aria-hidden="true">*</span>', nameId = 'lc-lesson-name-' + l.id;
    return '<article class="lc-edit-lesson" data-edit-lesson="' + e(l.id) + '"><header class="lc-lesson-edit-heading"><div class="lc-lesson-identity"><button type="button" class="lc-drag-handle" data-drag="' + e(l.id) + '" aria-label="拖动排序" title="拖动排序；键盘可使用上移和下移按钮">⠿</button><span class="lc-lesson-number">' + String(i + 1).padStart(2,'0') + '</span><h4 data-lesson-heading="' + e(l.id) + '">' + e(l.title || '未命名课节') + '</h4>' + badge(lessonLabel) + '</div><div class="lc-lesson-order-actions">' + btn('上移','move-up',l.id,'lc-link',i === 0) + btn('下移','move-down',l.id,'lc-link',i === editing.lessons.length - 1) + btn('删除','remove-lesson',l.id,'lc-link',editing.everPublished && existing) + '</div></header>' +
      '<div class="lc-lesson-edit-body"><div class="lc-lesson-fields"><label class="lc-field" for="' + e(nameId) + '"><span>' + required + '课节名称</span><div class="gaip-form-counted lc-counted"><input class="gaip-form-control" id="' + e(nameId) + '" data-field="title" data-lesson="' + e(l.id) + '" value="' + e(l.title) + '" maxlength="100" aria-required="true" placeholder="请输入课节名称"><small>' + Array.from(l.title || '').length + ' / 100</small></div></label>' +
      '<fieldset class="gaip-form-choices lc-basic-radio"><legend>' + required + '课节类型</legend><div>' + ['video','audio','pdf'].map(function (type) { return '<label><input type="radio" name="lc-lesson-type-' + e(l.id) + '" data-lesson-type="' + type + '" data-lesson="' + e(l.id) + '" value="' + type + '"' + (l.type === type ? ' checked' : '') + (l.locked ? ' disabled' : '') + '><span>' + labels[type] + '</span></label>'; }).join('') + '</div>' + (l.locked ? '<p class="lc-field-help">已发布课节不可更换类型</p>' : '') + '</fieldset></div>' +
      '<div class="lc-lesson-files">' + lessonFilePicker(l,'content') + lessonFilePicker(l,'handout') + '</div></div><footer class="lc-lesson-footer">' + (editing.everPublished && existing ? btn(l.status === 'published' ? '下架课节' : '上架课节','lesson-status',l.id) : '') + btn('保存本课节','save-lesson',l.id,'lc-primary') + '</footer></article>';
  }
  function courseLessons() {
    return '<section class="lc-panel lc-course-lessons-editor" aria-labelledby="lc-lessons-editor-title"><div class="lc-lessons-toolbar"><h3 id="lc-lessons-editor-title">课节管理 <small>' + editing.lessons.length + ' 个课节</small></h3>' + btn('保存排序','save-order') + '</div><p class="lc-hint">拖动手柄或使用上移/下移调整顺序，排序需单独保存；“保存本课节”只保存该课节内容。</p><div class="lc-edit-lessons">' + (editing.lessons.length ? editing.lessons.map(courseLessonEditor).join('') : '<p class="lc-lessons-empty">暂无课节，添加后可上传视频、音频或 PDF 内容。</p>') + '</div>' + btn('＋ 添加课节','add-lesson','','lc-add-lesson') + '</section>';
  }
  function keepEditorView(update, anchorId) {
    var editor = host.querySelector('.lc-editor');
    if (!editor) return update();
    var focusScope = host.querySelector('.lc-editor-footer')?.contains(document.activeElement) ? host.querySelector('.lc-editor-footer') : editor;
    var focus = focusScope.contains(document.activeElement) ? document.activeElement : focusScope.contains(lastFocus) ? lastFocus : null;
    var attrs = ['id','data-lc','data-id','data-field','data-lesson','data-lesson-type','data-course-boolean','value','role','data-drag'];
    var key = focus && attrs.filter(function (a) { return focus.hasAttribute(a); }).map(function (a) { return [a,focus.getAttribute(a)]; });
    var picker = focus && focus.matches('.lc-file-picker,.lc-cover-picker') && focus.querySelector('[data-upload]');
    var uploadKey = picker && [picker.dataset.upload,picker.dataset.lesson];
    var selection = focus && typeof focus.selectionStart === 'number' ? [focus.selectionStart,focus.selectionEnd] : null;
    var positions = [], node = editor;
    while (node) { positions.push([node,node.scrollTop,node.scrollLeft]); node = node.parentElement; }
    var anchor = anchorId && Array.from(editor.querySelectorAll('[data-edit-lesson]')).find(function (n) { return n.dataset.editLesson === anchorId; });
    var top = anchor && anchor.getBoundingClientRect().top;
    update();
    positions.forEach(function (p) { p[0].scrollTop = p[1]; p[0].scrollLeft = p[2]; });
    if (anchor) {
      var next = Array.from(editor.querySelectorAll('[data-edit-lesson]')).find(function (n) { return n.dataset.editLesson === anchorId; });
      if (next) { var delta = next.getBoundingClientRect().top - top; var scroller = positions.find(function (p) { return p[0].scrollHeight > p[0].clientHeight + 1 && /auto|scroll/.test(getComputedStyle(p[0]).overflowY); }); if (scroller) scroller[0].scrollTop += delta; else if (document.scrollingElement) document.scrollingElement.scrollTop += delta; }
    }
    var restored;
    if (uploadKey) { var input = Array.from(editor.querySelectorAll('[data-upload]')).find(function (n) { return n.dataset.upload === uploadKey[0] && n.dataset.lesson === uploadKey[1]; }); restored = input && input.parentElement; }
    else if (key && key.length) restored = Array.from(focusScope.querySelectorAll(focus.tagName)).find(function (n) { return key.every(function (a) { return n.getAttribute(a[0]) === a[1]; }); });
    if (restored && !restored.disabled) { restored.focus({preventScroll:true}); if (selection) restored.setSelectionRange(selection[0],selection[1]); }
  }
  function refreshLesson(id) {
    pruneLocalFiles();
    if (editorFeedback && editorFeedback.container.closest('[data-edit-lesson]')?.dataset.editLesson === id) clearEditorFeedback();
    keepEditorView(function () {
      var card = Array.from(host.querySelectorAll('[data-edit-lesson]')).find(function (n) { return n.dataset.editLesson === id; });
      var index = editing.lessons.findIndex(function (l) { return l.id === id; });
      if (card && index >= 0) card.outerHTML = courseLessonEditor(editing.lessons[index],index);
    });
  }
  function syncLessonOrder(id) {
    keepEditorView(function () {
      var list = host.querySelector('.lc-edit-lessons');
      var cards = Array.from(list.querySelectorAll('[data-edit-lesson]'));
      editing.lessons.forEach(function (l, i) {
        var card = cards.find(function (n) { return n.dataset.editLesson === l.id; });
        if (!card) return;
        list.appendChild(card); card.querySelector('.lc-lesson-number').textContent = String(i + 1).padStart(2,'0');
        card.querySelector('[data-lc="move-up"]').disabled = i === 0;
        card.querySelector('[data-lc="move-down"]').disabled = i === editing.lessons.length - 1;
      });
    },id);
  }
  function renderEditor() {
    pruneLocalFiles();
    clearEditorFeedback();
    if (!D.admin('course')) return setView('list');
    if (editorGroups) { editorGroups.destroy(); editorGroups = null; }
    var saved = D.course(editing.id), isNew = !saved;
    var hint = isNew ? '填写课程基本信息，保存后即可添加课节。' : editing.everPublished ? '已发布课程：学习群组只可扩大；已有课节不可删除，已发布课节不可更换类型及内容。新课节保存后为未上架，需手动上架。' : '当前课程为草稿，不对学员展示。上架前请至少添加一个有效课节；预览仅展示已保存内容。';
    var markup = back('返回课程列表', 'leave-editor', saved && saved.status === 'draft' ? btn('预览课程','preview-course',saved.id) : '') + '<main class="lc-admin lc-editor gaip-page-form"><div class="lc-admin-heading"><h2>' + (isNew ? '新增课程' : '编辑课程') + '</h2></div><p class="lc-notice">' + hint + '</p><div class="lc-form-error gaip-form-help--error" role="alert" hidden></div>' + courseBasics() + (isNew ? '' : courseLessons()) + '</main><footer class="lc-editor-footer'+(isNew?' lc-editor-footer--draft':'')+'">' + (isNew ? '<p class="lc-editor-save-hint">保存后课程为草稿，不会对学员展示；可继续添加课节，也可稍后编辑。</p>' : '') + '<div class="lc-editor-footer-inner">' + btn('取消','leave-editor') + (isNew ? btn('保存草稿并返回','save-draft-return') : '') + btn(isNew ? '保存并添加课节' : '保存课程','save-course','','lc-primary') + '</div></footer>';
    keepEditorView(function () {
      var current = host.querySelector('.lc-editor');
      if (current) { var template = document.createElement('template'); template.innerHTML = markup; host.querySelector('.lc-editor-header').replaceWith(template.content.querySelector('.lc-editor-header')); current.innerHTML = template.content.querySelector('.lc-editor').innerHTML; var footer=host.querySelector('.lc-editor-footer'),nextFooter=template.content.querySelector('.lc-editor-footer');footer.className=nextFooter.className;footer.innerHTML=nextFooter.innerHTML; }
      else host.innerHTML = markup;
      mountEditorGroups();
    });
  }
  // Same feedback controller as modal forms; the page owns its scroll/field layout.
  function clearEditorFeedback() {
    if (editorFeedback) { editorFeedback.api.destroy(); editorFeedback = null; }
    var summary = host && host.querySelector('.lc-form-error');
    if (summary) { summary.hidden = true; summary.textContent = ''; }
  }
  function showEditorError(err) {
    clearEditorFeedback();
    var editor = host.querySelector('.lc-editor'), scope = editor, control, container;
    if (err.lessonId) scope = Array.from(editor.querySelectorAll('[data-edit-lesson]')).find(function (n) { return n.dataset.editLesson === err.lessonId; });
    if (scope && err.field) {
      if (err.field === 'image') control = scope.querySelector('.lc-cover-picker');
      else if (err.field === 'groups') control = scope.querySelector('[data-editor-groups] [role="combobox"]');
      else if (err.field === 'required') control = scope.querySelector('[data-course-boolean="required"]');
      else if (err.field === 'file') control = scope.querySelector('[data-upload="content"]')?.parentElement;
      else if (err.field === 'handout') control = scope.querySelector('[data-upload="handout"]')?.parentElement;
      else if (err.field === 'type') control = scope.querySelector('[data-lesson-type]');
      else control = scope.querySelector('[data-field="' + err.field + '"]');
      container = control && control.closest('.lc-field, .lc-basic-radio, .lc-lesson-file');
    }
    if (control && container) {
      var api = window.__GAIP_MODAL_COMPONENT__.createFieldFeedback(container,control);
      api.set(err.message); editorFeedback = {api:api,container:container,control:control};
    } else { container = editor.querySelector('.lc-form-error'); container.hidden = false; container.textContent = err.message; container.tabIndex = -1; control = container; }
    control.focus({preventScroll:true});
    // Scroll only the editor and include the error row; never scroll the outer page.
    var bounds = editor.getBoundingClientRect(), field = container.getBoundingClientRect();
    if (field.height > bounds.height) field = control.getBoundingClientRect();
    if (field.top < bounds.top + 16) editor.scrollTop += field.top - bounds.top - 16;
    else if (field.bottom > bounds.bottom - 16) editor.scrollTop += field.bottom - bounds.bottom + 16;
  }
  function saveEditor(lessonId) {
    if(pendingUploads()){toast('文件正在模拟上传，请等待完成或取消后再保存');return false;}
    clearEditorFeedback();
    var copy = D.clone(editing), old = D.course(copy.id);
    if (old && !lessonId) { var order = old.lessons.map(function (l) { return l.id; }); copy.lessons.sort(function (a,b) { var x = order.indexOf(a.id), y = order.indexOf(b.id); return (x < 0 ? 10000 : x) - (y < 0 ? 10000 : y); }); }
    try {
      var result = D.save(copy, lessonId);
      Object.keys(lessonUploads).forEach(function(key){var s=lessonUploads[key];if(s.status==='success'&&(!lessonId||s.lessonId===lessonId))clearUploads(s.lessonId,s.kind);});
      if (lessonId) {
        var pending = editing.lessons.map(function(l) { return l.id === lessonId ? D.clone(result.lessons.find(function(x) { return x.id === lessonId; })) : l; });
        editing = Object.assign({}, result, { lessons: pending });
        savedEditor = JSON.stringify(result); /* other unsaved lesson edits and order remain in the editor */
      }
      else { editing = result; savedEditor = JSON.stringify(result); }
      renderEditor(); toast(lessonId ? '课节已保存（其他课节未保存修改仍保留）' : '课程已保存'); return true;
    } catch (err) { showEditorError(err); return false; }
  }
  // Business actions and preview entries use the same scenario text and factory.
  var confirmationMessages = {
    'course-publish': '确认上架课程？全部课节（含此前单独下架的课节）都将同步上架。',
    'course-offline': '确认下架课程？学习记录会保留，学员不能重新进入课程。',
    'course-delete': '确认删除这个草稿课程？此操作不可恢复。',
    'lesson-delete': '确认删除课节「{name}」？将从当前编辑列表移除，保存课程后生效。',
    'lesson-publish': '确认上架此课节？',
    'lesson-offline': '确认下架此课节？历史记录会保留，课程完成度按剩余上架课节重新计算。',
    'last-lesson-offline': '已上架课程至少保留一个上架课节，无法下架最后一个课节。如需暂停整门课程，请在课程管理中下架课程。',
    'unsaved': '课程或课节有未保存修改，是否保存后离开？未保存排序请先单独保存。'
  };
  function confirmScene(scene, done, third, lessonName) {
    if (!Object.prototype.hasOwnProperty.call(confirmationMessages, scene)) throw new Error('未知学习中心确认场景：' + scene);
    if (scene === 'last-lesson-offline') return confirm(confirmationMessages[scene], function () {}, null, { title: '无法下架课节', cancelLabel: '返回', confirmLabel: '我知道了', tone: null });
    var danger = ['course-offline', 'course-delete', 'lesson-delete', 'lesson-offline'].includes(scene);
    var primaryLabel = scene === 'lesson-delete' ? '删除课节' : scene === 'course-delete' ? '删除草稿' : danger ? '确认下架' : '立即上架';
    var message = scene === 'lesson-delete' ? confirmationMessages[scene].replace('{name}', lessonName || '未命名课节') : confirmationMessages[scene];
    return confirm(message, done || function () {}, third, { title: scene === 'lesson-delete' ? '删除课节' : null, cancelLabel: scene === 'lesson-delete' ? '取消' : '再想想', confirmLabel: primaryLabel, tone: danger ? 'danger' : null });
  }
  function confirm(message, done, third, options) {
    if (popup) popup.close(); lastFocus = document.activeElement;
    var parts = window.__GAIP_MODAL_COMPONENT__.createConfirm({ title: third ? '有未保存的修改' : options.title || '操作确认', message: message, cancelLabel: third ? '放弃修改并离开' : options.cancelLabel, confirmLabel: third ? '保存并离开' : options.confirmLabel, tone: options.tone });
    popup = parts.dialog; popup.dataset.learningDialog = 'true';
    if (third) {
      parts.cancel.classList.add('gaip-modal__button--danger-outline');
      parts.cancel.removeAttribute('data-modal-cancel'); parts.cancel.setAttribute('data-learning-discard', '');
      parts.cancel.addEventListener('click', function () { parts.dialog.close(); third(); });
    } else parts.cancel.addEventListener('click', function () { parts.dialog.close(); });
    parts.close.addEventListener('click', function () { parts.dialog.close(); });
    parts.confirm.addEventListener('click', function () { if (attempt(done) !== false) parts.dialog.close(); });
    parts.dialog.addEventListener('close', function () { parts.dialog.remove(); if (popup === parts.dialog) popup = null; if (lastFocus && lastFocus.isConnected) lastFocus.focus({ preventScroll: true }); }, { once: true });
    document.body.appendChild(parts.dialog); if (window.__GAIP_MODAL_POSITION__) window.__GAIP_MODAL_POSITION__.adopt(parts.dialog); parts.dialog.showModal(); return parts.dialog;
  }
  function leaveEditor(done) { if (!pendingUploads() && JSON.stringify(editing) === savedEditor) return done(); confirmScene('unsaved', function () { if (!saveEditor()) return false; done(); }, done); }
  function studyUsers() { return D.scopeUsers().filter(function (u) { return D.matchesOrg(u,filters.org) && (!filters.group || u.groups.includes(filters.group)) && (statsTab !== 'users' || !filters.q || (u.name.includes(filters.q) || u.account === filters.q)); }); }
  function learnerRow(u) {
    var cs = D.state().courses, current = cs.filter(function (c) { return c.status === 'published' && D.entitled(c, u); });
    var must = current.filter(function (c) { return c.required; }), doneMust = must.filter(function (c) { return D.summary(c,u.id).status === '已完成'; }).length;
    return { user: u, duration: cs.reduce(function (n,c) { return n + D.studyHistory(c,u.id).duration; },0), must: must.length, rate: must.length ? Math.round(doneMust / must.length * 100) + '%' : '—', learning: current.filter(function (c) { return D.summary(c,u.id).status === '学习中'; }).length, completed: cs.filter(function (c) { var h = D.studyHistory(c,u.id); return c.status === 'published' ? D.summary(c,u.id).status === '已完成' : !!h.completion.firstAt; }).length, last: cs.map(function (c) { return D.studyHistory(c,u.id).lastAt; }).sort().pop() };
  }
  function courseStat(c, us) {
    var entitled = us.filter(function (u) { return D.entitled(c,u); }), done = 0, learning = 0;
    entitled.forEach(function (u) { var s = D.summary(c,u.id); if (s.status === '已完成') done++; else if (s.status === '学习中') learning++; });
    return { c: c, expected: entitled.length, done: done, learning: learning, notstarted: entitled.length - done - learning, rate: entitled.length ? Math.round(done / entitled.length * 100) + '%' : '—', last: entitled.map(function (u) { return D.studyHistory(c,u.id).lastAt; }).sort().pop() };
  }
  function statsData() {
    var us = studyUsers();
    if (statsTab === 'users') return us.map(learnerRow).sort(function (a,b) { return b.duration-a.duration; });
    return D.state().courses.filter(function (c) { return c.everPublished && (!filters.status || c.status === filters.status) && (!filters.required || String(c.required) === filters.required) && (!filters.q || c.title.includes(filters.q)); }).sort(function(a,b) {return (a.status === 'offline') - (b.status === 'offline') || b.updatedAt.localeCompare(a.updatedAt);}).map(function (c) { return courseStat(c,us); });
  }
  var userHeaders = ['姓名 / 登录账号','所属组织','累计学习时长','当前必修课程数','必修完成率','学习中课程数','已完成课程数','最后学习时间'];
  var courseHeaders = ['课程名称','状态','学习群组','必修','精选','应学人数','已完成','学习中','未学习','完成率','最后学习时间'];
  function studyText(value) { return '<span class="lc-study-text" title="'+e(value)+'">'+e(value)+'</span>'; }
  function studyTag(value) { return window.__GAIP_TABLE__.tag(value,{tone:value==='已上架'||value==='已完成'?'success':value==='学习中'?'highlight':'neutral'}).outerHTML; }
  function studyIdentity(name, account) { return '<div class="lc-study-identity">'+studyText(name)+'<div>'+e(account)+'</div></div>'; }
  function statCells(r, html) {
    if (statsTab === 'users') return [r.user.name + (html ? '<small>' + e(r.user.account) + '</small>' : ' / ' + r.user.account), r.user.org, time(r.duration), r.must, r.rate, r.learning, r.completed, date(r.last)];
    return [r.c.title,labels[r.c.status],groupText(r.c),r.c.required ? '是' : '否',r.c.featured ? '是' : '否',r.expected,r.done,r.learning,r.notstarted,r.rate,date(r.last)];
  }
  function renderStats() {
    if (!D.admin('study')) return setView('list');
    var tabs = '<div class="lc-stats-tabs" role="tablist" aria-label="统计维度">' + ['users','courses'].map(function (tab) { return '<button type="button" class="lc-stats-tab" id="lc-stats-tab-'+tab+'" role="tab" data-lc="stats-tab" data-id="'+tab+'" aria-controls="lc-stats-panel" aria-selected="'+(statsTab===tab)+'" tabindex="'+(statsTab===tab?'0':'-1')+'">'+(tab==='users'?'学员学习统计':'课程学习统计')+'</button>'; }).join('') + '</div>';
    // Keep the shared tabs connected so their underline transitions can finish.
    if (!host.querySelector('.lc-stats-header')) {
      host.innerHTML = back('返回学习中心','list',btn('操作日志','logs','','gaip-table__button') + btn('导出 Excel','export','','lc-primary gaip-table__button is-primary')) + '<main id="lc-stats-panel" class="lc-admin lc-stats" role="tabpanel" aria-labelledby="lc-stats-tab-'+statsTab+'"><div class="lc-stats-filter-slot"></div><p class="lc-hint">仅显示当前管理组织及下级在职学员。当前必修与学习中按已上架课程统计。已下架课节不纳入本页及导出统计；历史学习记录保留，重新上架后参与统计。所有数据均为本地 Mock。</p><section class="lc-stats-results" aria-label="学习统计列表"></section></main>';
      var toolbar=host.querySelector('.lc-manage-header');
      toolbar.classList.add('lc-stats-header');
      toolbar.querySelector('.lc-manage-header-actions').insertAdjacentHTML('beforebegin',tabs);
      host.querySelector('.lc-manage-header-actions').classList.add('gaip-table-tools');
    }
    var statsPanel=host.querySelector('#lc-stats-panel');
    statsPanel.setAttribute('aria-labelledby','lc-stats-tab-'+statsTab);
    statsPanel.scrollTop=0;
    host.querySelectorAll('.lc-stats-tab').forEach(function(tab){
      var selected=tab.dataset.id===statsTab;
      tab.setAttribute('aria-selected',String(selected));
      tab.tabIndex=selected?0:-1;
    });
    if(window.__GAIP_TABS__)window.__GAIP_TABS__.refresh();
    filterBar = window.__GAIP_FILTER_BAR__.mount(host.querySelector('.lc-stats-filter-slot'), {
      label:'学情筛选', mode:'instant', values:filters, actions:{reset:true,submit:false,more:false},
      fields:[
        {key:'q',type:'search',label:statsTab==='users'?'姓名 / 登录账号':'课程名称',placeholder:statsTab==='users'?'姓名模糊 / 账号精确':'搜索课程名称',wide:true},
        {key:'org',type:'treeSelect',label:'所属组织',placeholder:'管理范围内全部组织',nodes:D.organizationNodes},
        {key:'group',type:'select',label:'学习群组',options:[{value:'',label:'全部学习群组'}].concat(D.groups.map(function(g){return {value:g,label:g};}))},
        {key:'status',type:'select',label:'课程状态',visible:statsTab==='courses',options:[{value:'',label:'全部状态'},{value:'published',label:'已上架'},{value:'offline',label:'已下架'}]},
        {key:'required',type:'select',label:'必修属性',visible:statsTab==='courses',options:[{value:'',label:'全部课程'},{value:'true',label:'必修'},{value:'false',label:'非必修'}]}
      ],onChange:function(value){filters=value;updateStatsResults(true);}
    });
    updateStatsResults();
  }
  function updateStatsResults(resetPage) {
    var rows=statsData().map(function(r){
      var cells=statCells(r,false).map(e);
      cells[0]=statsTab==='users'?studyIdentity(r.user.name,r.user.account):studyText(r.c.title);
      if(statsTab==='users')cells[1]=studyText(r.user.org);
      else {cells[1]=studyTag(labels[r.c.status]);cells[2]=studyText(groupText(r.c));}
      cells.push('<div class="gaip-table__row-actions">'+btn('详情','stats-detail',statsTab==='users'?r.user.id:r.c.id,'lc-link gaip-table__button')+'</div>');return cells;
    });
    if(manageTable){manageTable.setRows(rows,!!resetPage);return;}
    var headers=(statsTab==='users'?userHeaders:courseHeaders).concat('操作');
    var widths=statsTab==='users'?[180,200,128,144,112,128,128,176,80]:[240,100,164,72,72,96,88,88,88,96,176,80];
    manageTable=window.__GAIP_TABLE__.mount(host.querySelector('.lc-stats-results'),{
      title:statsTab==='users'?'学员学习统计':'课程学习统计',rows:rows,rowVerticalAlign:'top',minWidth:widths.reduce(function(a,b){return a+b;},0),boundary:host.querySelector('.lc-stats'),bottomGap:0,
      columns:headers.map(function(label,i){return {label:label,width:widths[i],align:(statsTab==='users'?i>=2&&i<=6:i>=5&&i<=9)?'right':null,fixed:i===0?'left':i===headers.length-1?'right':null,renderHTML:function(row){return row[i];}};})
    });
  }
  function download(blob, name) { var url=URL.createObjectURL(blob), a=document.createElement('a'); a.href=url; a.download=name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () {URL.revokeObjectURL(url);},10000); }
  function exportStats() {
    if(!D.admin('study'))return toast('没有学情管理权限');
    if(view==='stats'&&filterBar){filters=filterBar.getValues();updateStatsResults(false);}
    var rows=statsData(), exportRows, headers;
    if (statsTab === 'users') {
      headers=['姓名','域账号','组织架构节点（完整路径）','累计学习时长','当前必修课程数','当前必修完课率','在学课程名称','学完课程名称'];
      exportRows=rows.map(function(r) {
        var cs=D.state().courses, uid=r.user.id;
        var learning=cs.filter(function(c){return c.status==='published' && D.entitled(c,r.user) && D.summary(c,uid).status==='学习中';});
        var completed=cs.filter(function(c){return c.status==='published' ? D.summary(c,uid).status==='已完成' : !!D.studyHistory(c,uid).completion.firstAt;});
        return [r.user.name,r.user.account,r.user.org,time(r.duration),r.must,r.rate,learning.map(function(c){return c.title;}).join('、'),completed.map(function(c){return c.title;}).join('、')];
      });
    } else {headers=courseHeaders;exportRows=rows.map(function(r){return statCells(r,false);});}
    download(window.__GAIP_OPERATION_LOG_XLSX__.build([headers].concat(exportRows), {sheetName: statsTab === 'users' ? '学员学习统计' : '课程学习统计', confidential: true}), 'GAIP学习中心' + (statsTab === 'users' ? '学情管理' : '课程管理') + '_' + new Date().toISOString().replace(/[:.]/g,'-') + '.xlsx');
    D.log('导出学情',null,JSON.stringify({ filters:filters, type:statsTab, count:rows.length, scope:D.user().scope })); D.persist(); toast('已导出全部筛选结果：' + rows.length + ' 条');
  }
  function openStudyDetail(id,kind) {
    if(!D.admin('study'))return toast('没有学情管理权限');
    var detailKind=kind||statsTab, detailId=id, trigger=document.activeElement, detailTable, detailBar;
    var dialog=document.createElement('dialog'); dialog.className='gaip-modal lc-study-detail-modal'; dialog.dataset.learningDialog='true';
    dialog.dataset.gaipModalId=detailKind==='users'?'learning-study-detail':'learning-course-study-detail';
    dialog.dataset.gaipModalCategory='information';dialog.dataset.gaipModalPlacement='center';
    dialog.setAttribute('aria-labelledby','lc-study-detail-title');
    dialog.innerHTML='<div class="ant-modal-content"><header class="ant-modal-header"><h2 id="lc-study-detail-title" class="gaip-modal__title" tabindex="-1">' + (detailKind === 'users' ? '学员学习详情' : '课程学习详情') + '</h2></header><button type="button" data-close aria-label="关闭详情"></button><div class="lc-study-detail-body"></div></div>';
    window.__GAIP_MODAL_COMPONENT__.adoptClose(dialog.querySelector('[data-close]'));
    var detailFilters={q:'',status:'',org:''};
    function draw() {
      var us=D.scopeUsers(), rows, title, headers, summary;
      if (detailKind === 'users') {
        var u=us.find(function (x) {return x.id === detailId;}); if (!u) return dialog.close(); title=u.name + ' / ' + u.account;
        summary='<h3>'+e(u.name)+'</h3><dl><div><dt>登录账号</dt><dd>'+e(u.account)+'</dd></div><div><dt>所属组织</dt><dd>'+e(u.org)+'</dd></div></dl>';
        rows=D.state().courses.filter(function (c) {return (c.status === 'published' && D.entitled(c,u)) || (c.everPublished && D.studyHistory(c,u.id).firstAt);}).map(function (c) { var s=D.summary(c,u.id), h=D.studyHistory(c,u.id); return {name:c.title,status:s.status,last:h.lastAt,course:c,cells:[studyText(c.title),studyTag(labels[c.status]),c.required ? '是':'否',c.featured ? '是':'否',studyTag(s.status),s.progress+'%',date(h.firstAt),date(h.lastAt),date(h.completion.firstAt),date(h.completion.latestAt),time(h.duration)]};});
        headers=['课程名称','课程状态','必修','精选','学习状态','进度','首次学习','最近学习','首次完成','最近完成','累计时长'];
      } else {
        var c=D.course(detailId); if(!c)return dialog.close(); title=c.title;
        summary='<h3>'+e(title)+'</h3><dl><div><dt>课程状态</dt><dd>'+e(labels[c.status])+'</dd></div><div><dt>学习群组</dt><dd>'+e(groupText(c))+'</dd></div><div><dt>必修</dt><dd>'+(c.required?'是':'否')+'</dd></div><div><dt>精选</dt><dd>'+(c.featured?'是':'否')+'</dd></div></dl>';
        // Retain the parent organization/group scope as well as detail-level filters.
        rows=studyUsers().filter(function (u) {return D.entitled(c,u);}).map(function (u) {var s=D.summary(c,u.id),h=D.studyHistory(c,u.id);return {name:u.name+u.account,status:s.status,last:h.lastAt,person:u,cells:[studyIdentity(u.name,u.account),studyText(u.org),studyTag(s.status),date(h.firstAt),date(h.lastAt),date(h.completion.firstAt),date(h.completion.latestAt),time(h.duration)]};});
        headers=['姓名 / 账号','组织','学习状态','首次学习','最近学习','首次完成','最近完成','累计时长'];
      }
      rows=rows.filter(function (r) {return (r.person ? r.person.name.includes(detailFilters.q) || r.person.account === detailFilters.q : r.name.includes(detailFilters.q)) && (!detailFilters.status || r.status === detailFilters.status) && (!r.person || D.matchesOrg(r.person,detailFilters.org));}).sort(function (a,b) {return detailKind === 'users' ? (a.course.status==='offline')-(b.course.status==='offline') || b.course.createdAt.localeCompare(a.course.createdAt) : ['已完成','学习中','未学习'].indexOf(a.status)-['已完成','学习中','未学习'].indexOf(b.status) || b.last.localeCompare(a.last);});
      if(detailTable){detailTable.setRows(rows,true);return;}
      dialog.querySelector('.lc-study-detail-body').innerHTML='<section class="lc-study-summary" aria-label="'+(detailKind==='users'?'学员信息':'课程信息')+'">'+summary+'</section><div class="lc-study-detail-filter"></div><section class="lc-study-detail-table" aria-label="学习明细"></section>';
      detailBar=window.__GAIP_FILTER_BAR__.mount(dialog.querySelector('.lc-study-detail-filter'),{
        label:'学习明细筛选',mode:'instant',actions:{reset:true,submit:false,more:false},
        fields:[{key:'q',type:'search',label:detailKind==='users'?'课程名称':'姓名 / 登录账号',placeholder:detailKind==='users'?'搜索课程名称':'姓名模糊 / 账号精确',wide:true},
          {key:'org',type:'treeSelect',label:'所属组织',visible:detailKind==='courses',placeholder:'管理范围内全部组织',nodes:D.organizationNodes},
          {key:'status',type:'select',label:'学习状态',options:[{value:'',label:'全部状态'},{value:'未学习',label:'未学习'},{value:'学习中',label:'学习中'},{value:'已完成',label:'已完成'}]}],
        onChange:function(value){detailFilters.q=value.q||'';detailFilters.org=value.org||'';detailFilters.status=value.status||'';draw();}
      });
      var widths=detailKind==='users'?[220,100,72,72,100,80,160,160,160,160,100]:[180,200,100,160,160,160,160,100];
      detailTable=window.__GAIP_TABLE__.mount(dialog.querySelector('.lc-study-detail-table'),{
        title:'学习明细',rows:rows,rowVerticalAlign:'top',minWidth:widths.reduce(function(a,b){return a+b;},0),boundary:dialog.querySelector('.lc-study-detail-body'),bottomGap:0,
        columns:headers.map(function(label,i){return {label:label,width:widths[i],align:(detailKind==='users'?i===5||i===10:i===7)?'right':null,fixed:i===0?'left':null,renderHTML:function(r){return r.cells[i];}};})
      });
    }
    dialog.addEventListener('click',function (ev) {if(ev.target.closest('[data-close]'))dialog.close();});
    dialog.addEventListener('close',function () {if(detailBar)detailBar.destroy();if(detailTable)detailTable.destroy();dialog.remove();if(trigger&&trigger.isConnected)trigger.focus({preventScroll:true});},{once:true}); document.body.appendChild(dialog);
    if(window.__GAIP_MODAL_POSITION__)window.__GAIP_MODAL_POSITION__.adopt(dialog);
    dialog.showModal();draw();dialog.querySelector('.gaip-modal__title').focus({preventScroll:true});return dialog;
  }
  var courseLogDialog;
  function openCourseLog() { return openLearningLog(false); }
  function openStudyLog() { return openLearningLog(true); }
  function openLearningLog(study) {
    if (!(study ? D.admin('study') : D.admin('course') || window.__GAIP_LEARNING_LIVE_DATA__ && window.__GAIP_LEARNING_LIVE_DATA__.admin())) return toast(study?'没有学情管理权限':'没有日志查看权限');
    if (courseLogDialog && courseLogDialog.open) return courseLogDialog;
    var trigger = document.activeElement, dialog = document.createElement('dialog'), logTable, logFilter, valueIndex = 0, valueFrame = 0, valueResize, valueObserver;
    dialog.className = 'gaip-modal lc-course-log-modal';
    dialog.dataset.learningDialog = ''; dialog.dataset.gaipModalId = study?'learning-study-log':'learning-course-log';
    dialog.dataset.gaipModalCategory = 'information'; dialog.dataset.gaipModalPlacement = 'center';
    dialog.setAttribute('aria-labelledby', 'lc-course-log-title');
    dialog.innerHTML = '<div class="ant-modal-content"><header class="ant-modal-header"><h2 id="lc-course-log-title" class="gaip-modal__title" tabindex="-1">操作日志</h2></header><button type="button" data-log-close aria-label="关闭操作日志"></button><div class="lc-course-log-body"><section class="lc-course-log-table" aria-label="课程操作日志"></section></div></div>';
    if(study){dialog.classList.add('lc-study-log-modal');dialog.querySelector('.lc-course-log-table').setAttribute('aria-label','学情操作日志');}
    window.__GAIP_MODAL_COMPONENT__.adoptClose(dialog.querySelector('[data-log-close]'));
    dialog.querySelector('[data-log-close]').addEventListener('click', function () { dialog.close(); });
    function logValue(value) {
      value = String(value == null ? '-' : value);
      return value.length > 24 ? '<details><summary>' + e(value.slice(0, 12)) + '… 展开</summary><pre>' + e(value) + '</pre></details>' : e(value);
    }
    function logAction(r) {
      var tag = window.__GAIP_TABLE__.tag(r.action || '其他');
      tag.classList.add('lc-log-action-tag');
      tag.dataset.tone = ['新增', '上架', '上架课节'].includes(r.action) ? 'green' : ['删除', '下架', '下架课节'].includes(r.action) ? 'red' : r.action === '编辑' ? 'blue' : 'neutral';
      if (!r.reason) return tag;
      var cell = document.createElement('div'), reason = document.createElement('div');
      reason.textContent = r.reason; cell.append(tag, reason); return cell;
    }
    function changeValue(value) {
      var id = 'lc-log-value-' + (++valueIndex);
      return '<div id="' + id + '" class="lc-log-value is-collapsed">' + e(String(value == null || value === '' ? '-' : value)) + '</div><button type="button" class="lc-log-value-toggle" data-log-value-toggle aria-expanded="false" aria-controls="' + id + '" hidden>展开全部</button>';
    }
    function measureValues() {
      cancelAnimationFrame(valueFrame);
      valueFrame = requestAnimationFrame(function () {
        dialog.querySelectorAll('.lc-log-value.is-collapsed').forEach(function (node) {
          node.nextElementSibling.hidden = node.scrollHeight <= node.clientHeight + 1;
        });
      });
    }
    dialog.addEventListener('click', function (event) {
      var button = event.target.closest('[data-log-value-toggle]');
      if (!button) return;
      var value = dialog.querySelector('#' + button.getAttribute('aria-controls')), expanded = button.getAttribute('aria-expanded') === 'true';
      value.classList.toggle('is-collapsed', expanded);
      button.setAttribute('aria-expanded', String(!expanded));
      button.textContent = expanded ? '展开全部' : '收起全部';
      if (logTable) logTable.refresh();
    });
    dialog.addEventListener('close', function () {
      if (valueObserver) valueObserver.disconnect(); if (valueResize) valueResize.disconnect(); cancelAnimationFrame(valueFrame);
      if (logTable) logTable.destroy();
      if (logFilter) logFilter.destroy();
      dialog.remove(); if (courseLogDialog === dialog) courseLogDialog = null;
      if (trigger && trigger.isConnected) trigger.focus({ preventScroll: true });
    }, { once: true });
    courseLogDialog = dialog; document.body.appendChild(dialog);
    if (window.__GAIP_MODAL_POSITION__) window.__GAIP_MODAL_POSITION__.adopt(dialog);
    dialog.showModal();
    var studyLogs=study?D.state().logs.filter(function(r){return r.action==='导出学情'&&(D.user().roles.includes('super')||r.account===D.user().account);}).slice().sort(function(a,b){return b.at.localeCompare(a.at);}):[];
    if(study){
      var filterSlot=document.createElement('div');filterSlot.className='lc-study-log-filter';dialog.querySelector('.lc-course-log-body').prepend(filterSlot);
      logFilter=window.__GAIP_FILTER_BAR__.mount(filterSlot,{label:'日志筛选',mode:'instant',actions:{reset:true,submit:false,more:false},fields:[{key:'q',type:'search',label:'搜索日志',placeholder:'搜索操作、课程、操作者',wide:true}],onChange:function(value){if(logTable)logTable.setRows(studyLogs.filter(function(r){return !value.q||(r.action+r.course+r.operator).includes(value.q);}),true);}});
    }
    logTable = window.__GAIP_TABLE__.mount(dialog.querySelector('.lc-course-log-table'), {
      title: study?'学情操作日志':'课程与直播操作日志', rows: study?studyLogs:(D.admin('course')?D.courseLogs().map(function(r){return Object.assign({project:'课程'},r);}):[]).concat(window.__GAIP_LEARNING_LIVE_DATA__?window.__GAIP_LEARNING_LIVE_DATA__.logs():[]).sort(function(a,b){return String(b.at).localeCompare(String(a.at));}), minWidth: study?1120:1240, rowVerticalAlign: 'top', boundary: dialog.querySelector('.lc-course-log-body'), bottomGap: 0,
      emptyText: '暂无操作日志', columns: study?[
        {label:'操作时间',width:176,render:function(r){return date(r.at);}},
        {label:'操作人 / 账号',width:168,renderHTML:function(r){return e(r.operator)+'<div>'+e(r.account)+'</div>';}},
        {label:'IP',key:'ip',width:128},
        {label:'操作',width:112,render:logAction},
        {label:'课程',key:'course',width:176},
        {label:'变更详情',width:360,renderHTML:function(r){return changeValue(r.details);}}
      ]:[
        { label: '操作项目', key: 'project', width: 120 },
        { label: '分类', width: 96, render: logAction },
        { label: '操作对象', width: 192, renderHTML: function (r) { return logValue(r.object); } },
        { label: '变更字段', key: 'field', width: 112 },
        { label: '变更前', width: 160, renderHTML: function (r) { return changeValue(r.before); } },
        { label: '变更后', width: 160, renderHTML: function (r) { return changeValue(r.after); } },
        { label: '操作人', width: 140, renderHTML: function (r) { return e(r.operator || '历史未记录') + '<div>' + e(r.account || '历史未记录') + '</div>'; } },
        { label: '操作时间', width: 160, render: function (r) { return r.at ? date(r.at) : '历史未记录'; } },
        { label: 'IP', key: 'ip', width: 100 }
      ]
    });
    valueObserver = new MutationObserver(measureValues);
    valueObserver.observe(dialog.querySelector('.lc-course-log-table'), { childList: true, subtree: true });
    valueResize = new ResizeObserver(measureValues); valueResize.observe(dialog.querySelector('.lc-course-log-table'));
    measureValues();
    dialog.querySelector('#lc-course-log-title').focus({ preventScroll: true }); logTable.refresh();
    return dialog;
  }
  function upload(target) {
    var file=target.files[0];if(!file)return;var kind=target.dataset.upload,l=editing.lessons.find(function(x){return x.id===target.dataset.lesson;});
    var limit=kind==='cover'?10*1024*1024:kind==='content'&&l.type==='video'?3*1024*1024*1024:100*1024*1024;
    var ext=file.name.split('.').pop().toLowerCase(), allowed=kind==='cover'?['jpg','jpeg','png','webp']:kind==='handout'||l.type==='pdf'?['pdf']:l.type==='audio'?['mp3','m4a','wav']:['mp4','mov','webm'];
    if(kind!=='cover'){
      if(!l||(kind==='content'&&(!l.type||l.locked)))return;
      clearUploads(l.id,kind);target.value='';
      var item={name:file.name,size:file.size,mock:true},key=l.id+'/'+kind;
      if(file.size>limit||!allowed.includes(ext)){lessonUploads[key]={lessonId:l.id,kind:kind,file:item,status:'failed',message:'文件格式不支持或超过大小上限，请重新选择文件',retryable:false};refreshLesson(l.id);return;}
      item.localFileId=D.uid('file');startLessonUpload(l.id,kind,item,file);return;
    }
    if(file.size>limit||!allowed.includes(ext)){target.value='';return showEditorError({message:'文件格式不支持或超过大小上限',field:'image'});}
    if(kind==='cover'){var reader=new FileReader();reader.onload=function(){editing.image=reader.result;editing.imageName=file.name;renderEditor();};reader.readAsDataURL(file);}
  }
  function startLessonUpload(lessonId,kind,file,selectedFile) {
    clearUploads(lessonId,kind);
    var key=lessonId+'/'+kind,courseId=editing.id,s={lessonId:lessonId,kind:kind,file:file,selectedFile:selectedFile,status:'uploading',progress:0,retryable:true};lessonUploads[key]=s;
    refreshLesson(lessonId);
    s.timer=setInterval(function(){
      var l=editing&&editing.id===courseId&&editing.lessons.find(function(x){return x.id===lessonId;});
      if(!host||view!=='edit'||!l||lessonUploads[key]!==s){clearInterval(s.timer);return;}
      s.progress=Math.min(100,s.progress+10);
      if(s.progress===100){clearInterval(s.timer);s.status='success';if(selectedFile){var ext=file.name.split('.').pop().toLowerCase(),mime={pdf:'application/pdf',mp4:'video/mp4',mov:'video/quicktime',webm:'video/webm',mp3:'audio/mpeg',m4a:'audio/mp4',wav:'audio/wav'}[ext];localFiles[file.localFileId]={url:URL.createObjectURL(new Blob([selectedFile],{type:mime})),file:selectedFile};}l[kind==='content'?'file':'handout']=D.clone(file);pruneLocalFiles();refreshLesson(lessonId);return;}
      var node=Array.from(host.querySelectorAll('[data-upload-state]')).find(function(n){return n.dataset.uploadState===key;});
      if(node){node.querySelector('progress').value=s.progress;node.querySelector('output').textContent=s.progress+'%';}
    },250);
  }
  function action(a,id) {

    if(['cancel-upload','fail-upload','retry-upload'].includes(a)){
      var uploadState=lessonUploads[id];if(!uploadState)return;
      if(a==='retry-upload'){if(uploadState.status==='failed'&&uploadState.retryable)startLessonUpload(uploadState.lessonId,uploadState.kind,uploadState.file,uploadState.selectedFile);return;}
      clearInterval(uploadState.timer);
      if(a==='cancel-upload')delete lessonUploads[id];else{uploadState.status='failed';uploadState.message='模拟上传失败，请重试';}
      refreshLesson(uploadState.lessonId);return;
    }
    if(a==='preview-course')return previewCourse(id);
    if(a==='list')return setView('list');if(a==='course')return openCourse(id);if(a==='detail'){stop();return setView('detail');}if(a==='lesson'||a==='adjacent')return openLesson(id);
    if(a==='toggle')return toggle();if(a==='speed'){speed=Number(id);host.querySelectorAll('[data-lc="speed"]').forEach(function(b){var selected=Number(b.dataset.id)===speed;b.classList.toggle('is-selected',selected);b.setAttribute('aria-pressed',String(selected));});return;}
    if(a==='fullscreen'||a==='fullscreen-pdf'){var el=host.querySelector(a==='fullscreen'?'.gaip-course-player-stage':'.lc-pdf-scroll');if(document.fullscreenElement)document.exitFullscreen();else if(el.requestFullscreen)el.requestFullscreen().catch(function(){toast('当前浏览器不支持全屏');});return;}
    if(a==='zoom-in'||a==='zoom-out'){var pagesEl=host.querySelector('.lc-pdf-pages'),z=Math.max(60,Math.min(160,Number(pagesEl.dataset.zoomValue)+(a==='zoom-in'?20:-20)));pagesEl.dataset.zoomValue=z;pagesEl.style.setProperty('--pdf-width',z+'%');host.querySelector('[data-zoom]').textContent=z+'%';return;}
    if(a==='handout'){var c=D.course(currentId);if(!D.accessible(c))return toast('当前权限已变更，无法下载讲义');var link=document.createElement('a');link.href=asset('assets/learning/lesson-reading-sample.pdf');link.download='本地示例课程讲义.pdf';document.body.appendChild(link);link.click();link.remove();return;}
    if(a==='create')return beginEdit();if(a==='edit')return beginEdit(id);if(a==='leave-editor')return leaveEditor(function(){setView('manage');});
    if(a==='publish'){var c=D.course(id),on=c.status!=='published';return confirmScene(on?'course-publish':'course-offline',function(){D.publish(id,on);render();});}
    if(a==='delete')return confirmScene('course-delete',function(){D.remove(id);render();});
    if(a==='add-lesson'){if(!D.course(editing.id))return toast('请先保存课程基本信息');editing.lessons.push(D.newLesson());renderEditor();var field=host.querySelector('.lc-edit-lesson:last-child [data-field="title"]'),editor=host.querySelector('.lc-editor');editor.scrollTop+=field.getBoundingClientRect().top-editor.getBoundingClientRect().top-32;field.focus({preventScroll:true});return;}
    if(a==='save-draft-return'){if(!D.course(editing.id)&&saveEditor())setView('manage');return;}
    if(a==='save-course'){var firstSave=!D.course(editing.id);if(saveEditor()&&firstSave)action('add-lesson');return;}if(a==='save-lesson')return saveEditor(id);
    if(a==='save-order'){D.saveOrder(editing.id,editing.lessons.map(function(l){return l.id;}));editing.updatedAt=D.course(editing.id).updatedAt;editing.updatedBy=D.course(editing.id).updatedBy;savedEditor=JSON.stringify(D.course(editing.id));toast('排序已保存；未保存字段仍保留');return;}
    if(a==='sample-cover'){editing.image='assets/learning/course-01-arkos.jpg';editing.imageName='course-01-arkos.jpg';return renderEditor();}
    if(['remove-lesson','remove-handout','sample-content','move-up','move-down','lesson-status'].includes(a)){
      var l=editing.lessons.find(function(x){return x.id===id;}),index=editing.lessons.indexOf(l);
      if(a==='remove-lesson'){
        var canDelete=function(){var saved=D.course(editing.id);return D.admin('course')&&!(saved&&saved.everPublished&&saved.lessons.some(function(x){return x.id===id;}));};
        if(!l||!canDelete())return toast('已发布课程的已有课节不可删除');
        return confirmScene('lesson-delete',function(){
          if(!canDelete())return false;
          var at=editing.lessons.findIndex(function(x){return x.id===id;}),neighbor=editing.lessons[at+1]||editing.lessons[at-1];
          if(at<0)return false;clearUploads(id);editing.lessons.splice(at,1);renderEditor();
          var next=neighbor&&Array.from(host.querySelectorAll('[data-edit-lesson]')).find(function(n){return n.dataset.editLesson===neighbor.id;});
          (next?next.querySelector('[data-drag]'):host.querySelector('[data-lc="add-lesson"]')).focus({preventScroll:true});
          toast('课节已移除，保存课程后生效');
        },null,l.title);
      }
      if(a==='remove-handout'){clearUploads(id,'handout');l.handout=null;}
      if(a==='sample-content'){clearUploads(id,'content');l.file={name:l.type==='pdf'?'本地图文讲义.pdf':'本地'+labels[l.type]+'占位',size:1024,mock:true};}
      if(a==='move-up'||a==='move-down'){var to=index+(a==='move-up'?-1:1);if(to>=0&&to<editing.lessons.length){editing.lessons.splice(index,1);editing.lessons.splice(to,0,l);syncLessonOrder(id);}return;}
      if(a==='lesson-status'){var current=D.course(editing.id),on=l.status!=='published';if(!on&&current.status==='published'&&D.active(current).length===1)return confirmScene('last-lesson-offline');return confirmScene(on?'lesson-publish':'lesson-offline',function(){D.publishLesson(editing.id,id,on);var real=D.course(editing.id);editing.status=real.status;editing.updatedAt=real.updatedAt;editing.updatedBy=real.updatedBy;editing.lessons.forEach(function(x){var n=real.lessons.find(function(t){return t.id===x.id;});if(n){x.status=n.status;x.locked=n.locked;}});savedEditor=JSON.stringify(real);renderEditor();});}
      return refreshLesson(id);
    }
    if(a==='stats-tab'){if(statsTab===id)return;statsTab=id;filters={};pageNumber=1;render();host.querySelector('[data-lc="stats-tab"][data-id="'+id+'"]').focus({preventScroll:true});return;}if(a==='stats-detail')return openStudyDetail(id);if(a==='export')return exportStats();
    if(a==='logs')return view==='stats'?openStudyLog():openCourseLog();if(a==='reset'){filters={};pageNumber=1;return render();}if(a==='page'){pageNumber+=Number(id);return render();}
  }
  function finishLessonDrag(commit) {
    var state = lessonDrag; if (!state) return;
    lessonDrag = null; cancelAnimationFrame(dragFrame); dragFrame = null;
    if (state.ghost) state.ghost.remove(); if (state.marker) state.marker.remove();
    state.card.classList.remove('is-drag-source'); document.body.classList.remove('lc-is-dragging');
    if (state.handle.hasPointerCapture && state.handle.hasPointerCapture(state.pointerId)) state.handle.releasePointerCapture(state.pointerId);
    if (commit && state.started && state.valid && host) {
      var from = editing.lessons.findIndex(function (l) { return l.id === state.id; });
      var order = editing.lessons.filter(function (l) { return l.id !== state.id; });
      var to = state.before ? order.findIndex(function (l) { return l.id === state.before; }) : order.length;
      if (from >= 0 && to >= 0 && from !== to) { order.splice(to,0,editing.lessons[from]); editing.lessons = order; syncLessonOrder(); toast('顺序已调整，请点击“保存排序”'); }
    }
    if (state.handle.isConnected) state.handle.focus({preventScroll:true});
  }
  function updateLessonDropTarget() {
    var state = lessonDrag; if (!state || !state.started) return;
    var list = host.querySelector('.lc-edit-lessons'), bounds = list.getBoundingClientRect();
    var hit = document.elementFromPoint(state.x,state.y);
    state.valid = state.x >= bounds.left && state.x <= bounds.right && state.y >= bounds.top && state.y <= bounds.bottom && !!hit && list.contains(hit);
    state.marker.hidden = !state.valid;
    if (!state.valid) return;
    var cards = Array.from(list.querySelectorAll('[data-edit-lesson]')).filter(function (n) { return n.dataset.editLesson !== state.id; });
    if (!cards.length) { state.valid = false; state.marker.hidden = true; return; }
    var before = cards.find(function (n) { var r=n.getBoundingClientRect(); return state.y < r.top + r.height / 2; });
    state.before = before ? before.dataset.editLesson : null;
    var rect = (before || cards[cards.length-1]).getBoundingClientRect();
    state.marker.style.cssText = 'left:'+rect.left+'px;top:'+((before?rect.top:rect.bottom)-2)+'px;width:'+rect.width+'px';
  }
  function dragScrollFrame() {
    var state = lessonDrag; if (!state || !state.started) return;
    var scroll = state.scroller, rect = scroll === document.scrollingElement ? {top:0,bottom:innerHeight,left:0,right:innerWidth} : scroll.getBoundingClientRect();
    var delta = 0;
    if (state.x >= rect.left && state.x <= rect.right) {
      if (state.y < rect.top + 56 && state.y >= rect.top) delta = -Math.min(16,(rect.top+56-state.y)/3);
      else if (state.y > rect.bottom - 56 && state.y <= rect.bottom) delta = Math.min(16,(state.y-rect.bottom+56)/3);
    }
    if (delta) scroll.scrollTop += delta;
    updateLessonDropTarget(); dragFrame = requestAnimationFrame(dragScrollFrame);
  }
  function beginLessonDrag(ev) {
    var handle = ev.target.closest('[data-drag]');
    if (!handle || ev.button !== 0 || ev.isPrimary === false || view !== 'edit') return;
    finishLessonDrag(false);
    var card = handle.closest('[data-edit-lesson]'), rect = card.getBoundingClientRect(), scroll = card.parentElement;
    while (scroll && !(scroll.scrollHeight > scroll.clientHeight + 1 && /auto|scroll/.test(getComputedStyle(scroll).overflowY))) scroll = scroll.parentElement;
    lessonDrag = {handle:handle,card:card,id:handle.dataset.drag,pointerId:ev.pointerId,startX:ev.clientX,startY:ev.clientY,x:ev.clientX,y:ev.clientY,rect:rect,scroller:scroll||document.scrollingElement,started:false,valid:false};
    handle.focus({preventScroll:true}); handle.setPointerCapture(ev.pointerId); ev.preventDefault();
  }
  function moveLessonDrag(ev) {
    var state = lessonDrag; if (!state || ev.pointerId !== state.pointerId) return;
    state.x = ev.clientX; state.y = ev.clientY;
    if (!state.started && Math.hypot(state.x-state.startX,state.y-state.startY) < 6) return;
    if (!state.started) {
      state.started = true;
      var ghost = document.createElement('div'); ghost.className = 'gaip-learning-v11 gaip-page-form lc-course-lessons-editor lc-lesson-drag-layer'; ghost.setAttribute('aria-hidden','true'); ghost.inert = true;
      var clone = state.card.cloneNode(true); clone.removeAttribute('data-edit-lesson');
      clone.querySelectorAll('[id],[name]').forEach(function(n){n.removeAttribute('id');n.removeAttribute('name');});
      ghost.appendChild(clone); ghost.style.width = state.rect.width+'px'; document.body.appendChild(ghost); state.ghost = ghost;
      state.marker = document.createElement('div'); state.marker.className = 'lc-lesson-drop-marker'; state.marker.hidden = true; state.marker.setAttribute('aria-hidden','true'); document.body.appendChild(state.marker);
      state.card.classList.add('is-drag-source'); document.body.classList.add('lc-is-dragging'); dragFrame = requestAnimationFrame(dragScrollFrame);
    }
    state.ghost.style.transform = 'translate3d('+(state.rect.left+state.x-state.startX)+'px,'+(state.rect.top+state.y-state.startY)+'px,0)';
    updateLessonDropTarget(); ev.preventDefault();
  }
  function bind(el) {
    initializePreview();
    el.addEventListener('click',function(ev){var management=ev.target.closest('[data-learning-action]');if(management){var next=management.dataset.learningAction==='课程管理'?'manage':management.dataset.learningAction==='直播管理'?'live':'stats';return setView(next);}var b=ev.target.closest('[data-lc]');if(!b||b.disabled)return;attempt(function(){action(b.dataset.lc,b.dataset.id);});});
    el.addEventListener('keydown',function(ev){
      if(!ev.target.matches('.lc-stats-tab')||!['ArrowLeft','ArrowRight','Home','End'].includes(ev.key))return;
      ev.preventDefault();
      var next=ev.key==='Home'?'users':ev.key==='End'?'courses':statsTab==='users'?'courses':'users';
      attempt(function(){action('stats-tab',next);});
    });
    el.addEventListener('keydown',function(ev){if((ev.key==='Enter'||ev.key===' ')&&ev.target.matches('.lc-cover-picker,.lc-file-picker')){ev.preventDefault();ev.target.querySelector('input').click();return;}if((ev.key==='Enter'||ev.key===' ')&&ev.target.matches('article[data-lc]')){ev.preventDefault();attempt(function(){action(ev.target.dataset.lc,ev.target.dataset.id);});}});
    el.addEventListener('input',function(ev){var t=ev.target;if(editorFeedback && editorFeedback.container.contains(t))clearEditorFeedback();if(t.matches('[data-field]')){var obj=t.dataset.lesson?editing.lessons.find(function(l){return l.id===t.dataset.lesson;}):editing;obj[t.dataset.field]=t.value;var count=t.parentElement.querySelector('small');if(count&&t.maxLength>0)count.textContent=Array.from(t.value).length+' / '+t.maxLength;if(t.dataset.lesson&&t.dataset.field==='title'){t.closest('[data-edit-lesson]').querySelector('[data-lesson-heading]').textContent=t.value||'未命名课节';}}

      if(t.matches('[data-search]')){var pos=t.selectionStart;filters.q=t.value;pageNumber=1;render();var n=el.querySelector('[data-search]');n.focus();try{n.setSelectionRange(pos,pos);}catch(_){}}
      if(t.matches('[data-seek]')){attempt(function(){D.progress(session,Number(t.value),true);});updatePlayer();}
    });
    el.addEventListener('change',function(ev){var t=ev.target;
      if(t.matches('[data-course-boolean]')){editing[t.dataset.courseBoolean]=t.type==='checkbox'?t.checked:t.value==='true';if(editorFeedback&&editorFeedback.container.contains(t))clearEditorFeedback();return;}
      if(t.matches('[data-lesson-type]')){var lesson=editing.lessons.find(function(l){return l.id===t.dataset.lesson;});if(!lesson||lesson.locked||lesson.type===t.value)return;clearUploads(lesson.id,'content');lesson.type=t.value;lesson.file=null;refreshLesson(lesson.id);return;}
      if(t.matches('[data-filter]')){filters[t.dataset.filter]=t.type==='checkbox'?t.checked:t.value;pageNumber=1;return render();}
      if(t.matches('select[data-field]')){var obj=t.dataset.lesson?editing.lessons.find(function(l){return l.id===t.dataset.lesson;}):editing;obj[t.dataset.field]=['required','featured'].includes(t.dataset.field)?t.value==='true':t.value;if(t.dataset.field==='type')obj.file=null;return renderEditor();}
      if(t.matches('[data-group]')){var g=t.dataset.group;if(g==='all')editing.groups=t.checked?['all']:[];else {editing.groups=editing.groups.filter(function(x){return x!==g&&x!=='all';});if(t.checked)editing.groups.push(g);}return renderEditor();}
      if(t.matches('[data-upload]'))return upload(t);
    });
    el.addEventListener('pointerdown',beginLessonDrag);
    el.addEventListener('pointermove',moveLessonDrag);
    el.addEventListener('pointerup',function(ev){if(lessonDrag&&ev.pointerId===lessonDrag.pointerId)finishLessonDrag(true);});
    el.addEventListener('pointercancel',function(){finishLessonDrag(false);});
    el.addEventListener('lostpointercapture',function(){finishLessonDrag(false);});
    el.addEventListener('keydown',function(ev){if(ev.key==='Escape'&&lessonDrag){ev.preventDefault();finishLessonDrag(false);}});
  }
  window.addEventListener('blur',function(){finishLessonDrag(false);});
  window.addEventListener('beforeunload',function(ev){if(host&&view==='edit'&&(pendingUploads()||JSON.stringify(editing)!==savedEditor)){ev.preventDefault();ev.returnValue='';}});
  window.addEventListener('click', function(ev) {
    if (bypassNavigation || !host || view !== 'edit' || (!pendingUploads() && JSON.stringify(editing) === savedEditor)) return;
    var item = ev.target.closest && ev.target.closest('.ant-layout-sider li.ant-menu-item');
    if (!item) return;
    ev.preventDefault(); ev.stopImmediatePropagation();
    leaveEditor(function() { bypassNavigation = true; try { item.click(); } finally { bypassNavigation = false; } });
  }, true);
  window.addEventListener('gaip:learning-storage-error',function(){toast('浏览器存储已满或不可用：本次修改仅保留在当前会话，请不要刷新。');});
  window.__GAIP_LEARNING_APP__={
    mount:function(el){host=el;listHeader=el.querySelector('.gaip-learning-header').outerHTML;view='list';host.classList.add('gaip-learning-v11');bind(el);clearInterval(liveClock);if(window.__GAIP_LEARNING_LIVE_DATA__){attempt(function(){window.__GAIP_LEARNING_LIVE_DATA__.tick();});liveClock=setInterval(function(){try{window.__GAIP_LEARNING_LIVE_DATA__.tick();}catch(err){clearInterval(liveClock);toast(err.message);}},1000);}render();var previewId=new URLSearchParams(window.location.hash.split('?')[1]||'').get('gaip-preview');if(previewId){var c=D.course(previewId);if(D.admin('course')&&c&&c.status==='draft')openCourse(previewId);else toast('草稿不存在、已变更状态或当前身份无预览权限');}},
    destroy:function(){clearInterval(liveClock);if(liveCleanup){liveCleanup();liveCleanup=null;}if(window.__GAIP_LEARNING_LIVE__)window.__GAIP_LEARNING_LIVE__.close();clearUploads();pruneLocalFiles(true);clearEditorFeedback();stop(); finishLessonDrag(false);if(editorGroups){editorGroups.destroy();editorGroups=null;}if(filterBar){filterBar.destroy();filterBar=null;}if(manageTable){manageTable.destroy();manageTable=null;}D.closeAccess(courseAccess);courseAccess=null;document.querySelectorAll('[data-learning-dialog]').forEach(function(d){d.close();});host=null;session=null;syncBreadcrumb();},
    syncBreadcrumb:syncBreadcrumb,
    canLeave:function(){return !host||view!=='edit'||(!pendingUploads()&&JSON.stringify(editing)===savedEditor);},
    requestLeave:function(done){leaveEditor(done);},
    openConfirm:function(scene,lessonName){return confirmScene(scene || 'course-publish',null,null,lessonName);},
    openUnsaved:function(){return confirmScene('unsaved',function(){},function(){});},
    openCourseLog:openCourseLog,
    openStudyLog:openStudyLog,
    openStudyDetail:function(kind,id){kind=kind==='courses'?'courses':'users';var item=kind==='users'?D.scopeUsers()[0]:D.state().courses[0];return item?openStudyDetail(id||item.id,kind):null;},
    openDrawer:function(){var u=D.scopeUsers()[0];return u?openStudyDetail(u.id,'users'):null;}
  };
  /* @gaip-modal
  {"id":"learning-course-log","title":"课程管理操作日志","channel":"学习中心","type":"modal","category":"information","status":"ready","source":"window.__GAIP_LEARNING_APP__.openCourseLog()","invoke":{"path":"__GAIP_LEARNING_APP__.openCourseLog","args":[]},"styles":["shared/styles/global-modal.css","shared/styles/global-modal-position.css","shared/styles/global-modal-mask.css?v=20260910-backdrop-1","shared/styles/global-filter-bar.css?v=20260921-popup-search-1","shared/styles/global-table.css","features/learning-center/learning-v11.css?v=20260910-study-detail-modal-1"],"scripts":["shared/scripts/global-modal.js","shared/scripts/global-modal-position.js","shared/scripts/global-filter-bar.js?v=20260910-tree-combobox-1","shared/scripts/global-table.js?v=20260916-no-pagination-1","shared/scripts/organization-store.js","shared/scripts/organization-tree.js","features/learning-center/learning-data.js","features/learning-center/learning-app.js?v=20260917-live-gold-1"]}
  */
  /* @gaip-modal
  {"id":"learning-operation-confirm","title":"课程上架确认","channel":"学习中心","type":"confirm","category":"confirmation","status":"ready","source":"window.__GAIP_LEARNING_APP__.openConfirm(\"course-publish\")","invoke":{"path":"__GAIP_LEARNING_APP__.openConfirm","args":["course-publish"]},"styles":["shared/styles/global-font.css?v=20260909-project-font-1","shared/styles/global-modal.css?v=20260909-project-font-1","shared/styles/global-modal-position.css","shared/styles/global-modal-mask.css?v=20260910-backdrop-1"],"scripts":["shared/scripts/global-modal.js","shared/scripts/global-modal-position.js","shared/scripts/organization-store.js","shared/scripts/organization-tree.js","features/learning-center/learning-data.js","features/learning-center/learning-app.js?v=20260917-live-gold-1"]}
  */
  /* @gaip-modal
  {"id":"learning-unsaved-confirm","title":"学习中心未保存离开确认","channel":"学习中心","type":"confirm","category":"confirmation","status":"ready","after":"learning-operation-confirm","source":"window.__GAIP_LEARNING_APP__.openUnsaved()","invoke":{"path":"__GAIP_LEARNING_APP__.openUnsaved","args":[]},"styles":["shared/styles/global-font.css?v=20260909-project-font-1","shared/styles/global-modal.css?v=20260909-project-font-1","shared/styles/global-modal-position.css","shared/styles/global-modal-mask.css?v=20260910-backdrop-1"],"scripts":["shared/scripts/global-modal.js","shared/scripts/global-modal-position.js","shared/scripts/organization-store.js","shared/scripts/organization-tree.js","features/learning-center/learning-data.js","features/learning-center/learning-app.js?v=20260917-live-gold-1"]}
  */
  /* @gaip-modal
  {"id":"learning-course-offline-confirm","title":"课程下架确认","channel":"学习中心","type":"confirm","category":"confirmation","status":"ready","source":"window.__GAIP_LEARNING_APP__.openConfirm(\"course-offline\")","invoke":{"path":"__GAIP_LEARNING_APP__.openConfirm","args":["course-offline"]},"styles":["shared/styles/global-font.css?v=20260909-project-font-1","shared/styles/global-modal.css?v=20260909-project-font-1","shared/styles/global-modal-position.css","shared/styles/global-modal-mask.css?v=20260910-backdrop-1"],"scripts":["shared/scripts/global-modal.js","shared/scripts/global-modal-position.js","shared/scripts/organization-store.js","shared/scripts/organization-tree.js","features/learning-center/learning-data.js","features/learning-center/learning-app.js?v=20260917-live-gold-1"],"after":"learning-unsaved-confirm"}
  */
  /* @gaip-modal
  {"id":"learning-course-delete-confirm","title":"删除草稿课程确认","channel":"学习中心","type":"confirm","category":"confirmation","status":"ready","source":"window.__GAIP_LEARNING_APP__.openConfirm(\"course-delete\")","invoke":{"path":"__GAIP_LEARNING_APP__.openConfirm","args":["course-delete"]},"styles":["shared/styles/global-font.css?v=20260909-project-font-1","shared/styles/global-modal.css?v=20260909-project-font-1","shared/styles/global-modal-position.css","shared/styles/global-modal-mask.css?v=20260910-backdrop-1"],"scripts":["shared/scripts/global-modal.js","shared/scripts/global-modal-position.js","shared/scripts/organization-store.js","shared/scripts/organization-tree.js","features/learning-center/learning-data.js","features/learning-center/learning-app.js?v=20260917-live-gold-1"],"after":"learning-course-offline-confirm"}
  */
  /* @gaip-modal
  {"id":"learning-lesson-publish-confirm","title":"课节上架确认","channel":"学习中心","type":"confirm","category":"confirmation","status":"ready","source":"window.__GAIP_LEARNING_APP__.openConfirm(\"lesson-publish\")","invoke":{"path":"__GAIP_LEARNING_APP__.openConfirm","args":["lesson-publish"]},"styles":["shared/styles/global-font.css?v=20260909-project-font-1","shared/styles/global-modal.css?v=20260909-project-font-1","shared/styles/global-modal-position.css","shared/styles/global-modal-mask.css?v=20260910-backdrop-1"],"scripts":["shared/scripts/global-modal.js","shared/scripts/global-modal-position.js","shared/scripts/organization-store.js","shared/scripts/organization-tree.js","features/learning-center/learning-data.js","features/learning-center/learning-app.js?v=20260917-live-gold-1"],"after":"learning-course-delete-confirm"}
  */
  /* @gaip-modal
  {"id":"learning-lesson-offline-confirm","title":"课节下架确认","channel":"学习中心","type":"confirm","category":"confirmation","status":"ready","source":"window.__GAIP_LEARNING_APP__.openConfirm(\"lesson-offline\")","invoke":{"path":"__GAIP_LEARNING_APP__.openConfirm","args":["lesson-offline"]},"styles":["shared/styles/global-font.css?v=20260909-project-font-1","shared/styles/global-modal.css?v=20260909-project-font-1","shared/styles/global-modal-position.css","shared/styles/global-modal-mask.css?v=20260910-backdrop-1"],"scripts":["shared/scripts/global-modal.js","shared/scripts/global-modal-position.js","shared/scripts/organization-store.js","shared/scripts/organization-tree.js","features/learning-center/learning-data.js","features/learning-center/learning-app.js?v=20260917-live-gold-1"],"after":"learning-lesson-publish-confirm"}
  */
  /* @gaip-modal
  {"id":"learning-last-lesson-offline-confirm","title":"最后课节下架限制提示","channel":"学习中心","type":"confirm","category":"confirmation","status":"ready","source":"window.__GAIP_LEARNING_APP__.openConfirm(\"last-lesson-offline\")","invoke":{"path":"__GAIP_LEARNING_APP__.openConfirm","args":["last-lesson-offline"]},"styles":["shared/styles/global-font.css?v=20260909-project-font-1","shared/styles/global-modal.css?v=20260909-project-font-1","shared/styles/global-modal-position.css","shared/styles/global-modal-mask.css?v=20260910-backdrop-1"],"scripts":["shared/scripts/global-modal.js","shared/scripts/global-modal-position.js","shared/scripts/organization-store.js","shared/scripts/organization-tree.js","features/learning-center/learning-data.js","features/learning-center/learning-app.js?v=20260917-live-gold-1"],"after":"learning-lesson-offline-confirm"}
  */
  /* @gaip-modal
  {"id":"learning-lesson-delete-confirm","title":"删除课节确认","channel":"学习中心","type":"confirm","category":"confirmation","status":"ready","source":"window.__GAIP_LEARNING_APP__.openConfirm(\"lesson-delete\", \"示例课节\")","invoke":{"path":"__GAIP_LEARNING_APP__.openConfirm","args":["lesson-delete","示例课节"]},"styles":["shared/styles/global-font.css?v=20260909-project-font-1","shared/styles/global-modal.css?v=20260909-project-font-1","shared/styles/global-modal-position.css","shared/styles/global-modal-mask.css?v=20260910-backdrop-1"],"scripts":["shared/scripts/global-modal.js","shared/scripts/global-modal-position.js","shared/scripts/organization-store.js","shared/scripts/organization-tree.js","features/learning-center/learning-data.js","features/learning-center/learning-app.js?v=20260917-live-gold-1"],"after":"learning-last-lesson-offline-confirm"}
  */
  /* @gaip-modal
  {"id":"learning-study-log","title":"学情管理操作日志","channel":"学习中心","type":"modal","category":"information","status":"ready","source":"window.__GAIP_LEARNING_APP__.openStudyLog()","invoke":{"path":"__GAIP_LEARNING_APP__.openStudyLog","args":[]},"styles":["shared/styles/global-modal.css","shared/styles/global-modal-position.css","shared/styles/global-modal-mask.css?v=20260910-backdrop-1","shared/styles/global-filter-bar.css?v=20260921-popup-search-1","shared/styles/global-table.css","features/learning-center/learning-v11.css?v=20260910-study-detail-modal-1"],"scripts":["shared/scripts/global-modal.js","shared/scripts/global-modal-position.js","shared/scripts/global-filter-bar.js?v=20260910-tree-combobox-1","shared/scripts/global-table.js?v=20260916-no-pagination-1","shared/scripts/organization-store.js","shared/scripts/organization-tree.js","features/learning-center/learning-data.js","features/learning-center/learning-app.js?v=20260917-live-gold-1"],"after":"learning-lesson-delete-confirm"}
  */
  /* @gaip-modal
  {"id":"learning-study-detail","title":"学员学习详情","channel":"学习中心","type":"modal","category":"information","status":"ready","styles":["shared/styles/global-font.css","shared/styles/global-modal.css","shared/styles/global-modal-position.css","shared/styles/global-modal-mask.css?v=20260910-backdrop-1","shared/styles/global-multi-select.css","shared/styles/organization-tree.css","shared/styles/global-filter-bar.css?v=20260921-popup-search-1","shared/styles/global-table.css","features/learning-center/learning-v11.css?v=20260910-study-detail-modal-1"],"scripts":["shared/scripts/global-modal.js","shared/scripts/global-modal-position.js","shared/scripts/global-multi-select.js","shared/scripts/organization-store.js","shared/scripts/organization-tree.js","shared/scripts/global-filter-bar.js?v=20260910-tree-combobox-1","shared/scripts/global-table.js?v=20260916-no-pagination-1","features/learning-center/learning-data.js","features/learning-center/learning-app.js?v=20260917-live-gold-1"],"source":"window.__GAIP_LEARNING_APP__.openStudyDetail(\"users\")","invoke":{"path":"__GAIP_LEARNING_APP__.openStudyDetail","args":["users"]}}
  */
  /* @gaip-modal
  {"id":"learning-course-study-detail","title":"课程学习详情","channel":"学习中心","type":"modal","category":"information","status":"ready","styles":["shared/styles/global-font.css","shared/styles/global-modal.css","shared/styles/global-modal-position.css","shared/styles/global-modal-mask.css?v=20260910-backdrop-1","shared/styles/global-multi-select.css","shared/styles/organization-tree.css","shared/styles/global-filter-bar.css?v=20260921-popup-search-1","shared/styles/global-table.css","features/learning-center/learning-v11.css?v=20260910-study-detail-modal-1"],"scripts":["shared/scripts/global-modal.js","shared/scripts/global-modal-position.js","shared/scripts/global-multi-select.js","shared/scripts/organization-store.js","shared/scripts/organization-tree.js","shared/scripts/global-filter-bar.js?v=20260910-tree-combobox-1","shared/scripts/global-table.js?v=20260916-no-pagination-1","features/learning-center/learning-data.js","features/learning-center/learning-app.js?v=20260917-live-gold-1"],"source":"window.__GAIP_LEARNING_APP__.openStudyDetail(\"courses\")","invoke":{"path":"__GAIP_LEARNING_APP__.openStudyDetail","args":["courses"]}}
  */
})();
