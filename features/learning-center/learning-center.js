(function () {
  'use strict';

  var toastTimer = 0;
  var syncRafId = 0;
  var boundsRafId = 0;
  var originalBreadcrumbHtml = null;
  var originalTitle = '';
  var detailLastFocus = null;
  var playerLastFocus = null;
  var readerLastFocus = null;
  var activeCourseIndex = 0;
  var activeLessonIndex = 0;
  var lessonProgressState = loadLessonProgressState();

  function loadLessonProgressState() {
    try {
      return JSON.parse(window.localStorage.getItem('gaip-learning-lesson-progress') || '{}');
    } catch (error) {
      return {};
    }
  }

  function saveLessonProgressState() {
    try {
      window.localStorage.setItem('gaip-learning-lesson-progress', JSON.stringify(lessonProgressState));
    } catch (error) {
      /* 本地预览环境禁用存储时，仍保留当前页面会话中的进度。 */
    }
  }

  var courses = [
    {
      image: './assets/learning/course-01-arkos.jpg',
      title: '保险展业科技赋能',
      description: '面向一线展业顾问的科技工具全景课，覆盖 APP 基础操作、计划书制作与智能获客，帮助顾问提升服务体验。',
      tags: [['精选', 'gold'], ['必修课', 'orange'], ['学习中', 'green']]
    },
    {
      image: './assets/learning/course-02-pathway.jpg',
      title: '《综合整治非法跨境证券期货基金经营活动》',
      description: '面向一线展业顾问的合规与风险管理课程，快速掌握跨境业务展业边界及客户沟通要点。',
      tags: [['未学习', 'bronze']]
    },
    {
      image: './assets/learning/course-03-reckoning.jpg',
      title: '全球财富管理趋势洞察',
      description: '系统梳理全球财富管理新趋势、资产配置逻辑与重点市场变化，提升高净值客户服务的专业深度。',
      tags: [['学习中', 'green']]
    },
    {
      image: './assets/learning/course-04-ceo-luncheon.jpg',
      title: '企业家客户经营实战',
      description: '聚焦企业家客户的需求识别、关系经营与服务场景，以真实案例拆解高价值客户的长期陪伴方法。',
      tags: [['学习中', 'green']]
    },
    {
      image: './assets/learning/course-05-vessels.jpg',
      title: '客户需求洞察与沟通',
      description: '从感知、提问到方案表达，构建顾问式沟通框架，让每一次客户对话都更加真诚、清晰与有效。',
      tags: [['已学完', 'gray']]
    },
    {
      image: './assets/learning/course-06-wealth-camp.jpg',
      title: '以诺全球财富研习营',
      description: '围绕全球资产配置、跨境服务与家族传承展开系统研学，连接专业视野与一线客户服务实践。',
      tags: [['已学完', 'gray']]
    }
  ];

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getCourseProgressSummary(lessons) {
    var total = lessons.length;
    var completed = lessons.filter(function (lesson) {
      return lesson.progress >= 100;
    }).length;
    var progress = total
      ? Math.round(lessons.reduce(function (sum, lesson) {
        return sum + Math.max(0, Math.min(100, lesson.progress));
      }, 0) / total)
      : 0;
    return {
      total: total,
      completed: completed,
      progress: progress,
      status: progress === 100 ? '已完成' : (progress > 0 ? '学习中' : '未学习')
    };
  }

  function createCourseTagsMarkup(course, index) {
    var summary = getCourseProgressSummary(getCourseLessons(course, index));
    var statusColor = summary.status === '已完成'
      ? 'gray'
      : (summary.status === '学习中' ? 'green' : 'bronze');
    var contentTags = course.tags.filter(function (tag) {
      return tag[1] !== 'green' && tag[1] !== 'bronze' && tag[1] !== 'gray';
    });
    return contentTags.concat([[summary.status, statusColor]]).map(function (tag) {
      return '<span class="gaip-course-tag gaip-course-tag--' + tag[1] + '">' + escapeHtml(tag[0]) + '</span>';
    }).join('');
  }

  function createCourseMarkup(course, index) {
    var tags = createCourseTagsMarkup(course, index);

    return '<article class="gaip-course-card" role="link" tabindex="0" data-course-index="' + index + '" aria-label="查看课程详情：' + escapeHtml(course.title) + '">' +
      '<div class="gaip-course-cover">' +
        '<img class="gaip-course-image" src="' + escapeHtml(course.image) + '" alt="' + escapeHtml(course.title) + '课程封面">' +
      '</div>' +
      '<div class="gaip-course-body">' +
        '<h2 class="gaip-course-title" title="' + escapeHtml(course.title) + '">' + escapeHtml(course.title) + '</h2>' +
        '<p class="gaip-course-description">' + escapeHtml(course.description) + '</p>' +
        '<div class="gaip-course-footer">' +
          '<div class="gaip-course-tags">' + tags + '</div>' +
          '<button class="gaip-course-enter" type="button" aria-label="查看课程详情：' + escapeHtml(course.title) + '"></button>' +
        '</div>' +
      '</div>' +
    '</article>';
  }

  function createDetailMarkup() {
    return '<section class="gaip-course-detail-page" hidden aria-hidden="true" aria-labelledby="gaipCourseDetailTitle">' +
      '<header class="gaip-course-detail-header">' +
        '<button class="gaip-course-detail-back" type="button" data-course-detail-back><span class="gaip-course-detail-back-icon" aria-hidden="true"></span>返回学习中心</button>' +
      '</header>' +
      '<div class="gaip-course-detail-scroll">' +
        '<div class="gaip-course-detail-layout">' +
          '<aside class="gaip-course-detail-sidebar">' +
            '<div class="gaip-course-detail-visual">' +
              '<img class="gaip-course-detail-image" src="" alt="">' +
            '</div>' +
            '<div class="gaip-course-detail-content">' +
              '<h2 id="gaipCourseDetailTitle" class="gaip-course-detail-title" tabindex="-1"></h2>' +
              '<p class="gaip-course-detail-description"></p>' +
              '<div class="gaip-course-detail-tags"></div>' +
            '</div>' +
          '</aside>' +
          '<div class="gaip-course-detail-main">' +
            '<section class="gaip-course-detail-summary" aria-label="课程摘要">' +
              '<div class="gaip-course-detail-stats">' +
                '<div class="gaip-course-detail-stat"><strong class="gaip-course-detail-total"></strong><span>课节总数</span></div>' +
                '<div class="gaip-course-detail-stat"><strong class="gaip-course-detail-status"></strong><span>状态</span></div>' +
                '<div class="gaip-course-detail-stat"><strong class="gaip-course-detail-progress"></strong><span>总进度</span></div>' +
              '</div>' +
            '</section>' +
            '<section class="gaip-course-lessons" aria-labelledby="gaipCourseLessonsTitle">' +
              '<div class="gaip-course-lessons-heading">' +
                '<h3 id="gaipCourseLessonsTitle">全部课节</h3>' +
                '<span class="gaip-course-lessons-count"></span>' +
              '</div>' +
              '<div class="gaip-course-lesson-list"></div>' +
            '</section>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</section>';
  }

  function createPlayerMarkup() {
    return '<section class="gaip-course-player-page" hidden aria-hidden="true" aria-labelledby="gaipCoursePlayerTitle">' +
      '<header class="gaip-course-detail-header">' +
        '<button class="gaip-course-detail-back" type="button" data-course-player-back><span class="gaip-course-detail-back-icon" aria-hidden="true"></span>返回课程详情</button>' +
      '</header>' +
      '<div class="gaip-course-player-scroll">' +
        '<div class="gaip-course-player-shell">' +
          '<h2 id="gaipCoursePlayerTitle" class="gaip-visually-hidden" tabindex="-1"></h2>' +
          '<div class="gaip-course-player-stage">' +
            '<img class="gaip-course-player-poster" src="" alt="">' +
            '<button class="gaip-course-player-toggle" type="button" data-course-player-toggle aria-label="播放课程" aria-pressed="false"></button>' +
          '</div>' +
          '<section class="gaip-course-player-controls" aria-label="播放控制">' +
            '<h3 class="gaip-course-player-lesson-title"></h3>' +
            '<input class="gaip-course-player-progress" type="range" min="0" max="100" step="0.1" value="36.5" data-course-player-progress aria-label="播放进度" aria-valuetext="01:21 / 54:21">' +
            '<div class="gaip-course-player-meta">' +
              '<span><strong class="gaip-course-player-current-time">01:21</strong><em>/</em><span>54:21</span></span>' +
              '<span><strong class="gaip-course-player-learned">未学习</strong></span>' +
            '</div>' +
            '<div class="gaip-course-player-speed-row">' +
              '<span>播放速度</span>' +
              '<div class="gaip-course-player-speeds" aria-label="播放速度">' +
                '<button class="gaip-course-player-speed is-selected" type="button" data-course-player-speed="0.75" aria-pressed="true">0.75x</button>' +
                '<button class="gaip-course-player-speed" type="button" data-course-player-speed="1" aria-pressed="false">1x</button>' +
                '<button class="gaip-course-player-speed" type="button" data-course-player-speed="1.5" aria-pressed="false">1.5x</button>' +
                '<button class="gaip-course-player-speed" type="button" data-course-player-speed="2" aria-pressed="false">2x</button>' +
              '</div>' +
            '</div>' +
          '</section>' +
          '<nav class="gaip-course-player-lesson-nav" aria-label="课节切换">' +
            '<button type="button" data-course-player-prev><span class="gaip-course-player-nav-icon gaip-course-player-nav-icon--prev" aria-hidden="true"></span>上一节课</button>' +
            '<button type="button" data-course-player-next>下一节课<span class="gaip-course-player-nav-icon gaip-course-player-nav-icon--next" aria-hidden="true"></span></button>' +
          '</nav>' +
        '</div>' +
      '</div>' +
    '</section>';
  }

  function createReaderMarkup() {
    return '<section class="gaip-course-reader-page" hidden aria-hidden="true" aria-labelledby="gaipCourseReaderTitle">' +
      '<header class="gaip-course-detail-header">' +
        '<button class="gaip-course-detail-back" type="button" data-course-reader-back><span class="gaip-course-detail-back-icon" aria-hidden="true"></span>返回课程详情</button>' +
      '</header>' +
      '<div class="gaip-course-reader-scroll" data-course-reader-scroll>' +
        '<div class="gaip-course-reader-shell">' +
          '<header class="gaip-course-reader-heading">' +
            '<div>' +
              '<span class="gaip-course-reader-type">PDF 图文课节</span>' +
              '<h2 id="gaipCourseReaderTitle" class="gaip-course-reader-title" tabindex="-1"></h2>' +
            '</div>' +
          '</header>' +
          '<div class="gaip-course-reader-document">' +
            '<iframe class="gaip-course-reader-frame" src="" title="" loading="eager"></iframe>' +
          '</div>' +
          '<div class="gaip-course-reader-complete" data-course-reader-complete>' +
            '<span class="gaip-course-reader-complete-icon" aria-hidden="true"></span>' +
            '<strong>本课节已阅读完成</strong>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</section>';
  }

  function createLearningPage() {
    var page = document.createElement('section');
    page.className = 'gaip-learning-page pageContainer___learning';
    page.setAttribute('data-gaip-page-root', 'learning');
    page.innerHTML =
      '<div class="gaip-course-list-view">' +
        '<header class="gaip-learning-header">' +
          '<div>' +
            '<h1 class="gaip-learning-title">学习中心</h1>' +
            '<p class="gaip-learning-subtitle">精选行业优质课程，赋能展业技能升级，助力您为客户提供更专业的财富与保障服务</p>' +
          '</div>' +
          '<div class="gaip-learning-actions">' +
            '<button class="gaip-learning-action gaip-learning-action--progress" type="button" data-learning-action="学情管理">' +
              '<svg class="gaip-learning-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
                '<path d="M10.6 21H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v5.6"></path>' +
                '<path d="m14.305 19.53.923-.382"></path>' +
                '<path d="M15 3v7.6"></path>' +
                '<path d="m15.229 16.852-.924-.383"></path>' +
                '<path d="m16.852 15.228-.383-.923"></path>' +
                '<path d="m16.852 20.772-.383.924"></path>' +
                '<path d="m19.148 15.228.383-.923"></path>' +
                '<path d="m19.53 21.696-.382-.924"></path>' +
                '<path d="m20.773 16.852.922-.383"></path>' +
                '<path d="m20.773 19.148.922.383"></path>' +
                '<path d="M9 3v18"></path>' +
                '<circle cx="18" cy="18" r="3"></circle>' +
              '</svg>' +
              '<span>学情管理</span>' +
            '</button>' +
            '<button class="gaip-learning-action gaip-learning-action--course" type="button" data-learning-action="课程管理">' +
              '<svg class="gaip-learning-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
                '<path d="M12 17v4"></path>' +
                '<path d="m14.305 7.53.923-.382"></path>' +
                '<path d="m15.228 4.852-.923-.383"></path>' +
                '<path d="m16.852 3.228-.383-.924"></path>' +
                '<path d="m16.852 8.772-.383.923"></path>' +
                '<path d="m19.148 3.228.383-.924"></path>' +
                '<path d="m19.53 9.696-.382-.924"></path>' +
                '<path d="m20.772 4.852.924-.383"></path>' +
                '<path d="m20.772 7.148.924.383"></path>' +
                '<path d="M22 13v2a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h7"></path>' +
                '<path d="M8 21h8"></path>' +
                '<circle cx="18" cy="6" r="3"></circle>' +
              '</svg>' +
              '<span>课程管理</span>' +
            '</button>' +
          '</div>' +
        '</header>' +
        '<div class="gaip-learning-scroll">' +
          '<div class="gaip-learning-grid">' + courses.map(createCourseMarkup).join('') + '</div>' +
        '</div>' +
      '</div>' +
      createDetailMarkup() +
      createPlayerMarkup() +
      createReaderMarkup();
    return page;
  }

  function showToast(message) {
    var toast = document.querySelector('.gaip-learning-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'gaip-learning-toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove('is-visible');
    }, 1800);
  }

  function getCourseLessons(course, index) {
    var configuredStatus = course.tags.length
      ? course.tags[course.tags.length - 1][0]
      : '未学习';
    var standardProgress = configuredStatus === '已学完'
      ? [100, 100, 100]
      : (configuredStatus === '未学习' ? [0, 0, 0] : [45, 3, 0]);
    var lessons = index === 0
      ? [
        { title: 'APP 基础介绍', progress: 45, type: 'video', actions: ['下载/查看讲义', '播放'] },
        { title: '计划书的制作', progress: 3, type: 'video', actions: ['回看'] },
        { title: '智能获客工具', progress: 0, type: 'pdf', source: './assets/learning/lesson-reading-sample.pdf', actions: ['图文学习 >'] },
        { title: '账号注册与基础设置', progress: 100, type: 'video', actions: ['回看'] },
        { title: '客户画像配置指南', progress: 28, type: 'video', actions: ['播放'] },
        { title: '移动端展业操作', progress: 0, type: 'video', actions: ['播放'] },
        { title: '内容素材管理', progress: 0, type: 'video', actions: ['播放'] },
        { title: '智能客服应用', progress: 65, type: 'video', actions: ['播放'] },
        { title: '客户线索跟进', progress: 0, type: 'video', actions: ['播放'] },
        { title: '数据看板解读', progress: 0, type: 'video', actions: ['播放'] },
        { title: '移动展业合规要点', progress: 0, type: 'video', actions: ['播放'] },
        { title: '课程总结与工具清单', progress: 0, type: 'video', actions: ['播放'] }
      ]
      : [
        {
          title: '核心内容导读',
          progress: standardProgress[0],
          type: 'video',
          actions: ['下载/查看讲义', standardProgress[0] === 100 ? '回看' : '播放']
        },
        {
          title: '专业场景与案例',
          progress: standardProgress[1],
          type: 'video',
          actions: [standardProgress[1] > 0 ? '回看' : '播放']
        },
        {
          title: '实践工具与方法',
          progress: standardProgress[2],
          type: 'pdf',
          source: './assets/learning/lesson-reading-sample.pdf',
          actions: ['图文学习 >']
        }
      ];
    return lessons.map(function (lesson, lessonIndex) {
      var savedProgress = lessonProgressState[index + ':' + lessonIndex];
      if (typeof savedProgress === 'number') lesson.progress = savedProgress;
      return lesson;
    });
  }

  function createLessonMarkup(lesson, index) {
    var progressText = lesson.progress >= 100
      ? '已完成'
      : (lesson.progress > 0 ? '已学 ' + lesson.progress + '%' : '未学习');
    var actions = lesson.actions.map(function (action, actionIndex) {
      var className = actionIndex === lesson.actions.length - 1
        ? 'gaip-lesson-action gaip-lesson-action--primary'
        : 'gaip-lesson-action gaip-lesson-action--secondary';
      var icon = '';
      if (action === '回看') className += ' gaip-lesson-action--review';
      if (action.indexOf('图文学习') === 0) className += ' gaip-lesson-action--reading';
      if (action === '播放') icon = '<span class="gaip-lesson-action-icon gaip-lesson-action-icon--play" aria-hidden="true"></span>';
      if (action === '回看') icon = '<span class="gaip-lesson-action-icon gaip-lesson-action-icon--review" aria-hidden="true"></span>';
      return '<button class="' + className + '" type="button" data-lesson-action="' + escapeHtml(action) + '" data-lesson-index="' + index + '" data-lesson-title="' + escapeHtml(lesson.title) + '">' + icon + escapeHtml(action) + '</button>';
    }).join('');

    return '<article class="gaip-course-lesson" role="link" tabindex="0" data-course-lesson-index="' + index + '" data-course-lesson-type="' + escapeHtml(lesson.type) + '" aria-label="进入课节：' + escapeHtml(lesson.title) + '">' +
      '<div class="gaip-lesson-name"><span>' + String(index + 1).padStart(2, '0') + '</span><i></i><strong title="' + escapeHtml(lesson.title) + '">' + escapeHtml(lesson.title) + '</strong></div>' +
      '<div class="gaip-lesson-progress">' +
        '<span class="gaip-lesson-progress-label"><span class="gaip-lesson-progress-icon" aria-hidden="true"></span><span>' + progressText + '</span></span>' +
        '<span class="gaip-lesson-progress-track"><i style="width:' + lesson.progress + '%"></i></span>' +
      '</div>' +
      '<div class="gaip-lesson-actions">' + actions + '</div>' +
    '</article>';
  }

  function updateDetailBreadcrumb(title) {
    var controller = window.__GAIP_BREADCRUMB__;
    var breadcrumb = document.querySelector('.ant-breadcrumb');
    var back;
    if (controller) {
      controller.setDetail('learning', title, function () {
        var page = document.querySelector('.gaip-learning-page[data-gaip-learning-overlay="true"]');
        if (page) closeCourseDetail(page);
      });
      return;
    }
    if (!breadcrumb) return;
    breadcrumb.setAttribute('data-gaip-learning', 'true');
    breadcrumb.innerHTML =
      '<ol>' +
        '<li><span class="ant-breadcrumb-link">首页</span></li>' +
        '<li class="ant-breadcrumb-separator" aria-hidden="true">/</li>' +
        '<li><button class="gaip-course-breadcrumb-back" type="button">学习中心</button></li>' +
        '<li class="ant-breadcrumb-separator" aria-hidden="true">/</li>' +
        '<li><span class="ant-breadcrumb-link">' + escapeHtml(title) + '</span></li>' +
      '</ol>';
    back = breadcrumb.querySelector('.gaip-course-breadcrumb-back');
    if (back) {
      back.addEventListener('click', function () {
        var page = document.querySelector('.gaip-learning-page[data-gaip-learning-overlay="true"]');
        if (page) closeCourseDetail(page);
      });
    }
  }

  function renderCourseProgressSummary(detail, lessons) {
    var summary = getCourseProgressSummary(lessons);
    detail.querySelector('.gaip-course-detail-total').textContent = summary.total;
    detail.querySelector('.gaip-course-detail-status').textContent = summary.status;
    detail.querySelector('.gaip-course-detail-progress').textContent = summary.progress + '%';
    detail.querySelector('.gaip-course-lessons-count').textContent =
      summary.total + ' 个课节 · 已完成 ' + summary.completed + ' 个';
  }

  function refreshCourseCardTags(page, courseIndex) {
    var card = page.querySelector('.gaip-course-card[data-course-index="' + courseIndex + '"]');
    if (!card || !courses[courseIndex]) return;
    card.querySelector('.gaip-course-tags').innerHTML = createCourseTagsMarkup(courses[courseIndex], courseIndex);
  }

  function openCourseDetail(page, index) {
    var course = courses[index];
    var list = page.querySelector('.gaip-course-list-view');
    var detail = page.querySelector('.gaip-course-detail-page');
    var tags;
    var lessons;
    if (!course || !list || !detail) return;
    activeCourseIndex = index;

    tags = course.tags.filter(function (tag) {
      return tag[1] !== 'green' && tag[1] !== 'bronze' && tag[1] !== 'gray';
    }).map(function (tag) {
      return '<span class="gaip-course-tag gaip-course-tag--' + tag[1] + '">' + escapeHtml(tag[0]) + '</span>';
    }).join('');
    lessons = getCourseLessons(course, index);

    detailLastFocus = document.activeElement;
    detail.querySelector('.gaip-course-detail-image').src = course.image;
    detail.querySelector('.gaip-course-detail-image').alt = course.title + '课程封面';
    detail.querySelector('.gaip-course-detail-title').textContent = course.title;
    detail.querySelector('.gaip-course-detail-description').textContent = course.description + ' ' + course.description;
    detail.querySelector('.gaip-course-detail-tags').innerHTML = tags;
    renderCourseProgressSummary(detail, lessons);
    detail.querySelector('.gaip-course-lesson-list').innerHTML = lessons.map(createLessonMarkup).join('');
    list.hidden = true;
    detail.hidden = false;
    detail.setAttribute('aria-hidden', 'false');
    detail.querySelector('.gaip-course-detail-scroll').scrollTop = 0;
    updateDetailBreadcrumb(course.title);
    document.title = course.title + ' - 学习中心';
    detail.querySelector('.gaip-course-detail-back').focus();
  }

  function updateCoursePlayer(page) {
    var player = page.querySelector('.gaip-course-player-page');
    var course = courses[activeCourseIndex];
    var lessons = course ? getCourseLessons(course, activeCourseIndex) : [];
    var lesson = lessons[activeLessonIndex];
    var progress;
    var playbackPercent;
    var formattedTime;
    if (!player || !course || !lesson) return;
    player.querySelector('.gaip-course-player-poster').src = course.image;
    player.querySelector('.gaip-course-player-poster').alt = course.title + '课程视频占位画面';
    player.querySelector('#gaipCoursePlayerTitle').textContent = course.title + ' - ' + lesson.title;
    player.querySelector('.gaip-course-player-lesson-title').textContent = lesson.title;
    player.querySelector('.gaip-course-player-learned').textContent = lesson.progress >= 100
      ? '已完成'
      : (lesson.progress > 0 ? '已学 ' + lesson.progress + '%' : '未学习');
    playbackPercent = Math.max(0, Math.min(100, lesson.progress));
    formattedTime = formatPlayerTime(Math.round(3261 * playbackPercent / 100));
    player.querySelector('.gaip-course-player-current-time').textContent = formattedTime;
    progress = player.querySelector('[data-course-player-progress]');
    progress.value = String(playbackPercent);
    progress.style.setProperty('--gaip-player-progress', playbackPercent + '%');
    progress.setAttribute('aria-valuetext', formattedTime + ' / 54:21');
    player.querySelector('.gaip-course-player-toggle').classList.remove('is-playing');
    player.querySelector('.gaip-course-player-toggle').setAttribute('aria-pressed', 'false');
    player.querySelector('.gaip-course-player-toggle').setAttribute('aria-label', '播放课程');
    updatePlayerLessonNavigation(player, lessons);
  }

  function updatePlayerLessonNavigation(player, lessons) {
    var previous = player.querySelector('[data-course-player-prev]');
    var next = player.querySelector('[data-course-player-next]');
    var isFirst = activeLessonIndex <= 0;
    var isLast = activeLessonIndex >= lessons.length - 1;
    previous.disabled = isFirst;
    previous.setAttribute('aria-disabled', isFirst ? 'true' : 'false');
    next.disabled = isLast;
    next.setAttribute('aria-disabled', isLast ? 'true' : 'false');
  }

  function formatPlayerTime(seconds) {
    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = seconds % 60;
    return String(minutes).padStart(2, '0') + ':' + String(remainingSeconds).padStart(2, '0');
  }

  function updateFakePlayerProgress(progress) {
    var player = progress.closest('.gaip-course-player-page');
    var currentTime = player && player.querySelector('.gaip-course-player-current-time');
    var learnedProgress = player && player.querySelector('.gaip-course-player-learned');
    var course = courses[activeCourseIndex];
    var lessons = course ? getCourseLessons(course, activeCourseIndex) : [];
    var lesson = lessons[activeLessonIndex];
    var percent = Math.max(0, Math.min(100, Number(progress.value) || 0));
    var formattedTime = formatPlayerTime(Math.round(3261 * percent / 100));
    var completedPercent = lesson
      ? Math.max(lesson.progress, Math.round(percent))
      : Math.round(percent);
    progress.style.setProperty('--gaip-player-progress', percent + '%');
    progress.setAttribute('aria-valuetext', formattedTime + ' / 54:21');
    if (currentTime) currentTime.textContent = formattedTime;
    if (learnedProgress) {
      learnedProgress.textContent = completedPercent >= 100
        ? '已完成'
        : (completedPercent > 0 ? '已学 ' + completedPercent + '%' : '未学习');
    }
    lessonProgressState[activeCourseIndex + ':' + activeLessonIndex] = completedPercent;
    saveLessonProgressState();
  }

  function openLesson(page, lessonIndex) {
    var course = courses[activeCourseIndex];
    var lessons = course ? getCourseLessons(course, activeCourseIndex) : [];
    var lesson = lessons[lessonIndex];
    if (!lesson) return;
    if (lesson.type === 'pdf') {
      openCourseReader(page, lessonIndex);
      return;
    }
    openCoursePlayer(page, lessonIndex);
  }

  function openCoursePlayer(page, lessonIndex) {
    var detail = page.querySelector('.gaip-course-detail-page');
    var player = page.querySelector('.gaip-course-player-page');
    var course = courses[activeCourseIndex];
    if (!detail || !player || !course) return;
    activeLessonIndex = lessonIndex;
    playerLastFocus = document.activeElement;
    updateCoursePlayer(page);
    detail.hidden = true;
    detail.setAttribute('aria-hidden', 'true');
    player.hidden = false;
    player.setAttribute('aria-hidden', 'false');
    player.querySelector('.gaip-course-player-scroll').scrollTop = 0;
    document.title = getCourseLessons(course, activeCourseIndex)[activeLessonIndex].title + ' - ' + course.title;
    player.querySelector('[data-course-player-back]').focus();
  }

  function updateCourseReader(page) {
    var reader = page.querySelector('.gaip-course-reader-page');
    var course = courses[activeCourseIndex];
    var lessons = course ? getCourseLessons(course, activeCourseIndex) : [];
    var lesson = lessons[activeLessonIndex];
    var frame;
    if (!reader || !course || !lesson) return;
    frame = reader.querySelector('.gaip-course-reader-frame');
    reader.querySelector('.gaip-course-reader-title').textContent = lesson.title;
    reader.querySelector('[data-course-reader-complete]').classList.toggle('is-complete', lesson.progress === 100);
    frame.src = lesson.source + '#toolbar=0&navpanes=0&scrollbar=0&view=FitH';
    frame.title = lesson.title + ' PDF 课件';
  }

  function openCourseReader(page, lessonIndex) {
    var detail = page.querySelector('.gaip-course-detail-page');
    var reader = page.querySelector('.gaip-course-reader-page');
    var course = courses[activeCourseIndex];
    if (!detail || !reader || !course) return;
    activeLessonIndex = lessonIndex;
    readerLastFocus = document.activeElement;
    updateCourseReader(page);
    detail.hidden = true;
    detail.setAttribute('aria-hidden', 'true');
    reader.hidden = false;
    reader.setAttribute('aria-hidden', 'false');
    reader.querySelector('[data-course-reader-scroll]').scrollTop = 0;
    document.title = getCourseLessons(course, activeCourseIndex)[activeLessonIndex].title + ' - ' + course.title;
    reader.querySelector('[data-course-reader-back]').focus();
  }

  function refreshCourseLessonProgress(page) {
    var detail = page.querySelector('.gaip-course-detail-page');
    var course = courses[activeCourseIndex];
    var lessons = course ? getCourseLessons(course, activeCourseIndex) : [];
    if (!detail || !course) return;
    renderCourseProgressSummary(detail, lessons);
    detail.querySelector('.gaip-course-lesson-list').innerHTML = lessons.map(createLessonMarkup).join('');
    refreshCourseCardTags(page, activeCourseIndex);
  }

  function completeCourseReading(page) {
    var reader = page.querySelector('.gaip-course-reader-page');
    var progressKey = activeCourseIndex + ':' + activeLessonIndex;
    if (!reader || lessonProgressState[progressKey] === 100) return;
    lessonProgressState[progressKey] = 100;
    saveLessonProgressState();
    reader.querySelector('[data-course-reader-complete]').classList.add('is-complete');
    refreshCourseLessonProgress(page);
    showToast('已完成本课节，学习进度更新为 100%');
  }

  function updateCourseReaderProgress(page, readerScroll) {
    if (readerScroll.scrollTop + readerScroll.clientHeight >= readerScroll.scrollHeight - 24) {
      completeCourseReading(page);
    }
  }

  function closeCourseReader(page) {
    var detail = page.querySelector('.gaip-course-detail-page');
    var reader = page.querySelector('.gaip-course-reader-page');
    var course = courses[activeCourseIndex];
    if (!detail || !reader || reader.hidden) return;
    reader.hidden = true;
    reader.setAttribute('aria-hidden', 'true');
    detail.hidden = false;
    detail.setAttribute('aria-hidden', 'false');
    refreshCourseLessonProgress(page);
    document.title = (course ? course.title : '课程详情') + ' - 学习中心';
    if (readerLastFocus && readerLastFocus.isConnected) readerLastFocus.focus();
    readerLastFocus = null;
  }

  function closeCoursePlayer(page) {
    var detail = page.querySelector('.gaip-course-detail-page');
    var player = page.querySelector('.gaip-course-player-page');
    var course = courses[activeCourseIndex];
    if (!detail || !player || player.hidden) return;
    player.hidden = true;
    player.setAttribute('aria-hidden', 'true');
    detail.hidden = false;
    detail.setAttribute('aria-hidden', 'false');
    refreshCourseLessonProgress(page);
    document.title = (course ? course.title : '课程详情') + ' - 学习中心';
    if (playerLastFocus && playerLastFocus.isConnected) playerLastFocus.focus();
    playerLastFocus = null;
  }

  function changePlayerLesson(page, offset) {
    var course = courses[activeCourseIndex];
    var lessons = course ? getCourseLessons(course, activeCourseIndex) : [];
    var nextIndex = activeLessonIndex + offset;
    if (nextIndex < 0) {
      showToast('已经是第一节课程');
      return;
    }
    if (nextIndex >= lessons.length) {
      showToast('已经是最后一节课程');
      return;
    }
    activeLessonIndex = nextIndex;
    if (lessons[activeLessonIndex].type === 'pdf') {
      playerLastFocus = null;
      page.querySelector('.gaip-course-player-page').hidden = true;
      page.querySelector('.gaip-course-player-page').setAttribute('aria-hidden', 'true');
      openCourseReader(page, activeLessonIndex);
      return;
    }
    updateCoursePlayer(page);
    document.title = lessons[activeLessonIndex].title + ' - ' + course.title;
    showToast('已切换至《' + lessons[activeLessonIndex].title + '》');
  }

  function closeCourseDetail(page) {
    var list = page.querySelector('.gaip-course-list-view');
    var detail = page.querySelector('.gaip-course-detail-page');
    var player = page.querySelector('.gaip-course-player-page');
    var reader = page.querySelector('.gaip-course-reader-page');
    if ((!detail || detail.hidden) && (!player || player.hidden) && (!reader || reader.hidden)) return;
    if (detail) {
      detail.hidden = true;
      detail.setAttribute('aria-hidden', 'true');
    }
    if (player) {
      player.hidden = true;
      player.setAttribute('aria-hidden', 'true');
    }
    if (reader) {
      reader.hidden = true;
      reader.setAttribute('aria-hidden', 'true');
    }
    if (list) list.hidden = false;
    updateBreadcrumb(true);
    document.title = '学习中心 - GAIP 本地原样版';
    if (detailLastFocus && detailLastFocus.isConnected) detailLastFocus.focus();
    detailLastFocus = null;
    playerLastFocus = null;
    readerLastFocus = null;
  }

  function bindPageActions(page) {
    page.addEventListener('input', function (event) {
      var progress = event.target.closest('[data-course-player-progress]');
      if (progress) updateFakePlayerProgress(progress);
    });

    page.addEventListener('scroll', function (event) {
      var readerScroll = event.target.closest && event.target.closest('[data-course-reader-scroll]');
      if (readerScroll) updateCourseReaderProgress(page, readerScroll);
    }, true);

    page.addEventListener('click', function (event) {
      var action = event.target.closest('[data-learning-action]');
      var back = event.target.closest('[data-course-detail-back]');
      var playerBack = event.target.closest('[data-course-player-back]');
      var readerBack = event.target.closest('[data-course-reader-back]');
      var playerToggle = event.target.closest('[data-course-player-toggle]');
      var playerSpeed = event.target.closest('[data-course-player-speed]');
      var playerPrevious = event.target.closest('[data-course-player-prev]');
      var playerNext = event.target.closest('[data-course-player-next]');
      var lessonAction = event.target.closest('[data-lesson-action]');
      var lessonRow = event.target.closest('[data-course-lesson-index]');
      var card = event.target.closest('.gaip-course-card');
      if (action) {
        showToast(action.getAttribute('data-learning-action') + '功能正在建设中');
        return;
      }
      if (back) {
        closeCourseDetail(page);
        return;
      }
      if (playerBack) {
        closeCoursePlayer(page);
        return;
      }
      if (readerBack) {
        closeCourseReader(page);
        return;
      }
      if (playerToggle) {
        playerToggle.classList.toggle('is-playing');
        playerToggle.setAttribute('aria-pressed', playerToggle.classList.contains('is-playing') ? 'true' : 'false');
        playerToggle.setAttribute('aria-label', playerToggle.classList.contains('is-playing') ? '暂停课程' : '播放课程');
        showToast('当前为课程图片占位，暂未接入真实视频');
        return;
      }
      if (playerSpeed) {
        page.querySelectorAll('[data-course-player-speed]').forEach(function (button) {
          var selected = button === playerSpeed;
          button.classList.toggle('is-selected', selected);
          button.setAttribute('aria-pressed', selected ? 'true' : 'false');
        });
        showToast('播放速度已调整为 ' + playerSpeed.textContent);
        return;
      }
      if (playerPrevious) {
        changePlayerLesson(page, -1);
        return;
      }
      if (playerNext) {
        changePlayerLesson(page, 1);
        return;
      }
      if (lessonAction) {
        if (lessonAction.getAttribute('data-lesson-action') !== '下载/查看讲义') {
          openLesson(page, Number(lessonAction.getAttribute('data-lesson-index')));
          return;
        }
        showToast(lessonAction.getAttribute('data-lesson-action') + '：《' + lessonAction.getAttribute('data-lesson-title') + '》');
        return;
      }
      if (lessonRow) {
        openLesson(page, Number(lessonRow.getAttribute('data-course-lesson-index')));
        return;
      }
      if (card) openCourseDetail(page, Number(card.getAttribute('data-course-index')));
    });

    page.addEventListener('keydown', function (event) {
      var card = event.target.closest('.gaip-course-card');
      var lessonRow = event.target.closest('[data-course-lesson-index]');
      if (event.target.closest('button')) return;
      if (event.key === 'Enter' || event.key === ' ') {
        if (!card && !lessonRow) return;
        event.preventDefault();
        if (lessonRow) {
          openLesson(page, Number(lessonRow.getAttribute('data-course-lesson-index')));
          return;
        }
        openCourseDetail(page, Number(card.getAttribute('data-course-index')));
      }
    });
  }

  function currentBaseHash() {
    var hash = location.hash || '#/workspace';
    return hash.split('?')[0] || '#/workspace';
  }

  function learningRequested() {
    var hash = location.hash || '';
    var queryIndex = hash.indexOf('?');
    if (window.__GAIP_PAGE_OVERRIDE__ === 'learning') return true;
    if (queryIndex < 0) return false;
    return new URLSearchParams(hash.slice(queryIndex + 1)).get('gaip-channel') === 'learning';
  }

  function updateBreadcrumb(force) {
    var controller = window.__GAIP_BREADCRUMB__;
    var breadcrumb = document.querySelector('.ant-breadcrumb');
    if (controller) {
      controller.clearDetail('learning');
      controller.refresh();
      return;
    }
    if (!breadcrumb) return;
    if (originalBreadcrumbHtml === null) originalBreadcrumbHtml = breadcrumb.innerHTML;
    if (!force && breadcrumb.getAttribute('data-gaip-learning') === 'true') return;

    breadcrumb.setAttribute('data-gaip-learning', 'true');
    breadcrumb.innerHTML =
      '<ol>' +
        '<li><span class="ant-breadcrumb-link">首页</span></li>' +
        '<li class="ant-breadcrumb-separator" aria-hidden="true">/</li>' +
        '<li><span class="ant-breadcrumb-link">学习中心</span></li>' +
      '</ol>';
  }

  function restoreBreadcrumb() {
    var controller = window.__GAIP_BREADCRUMB__;
    var breadcrumb = document.querySelector('.ant-breadcrumb');
    if (controller) {
      controller.clearDetail('learning');
      controller.refresh();
      return;
    }
    if (!breadcrumb || originalBreadcrumbHtml === null) return;
    breadcrumb.innerHTML = originalBreadcrumbHtml;
    breadcrumb.removeAttribute('data-gaip-learning');
    originalBreadcrumbHtml = null;
  }

  function updateOverlayBounds() {
    var page = document.querySelector('.gaip-learning-page[data-gaip-learning-overlay="true"]');
    var header = document.querySelector('[class*="header___tcVAl"]');
    var sidebar = document.querySelector('.ant-layout-sider');
    var headerRect;
    var sidebarRect;
    var sidebarWidth;
    var pageWidth;
    boundsRafId = 0;
    if (!page || !header || !sidebar) return;

    headerRect = header.getBoundingClientRect();
    sidebarRect = sidebar.getBoundingClientRect();
    sidebarWidth = Math.max(0, Math.round(sidebarRect.width));
    pageWidth = Math.max(1440, window.innerWidth) - sidebarWidth;
    page.style.top = Math.max(0, Math.round(headerRect.height)) + 'px';
    page.style.left = sidebarWidth + 'px';
    page.style.width = pageWidth + 'px';
    page.style.height = Math.max(0, window.innerHeight - Math.round(headerRect.height)) + 'px';
    page.style.setProperty(
      '--gaip-learning-min-page-width',
      Math.max(0, 1440 - sidebarWidth) + 'px'
    );
  }

  function scheduleBoundsUpdate() {
    if (boundsRafId) return;
    boundsRafId = requestAnimationFrame(updateOverlayBounds);
  }

  function notifyLearningChange(open) {
    window.dispatchEvent(new CustomEvent('gaip:learning-change', {
      detail: { open: open }
    }));
    if (typeof window.__GAIP_APPLY_STRUCTURE_NAMES__ === 'function') {
      window.__GAIP_APPLY_STRUCTURE_NAMES__();
    }
  }

  function lockUnderlyingPageScroll() {
    if (document.documentElement.classList.contains('gaip-learning-scroll-lock')) return;
    document.documentElement.classList.add('gaip-learning-scroll-lock');
    window.scrollTo(window.scrollX, 0);
  }

  function unlockUnderlyingPageScroll() {
    document.documentElement.classList.remove('gaip-learning-scroll-lock');
  }

  function mountLearningCenter() {
    var header = document.querySelector('[class*="header___tcVAl"]');
    var sidebar = document.querySelector('.ant-layout-sider');
    var page = document.querySelector('.gaip-learning-page[data-gaip-learning-overlay="true"]');
    var detailOpen;
    if (!header || !sidebar) return false;

    if (!page) {
      page = createLearningPage();
      page.setAttribute('data-gaip-learning-overlay', 'true');
      document.body.appendChild(page);
      bindPageActions(page);
    }

    detailOpen = [
      '.gaip-course-detail-page',
      '.gaip-course-player-page',
      '.gaip-course-reader-page'
    ].some(function (selector) {
      var view = page.querySelector(selector);
      return view && !view.hidden;
    });

    if (!originalTitle) originalTitle = document.title;
    lockUnderlyingPageScroll();
    if (!detailOpen) updateBreadcrumb(true);
    scheduleBoundsUpdate();
    document.title = '学习中心 - GAIP 本地原样版';
    document.body.setAttribute('data-gaip-page', 'learning');
    document.body.setAttribute('data-gaip-page-label', '学习中心');
    notifyLearningChange(true);
    return true;
  }

  function unmountLearningCenter() {
    var page = document.querySelector('.gaip-learning-page[data-gaip-learning-overlay="true"]');
    var toast = document.querySelector('.gaip-learning-toast');
    if (page) page.remove();
    if (toast) toast.remove();

    unlockUnderlyingPageScroll();
    restoreBreadcrumb();
    if (originalTitle) {
      document.title = originalTitle;
      originalTitle = '';
    }
    if (document.body.getAttribute('data-gaip-page') === 'learning') {
      document.body.removeAttribute('data-gaip-page');
      document.body.removeAttribute('data-gaip-page-label');
    }
    notifyLearningChange(false);
  }

  function openFromNavigation() {
    var nextHash = currentBaseHash() + '?gaip-channel=learning';
    if (location.hash !== nextHash) {
      history.pushState({ gaipChannel: 'learning' }, '', location.pathname + location.search + nextHash);
    }
    mountLearningCenter();
  }

  function closeForNavigation(targetPath) {
    var baseHash = currentBaseHash();
    if (window.__GAIP_PAGE_OVERRIDE__ === 'learning') {
      window.__GAIP_PAGE_OVERRIDE__ = '';
    }
    if (targetPath && baseHash.replace(/^#/, '') === targetPath && location.hash !== baseHash) {
      history.replaceState(null, '', location.pathname + location.search + baseHash);
    }
    unmountLearningCenter();
  }

  function syncFromLocation() {
    syncRafId = 0;
    if (learningRequested()) {
      mountLearningCenter();
    } else {
      unmountLearningCenter();
    }
  }

  function scheduleSync() {
    if (syncRafId) return;
    syncRafId = requestAnimationFrame(syncFromLocation);
  }

  window.__GAIP_LEARNING_CENTER__ = {
    open: openFromNavigation,
    closeForNavigation: closeForNavigation,
    isOpen: function () {
      return !!document.querySelector('.gaip-learning-page[data-gaip-learning-overlay="true"]');
    },
    sync: scheduleSync
  };

  function start() {
    var root = document.getElementById('root');
    if (root) {
      new MutationObserver(function () {
        if (learningRequested()) scheduleSync();
        if (window.__GAIP_LEARNING_CENTER__.isOpen()) scheduleBoundsUpdate();
      }).observe(root, { childList: true, subtree: true });
    }

    window.addEventListener('resize', scheduleBoundsUpdate);
    window.addEventListener('popstate', scheduleSync);
    window.addEventListener('hashchange', scheduleSync);
    scheduleSync();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
