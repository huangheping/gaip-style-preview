(function () {
  'use strict';

  var mockAgentMessageId = 200;
  var mockAgentSessionId = 10003;
  var mockAgentAnswer = [
    '我已收到你的消息。下面是一份用于本地预览的模拟回复：',
    '',
    '### 客户需求概览',
    '',
    '- **家庭保障**：优先补齐医疗、重疾与寿险保障',
    '- **子女教育**：按教育阶段规划稳定的现金流',
    '- **财富传承**：结合家庭资产结构安排长期方案',
    '',
    '### 建议沟通路径',
    '',
    '1. 先确认家庭成员、收入与现有保障',
    '2. 再梳理近期目标和长期目标',
    '3. 最后对比方案，确定下一步跟进事项',
    '',
    '> 本内容为本地 Mock 数据，仅用于查看 GAIP Agent 助手原站对话样式。'
  ].join('\n');

  var mockAgentSessions = [
    {
      sessionId: 10001,
      title: '家庭保障方案规划',
      updatedDt: '2026-07-16 15:20:00',
      messages: [
        { id: 101, role: 'user', content: '请帮我规划一份家庭保障方案。' },
        {
          id: 102,
          role: 'assistant',
          content: '<reasoning name="梳理家庭保障需求">已分析家庭成员、收入情况与现有保障缺口。</reasoning>### 初步保障建议\n\n- 优先完善医疗险与重疾险\n- 家庭经济支柱补充定期寿险\n- 根据年度预算分阶段配置\n\n> 这是本地历史会话 Mock 数据。'
        }
      ]
    },
    {
      sessionId: 10002,
      title: '客户沟通话术建议',
      updatedDt: '2026-07-15 10:48:00',
      messages: [
        { id: 103, role: 'user', content: '客户担心保费压力，我应该怎么沟通？' },
        {
          id: 104,
          role: 'assistant',
          content: '<reasoning name="分析客户顾虑">客户的核心顾虑是现金流，而不是保障需求本身。</reasoning>可以先认可客户对现金流的重视，再从以下三点沟通：\n\n1. 明确可接受的年度预算\n2. 区分基础保障与升级保障\n3. 提供分阶段配置方案'
        }
      ]
    },
    {
      sessionId: 10003,
      title: '子女教育金测算',
      updatedDt: '2026-07-14 18:06:00',
      messages: [
        { id: 105, role: 'user', content: '想提前准备孩子的大学教育金。' },
        {
          id: 106,
          role: 'assistant',
          content: '<reasoning name="拆解教育目标">正在按照入学时间、目标金额和现有储备进行测算。</reasoning>### 教育金规划思路\n\n- 确认距离大学入学的年限\n- 估算学费及生活费总额\n- 扣除已有教育储备\n- 将剩余目标拆分为月度或年度投入'
        }
      ]
    }
  ];

  function parseRequestBody(body) {
    if (!body) return {};
    if (typeof body === 'object') return body;
    try { return JSON.parse(body); } catch (_) { return {}; }
  }

  function formatMockDate(date) {
    function pad(value) { return String(value).padStart(2, '0'); }
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) + ' ' +
      pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds());
  }

  function findMockAgentSession(sessionId) {
    var id = Number(sessionId);
    return mockAgentSessions.find(function (item) { return item.sessionId === id; });
  }

  function addMockAgentConversation(requestBody) {
    var requestedId = Number(requestBody.sessionId);
    var sessionId = requestedId > 0 ? requestedId : ++mockAgentSessionId;
    var message = String(requestBody.message || '本地模拟对话');
    var sessionItem = findMockAgentSession(sessionId);
    if (!sessionItem) {
      sessionItem = {
        sessionId: sessionId,
        title: message.replace(/\s+/g, ' ').trim() || '未命名对话',
        updatedDt: formatMockDate(new Date()),
        messages: []
      };
      mockAgentSessions.unshift(sessionItem);
    }
    sessionItem.updatedDt = formatMockDate(new Date());
    sessionItem.messages.push(
      { id: ++mockAgentMessageId, role: 'user', content: message },
      {
        id: ++mockAgentMessageId,
        role: 'assistant',
        content: '<reasoning name="推理中">正在理解你的需求并生成回答…</reasoning>' + mockAgentAnswer
      }
    );
    return sessionId;
  }

  function createAgentChatResponse(signal, sessionId) {
    var encoder = new TextEncoder();
    var events = [
      { payload: { type: 'meta', data: { sessionId: sessionId } }, wait: 80 },
      { payload: { type: 'answer_start', data: {} }, wait: 80 },
      { payload: { type: 'reasoning_start', data: { displayName: '推理中' } }, wait: 120 },
      { payload: { type: 'reasoning_delta', data: { content: '正在理解你的需求并生成回答…' } }, wait: 10000 },
      { payload: { type: 'reasoning_done', data: {} }, wait: 120 },
      { payload: { type: 'answer_chunk', data: '我已收到你的消息。下面是一份用于本地预览的模拟回复：\n\n' }, wait: 220 },
      { payload: { type: 'answer_chunk', data: '### 客户需求概览\n\n- **家庭保障**：优先补齐医疗、重疾与寿险保障\n- **子女教育**：按教育阶段规划稳定的现金流\n- **财富传承**：结合家庭资产结构安排长期方案\n\n' }, wait: 220 },
      { payload: { type: 'answer_chunk', data: '### 建议沟通路径\n\n1. 先确认家庭成员、收入与现有保障\n2. 再梳理近期目标和长期目标\n3. 最后对比方案，确定下一步跟进事项\n\n' }, wait: 220 },
      { payload: { type: 'answer_chunk', data: '> 本内容为本地 Mock 数据，仅用于查看 GAIP Agent 助手原站对话样式。' }, wait: 0 }
    ];
    var timer = null;
    var stream = new ReadableStream({
      start: function (controller) {
        var index = 0;
        function pushNext() {
          if (signal && signal.aborted) {
            try { controller.close(); } catch (_) {}
            return;
          }
          if (index < events.length) {
            var item = events[index++];
            controller.enqueue(encoder.encode('data: ' + JSON.stringify(item.payload) + '\n\n'));
            timer = setTimeout(pushNext, item.wait);
            return;
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        }
        pushNext();
      },
      cancel: function () {
        if (timer) clearTimeout(timer);
      }
    });
    return new Response(stream, {
      status: 200,
      headers: {
        'content-type': 'text/event-stream; charset=utf-8',
        'cache-control': 'no-cache'
      }
    });
  }

  function dataFor(url, request) {
    var value = String(url || '');
    var requestBody = parseRequestBody(request && request.body);
    if (value.indexOf('/api/gaip/agent/chat/session/list') >= 0) {
      var page = Math.max(1, Number(requestBody.curPage) || 1);
      var pageSize = Math.max(1, Number(requestBody.pageSize) || 20);
      var start = (page - 1) * pageSize;
      return {
        handled: true,
        data: {
          list: mockAgentSessions.slice(start, start + pageSize).map(function (item) {
            return { sessionId: item.sessionId, title: item.title, updatedDt: item.updatedDt };
          }),
          total: mockAgentSessions.length
        }
      };
    }
    if (value.indexOf('/api/gaip/agent/chat/session/rename') >= 0) {
      var renamedSession = findMockAgentSession(requestBody.sessionId);
      if (renamedSession && requestBody.title) {
        renamedSession.title = String(requestBody.title);
        renamedSession.updatedDt = formatMockDate(new Date());
      }
      return { handled: true, data: true };
    }
    var deleteMatch = value.match(/\/api\/gaip\/agent\/chat\/session\/delete\/(\d+)/);
    if (deleteMatch) {
      var deleteId = Number(deleteMatch[1]);
      mockAgentSessions = mockAgentSessions.filter(function (item) { return item.sessionId !== deleteId; });
      return { handled: true, data: true };
    }
    var sessionMatch = value.match(/\/api\/gaip\/agent\/chat\/session\/(\d+)(?:\?|$)/);
    if (sessionMatch) {
      var detail = findMockAgentSession(sessionMatch[1]);
      return {
        handled: true,
        data: detail ? {
          sessionId: detail.sessionId,
          title: detail.title,
          status: 'done',
          messages: detail.messages.slice()
        } : { sessionId: Number(sessionMatch[1]), status: 'done', messages: [] }
      };
    }
    return { handled: false };
  }

  function fetchAgent(url, options) {
    if (String(url || '').indexOf('/api/gaip/agent/chat/send') === -1) return null;
    window.__GAIP_PREVIEW_REQUESTS__ = window.__GAIP_PREVIEW_REQUESTS__ || [];
    window.__GAIP_PREVIEW_REQUESTS__.push(String(url || ''));
    var chatRequestBody = parseRequestBody(options && options.body);
    var sendContext = agentPendingSendContext;
    if (sendContext && sendContext.isNewSession) chatRequestBody.sessionId = 0;
    var chatSessionId = addMockAgentConversation(chatRequestBody);
    if (sendContext && sendContext.isNewSession) {
      window.setTimeout(function () {
        promoteNewAgentSession(sendContext, chatSessionId);
      }, 120);
    }
    agentPendingSendContext = null;
    return Promise.resolve(createAgentChatResponse(options && options.signal, chatSessionId));
  }

  var agentPlanSelectionState = {
    active: false,
    plan: null,
    client: null,
    proposals: [],
    clients: [],
    loaded: false
  };
  var agentSessionUiState = Object.create(null);
  var agentCurrentSessionKey = 'session:default';
  var agentTransientSessionIndex = 0;
  var agentPendingSendContext = null;
  var agentRedesignScheduled = false;
  var agentRedesignObserver = null;
  var agentDocumentClickBound = false;
  var agentLastMountedModal = null;
  var agentEmptySuggestions = [
    '帮李宁做一份兼顾子女教育和全球通行的身份规划方案',
    '查一款适合香港高净值客户、偏稳健、兼顾传承的保险产品'
  ];

  var planTypeLabelMap = {
    TRUST: '家族信托方案',
    PREMIUM_FINANCING: '保费融资测算方案',
    IDENTITY: '身份规划方案',
    GUARANTEE: '家庭保障方案',
    THREE_DEGREE: '三度需求分析方案'
  };

  function unwrapPreviewPayload(payload) {
    if (payload && payload.code && Object.prototype.hasOwnProperty.call(payload, 'data')) return payload.data;
    return payload || [];
  }

  function fetchPreviewJson(url, fallback) {
    if (!window.fetch) return Promise.resolve(fallback || []);
    return window.fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    }).then(function (response) {
      return response.json();
    }).then(function (payload) {
      return unwrapPreviewPayload(payload);
    }).catch(function () {
      return fallback || [];
    });
  }

  function formatPlanName(item) {
    var label = planTypeLabelMap[item.planType] || item.planType || '方案';
    if (item.clientName) return item.clientName + ' - ' + label;
    return label;
  }

  function normalizeProposalList(list) {
    return (Array.isArray(list) ? list : []).map(function (item, index) {
      return {
        id: item.id || ('plan-' + index),
        name: formatPlanName(item),
        typeLabel: planTypeLabelMap[item.planType] || item.planType || '方案',
        clientName: item.clientName || '',
        updatedDt: item.updatedDt || item.createdDt || '',
        score: item.scoreOverall || 0
      };
    });
  }

  function normalizeClientList(list) {
    return (Array.isArray(list) ? list : []).map(function (item, index) {
      return {
        id: item.clientId || item.clientCode || ('client-' + index),
        name: item.name || item.clientName || '未命名客户',
        code: item.clientCode || '',
        tier: item.clientTier || '',
        region: item.region || ''
      };
    }).filter(function (item) {
      return item.name && item.name !== '未命名客户';
    });
  }

  function loadAgentPlanData(callback) {
    if (agentPlanSelectionState.loaded) {
      callback();
      return;
    }
    Promise.all([
      fetchPreviewJson('/api/gaip/proposal/list', []),
      fetchPreviewJson('/api/gaip/client/list', [])
    ]).then(function (result) {
      agentPlanSelectionState.proposals = normalizeProposalList(result[0]);
      agentPlanSelectionState.clients = normalizeClientList(result[1]);
      agentPlanSelectionState.loaded = true;
      callback();
    });
  }

  function getHistorySessionKey(historyItem) {
    var sessionId = historyItem && historyItem.getAttribute('data-gaip-agent-session-id');
    var title = historyItem && historyItem.querySelector('.itemTitle___Rb48C');
    var time = historyItem && historyItem.querySelector('.itemTime___yUfy2');
    if (sessionId) return 'history-id:' + sessionId;
    if (!title) return '';
    return 'history:' + title.textContent.trim() + '|' + (time ? time.textContent.trim() : '');
  }

  function stripMockReasoning(content) {
    return String(content || '').replace(/<reasoning[^>]*>[\s\S]*?<\/reasoning>/g, '').trim();
  }

  function makeHistorySessionKey(sessionId, title, updatedDt) {
    if (sessionId) return 'history-id:' + sessionId;
    return 'history:' + String(title || '').trim() + '|' + String(updatedDt || '').trim();
  }

  function getHistoryListElement(modal) {
    return modal && (
      modal.querySelector('.historyWrapper___KBX5W .itemList___mZ9pU') ||
      modal.querySelector('.historyWrapper___KBX5W .listArea___SIvOY')
    );
  }

  function makeHistoryTitle(message) {
    var title = String(message || '').replace(/\s+/g, ' ').trim();
    if (!title) return '未命名对话';
    return title;
  }

  function markHistoryItemActive(modal, item) {
    Array.prototype.slice.call(modal.querySelectorAll('.historyWrapper___KBX5W .historyItem___pomxN')).forEach(function (node) {
      node.classList.remove('is-active');
      Array.prototype.slice.call(node.classList).forEach(function (className) {
        if (className.indexOf('historyItemActive___') === 0) node.classList.remove(className);
      });
      node.removeAttribute('aria-selected');
    });
    if (item) {
      item.classList.add('is-active');
      item.setAttribute('aria-selected', 'true');
    }
  }

  function renderHistoryMoreButton() {
    return '<button type="button" class="moreBtn___oyzcW" aria-label="更多操作">' +
      '<span role="img" aria-label="more" class="anticon anticon-more">' +
        '<svg viewBox="64 64 896 896" focusable="false" data-icon="more" width="1em" height="1em" fill="currentColor" aria-hidden="true">' +
          '<path d="M456 231a56 56 0 10112 0 56 56 0 10-112 0zm0 280a56 56 0 10112 0 56 56 0 10-112 0zm0 280a56 56 0 10112 0 56 56 0 10-112 0z"></path>' +
        '</svg>' +
      '</span>' +
    '</button>';
  }

  function upsertAgentHistoryItem(modal, sessionInfo) {
    var list = getHistoryListElement(modal);
    var existing;
    var item;
    if (!modal || !list || !sessionInfo) return null;
    existing = list.querySelector('[data-gaip-agent-session-id="' + String(sessionInfo.sessionId) + '"]');
    item = existing || document.createElement('div');
    item.className = 'historyItem___pomxN is-active';
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    item.setAttribute('aria-selected', 'true');
    item.setAttribute('data-gaip-agent-session-id', String(sessionInfo.sessionId));
    item.setAttribute('data-gaip-agent-synthetic', 'true');
    item.innerHTML =
      '<div class="itemContent___ZbN65">' +
        '<p class="itemTitle___Rb48C">' + escapeHtml(sessionInfo.title) + '</p>' +
        '<time class="itemTime___yUfy2" datetime="' + escapeHtml(sessionInfo.updatedDt) + '">' + escapeHtml(sessionInfo.updatedDt) + '</time>' +
      '</div>' +
      renderHistoryMoreButton();
    if (!existing) list.insertBefore(item, list.firstElementChild || null);
    else list.insertBefore(item, list.firstElementChild || null);
    markHistoryItemActive(modal, item);
    return item;
  }

  function renderSyntheticAgentSession(modal, sessionId) {
    var session = findMockAgentSession(sessionId);
    var chatPanel = modal && modal.querySelector('.chatPanel___qIDO_');
    var html;
    if (!chatPanel || !session) return;
    chatPanel.removeAttribute('data-gaip-empty-session');
    html = '<ul class="msgBox___NYtlO">' + session.messages.map(function (message) {
      if (message.role === 'user') {
        return '<li class="msgRow___wswRS msgUser___WR23E">' +
          '<div class="msgBubble___W9da6"><pre class="userPre___VegVA">' + escapeHtml(message.content) + '</pre></div>' +
        '</li>';
      }
      return '<li class="msgRow___wswRS msgAi___JN4kV">' +
        '<div class="msgBubble___W9da6 bubbleCard___dWNNS">' +
          '<div class="aiMessage___HDimS"><div class="aiContent___cP6kY">' + escapeHtml(stripMockReasoning(message.content)).replace(/\n/g, '<br>') + '</div></div>' +
        '</div>' +
      '</li>';
    }).join('') + '</ul>';
    chatPanel.innerHTML = html;
  }

  function closeSyntheticHistoryMenu() {
    var menu = document.querySelector('.gaip-agent-history-menu');
    if (menu) menu.remove();
  }

  function showSyntheticHistoryMenu(modal, historyItem, anchor) {
    var rect = anchor.getBoundingClientRect();
    var menu = document.createElement('div');
    closeSyntheticHistoryMenu();
    menu.className = 'gaip-agent-history-menu';
    menu.style.left = Math.round(rect.right - 116) + 'px';
    menu.style.top = Math.round(rect.bottom + 6) + 'px';
    menu.innerHTML =
      '<button type="button" data-action="rename">编辑名称</button>' +
      '<button type="button" data-action="delete">删除会话</button>';
    document.body.appendChild(menu);
    menu.onclick = function (event) {
      var action = event.target && event.target.getAttribute('data-action');
      var sessionId = Number(historyItem.getAttribute('data-gaip-agent-session-id'));
      var session = findMockAgentSession(sessionId);
      var titleNode = historyItem.querySelector('.itemTitle___Rb48C');
      var nextItem;
      event.preventDefault();
      event.stopPropagation();
      if (!action || !session) return;
      if (action === 'rename') {
        var nextTitle = window.prompt('请输入新的会话名称', session.title || '');
        if (nextTitle && nextTitle.trim()) {
          session.title = nextTitle.trim();
          session.updatedDt = formatMockDate(new Date());
          if (titleNode) titleNode.textContent = session.title;
          var timeNode = historyItem.querySelector('.itemTime___yUfy2');
          if (timeNode) {
            timeNode.textContent = session.updatedDt;
            timeNode.setAttribute('datetime', session.updatedDt);
          }
        }
      }
      if (action === 'delete') {
        if (window.confirm('确定删除该会话吗？')) {
          mockAgentSessions = mockAgentSessions.filter(function (item) { return item.sessionId !== sessionId; });
          nextItem = historyItem.nextElementSibling || historyItem.previousElementSibling;
          historyItem.remove();
          if (modal.getAttribute('data-gaip-agent-session-key') === makeHistorySessionKey(sessionId)) {
            if (nextItem && nextItem.classList.contains('historyItem___pomxN')) nextItem.click();
            else enterNewSession(modal);
          }
        }
      }
      closeSyntheticHistoryMenu();
    };
  }

  function promoteNewAgentSession(sendContext, sessionId) {
    var modal = document.querySelector('.agentModal___Nxp06');
    var sessionItem = findMockAgentSession(sessionId);
    var newKey;
    var oldState;
    var nextState;
    if (!modal || !sendContext || !sessionItem) return;
    newKey = makeHistorySessionKey(sessionItem.sessionId, sessionItem.title, sessionItem.updatedDt);
    oldState = agentSessionUiState[sendContext.key];
    nextState = oldState || getAgentSessionState(modal);
    nextState.empty = false;
    nextState.planPanelVisible = false;
    nextState.plan = null;
    nextState.client = null;
    nextState.draft = '';
    agentSessionUiState[newKey] = nextState;
    if (sendContext.key && sendContext.key !== newKey) delete agentSessionUiState[sendContext.key];
    agentCurrentSessionKey = newKey;
    modal.removeAttribute('data-gaip-agent-new-session');
    modal.setAttribute('data-gaip-agent-session-key', newKey);
    upsertAgentHistoryItem(modal, {
      sessionId: sessionItem.sessionId,
      title: sendContext.title || sessionItem.title,
      updatedDt: sessionItem.updatedDt
    });
    renderPlanPanel(modal);
    renderAgentInputTags(modal);
    updateSkillToggleState(modal);
  }

  function ensureInitialHistorySession(modal) {
    var firstItem;
    var key;
    var defaultState;
    var nextState;
    var textarea;
    if (!modal) return;
    if ((modal.getAttribute('data-gaip-agent-session-key') || modal.getAttribute('data-gaip-agent-new-session') === 'true') &&
        !modal.__gaipAgentAutoEmptySession) return;
    firstItem = modal.querySelector('.historyWrapper___KBX5W .historyItem___pomxN');
    key = getHistorySessionKey(firstItem);
    if (!key) return;
    modal.__gaipAgentAutoEmptySession = false;
    modal.removeAttribute('data-gaip-agent-new-session');
    defaultState = agentSessionUiState[agentCurrentSessionKey];
    modal.setAttribute('data-gaip-agent-session-key', key);
    agentCurrentSessionKey = key;
    nextState = getAgentSessionState(modal);
    textarea = modal.querySelector('textarea.textarea___GMXtD');
    if (defaultState && defaultState.draft && !nextState.draft) nextState.draft = defaultState.draft;
    if (textarea && textarea.value && !nextState.draft) nextState.draft = textarea.value;
    markHistoryItemActive(modal, firstItem);
    if (!modal.__gaipAgentInitialHistoryLoaded) {
      modal.__gaipAgentInitialHistoryLoaded = true;
      window.setTimeout(function () {
        var currentFirstItem = modal.querySelector('.historyWrapper___KBX5W .historyItem___pomxN');
        var chatPanel = modal.querySelector('.chatPanel___qIDO_');
        var hasMessage = chatPanel && chatPanel.textContent.trim();
        if (currentFirstItem && !hasMessage) currentFirstItem.click();
      }, 80);
    }
  }

  function ensureNoHistoryEmptyState(modal) {
    var historyWrapper = modal && modal.querySelector('.historyWrapper___KBX5W');
    var list = getHistoryListElement(modal);
    var hasHistory = historyWrapper && historyWrapper.querySelector('.historyItem___pomxN');
    if (!modal || modal.getAttribute('data-gaip-agent-new-session') === 'true' || hasHistory || !list) return;
    if (modal.__gaipAgentNoHistoryTimer) return;
    modal.__gaipAgentNoHistoryTimer = window.setTimeout(function () {
      modal.__gaipAgentNoHistoryTimer = null;
      if (!modal.querySelector('.historyWrapper___KBX5W .historyItem___pomxN') &&
          modal.getAttribute('data-gaip-agent-new-session') !== 'true') {
        enterNewSession(modal, true);
      }
    }, 500);
  }

  function scheduleAgentHistoryReadyCheck(modal) {
    var tries = 0;
    if (!modal || modal.__gaipAgentHistoryReadyTimer) return;
    modal.__gaipAgentHistoryReadyTimer = window.setInterval(function () {
      var firstItem = modal.querySelector('.historyWrapper___KBX5W .historyItem___pomxN');
      tries += 1;
      ensureAgentSidebar(modal);
      if (firstItem) {
        ensureInitialHistorySession(modal);
        if (tries >= 8) {
          window.clearInterval(modal.__gaipAgentHistoryReadyTimer);
          modal.__gaipAgentHistoryReadyTimer = null;
        }
        return;
      }
      if (tries >= 8) {
        window.clearInterval(modal.__gaipAgentHistoryReadyTimer);
        modal.__gaipAgentHistoryReadyTimer = null;
        ensureNoHistoryEmptyState(modal);
      }
    }, 180);
  }

  function getAgentSessionKey(modal) {
    var activeItem = modal && modal.querySelector('.historyWrapper___KBX5W .historyItem___pomxN[aria-selected="true"], .historyWrapper___KBX5W .historyItem___pomxN.active, .historyWrapper___KBX5W .historyItem___pomxN.is-active');
    var activeTitle = activeItem && activeItem.querySelector('.itemTitle___Rb48C');
    var activeTime = activeItem && activeItem.querySelector('.itemTime___yUfy2');
    var textarea = modal && modal.querySelector('textarea.textarea___GMXtD');
    if (modal && modal.getAttribute('data-gaip-agent-session-key')) return modal.getAttribute('data-gaip-agent-session-key');
    if (activeTitle) {
      return 'history:' + activeTitle.textContent.trim() + '|' + (activeTime ? activeTime.textContent.trim() : '');
    }
    if (textarea && textarea.value.trim()) return agentCurrentSessionKey;
    return agentCurrentSessionKey;
  }

  function getAgentSessionState(modal) {
    var key = getAgentSessionKey(modal);
    agentCurrentSessionKey = key;
    if (!agentSessionUiState[key]) {
      agentSessionUiState[key] = {
        planPanelVisible: false,
        plan: null,
        client: null,
        empty: false,
        draft: ''
      };
    }
    return agentSessionUiState[key];
  }

  function setNativeTextareaValue(textarea, value) {
    var setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value');
    if (setter && setter.set) setter.set.call(textarea, value);
    else textarea.value = value;
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function selectedPromptText(state) {
    var plan = state && state.plan;
    var client = state && state.client;
    if (!plan) return '';
    if (client) return '请为客户「' + client.name + '」生成「' + plan.typeLabel + '」，并结合当前对话上下文给出方案重点。';
    return '请生成「' + plan.typeLabel + '」，并结合当前对话上下文给出方案重点。';
  }

  function persistAgentDraft(modal) {
    var textarea = modal && modal.querySelector('textarea.textarea___GMXtD');
    var state;
    if (!textarea) return;
    state = getAgentSessionState(modal);
    state.draft = textarea.value || '';
  }

  function restoreAgentDraft(modal) {
    var textarea = modal && modal.querySelector('textarea.textarea___GMXtD');
    var state = getAgentSessionState(modal);
    var draft = typeof state.draft === 'string' ? state.draft : selectedPromptText(state);
    renderAgentInputTags(modal);
    if (!textarea) return;
    setNativeTextareaValue(textarea, draft || '');
  }

  function renderAgentInputTags(modal) {
    var container = modal.querySelector('.container___jv7uB');
    var state = getAgentSessionState(modal);
    var plan = state.plan;
    var currentTag;
    if (!container) return;
    currentTag = container.querySelector('.gaip-agent-plan-tag[data-tag="plan"]');
    Array.prototype.slice.call(container.querySelectorAll('.gaip-agent-plan-tag:not([data-tag="plan"])')).forEach(function (oldTag) {
      oldTag.remove();
    });
    if (!plan) {
      if (currentTag) currentTag.remove();
      return;
    }
    if (currentTag && String(currentTag.getAttribute('data-plan-id')) === String(plan.id)) {
      if (!currentTag.__gaipAgentPlanTagBound) {
        currentTag.__gaipAgentPlanTagBound = true;
        currentTag.querySelector('[data-clear="plan"]').onclick = function (event) {
          event.preventDefault();
          event.stopPropagation();
          getAgentSessionState(modal).plan = null;
          getAgentSessionState(modal).client = null;
          renderPlanPanel(modal);
          syncAgentInput(modal);
        };
      }
      return;
    }
    if (currentTag) currentTag.remove();
    if (plan) {
      container.insertAdjacentHTML('beforeend',
        '<span class="tag___PKl7Z skillTag___g4XXW gaip-agent-plan-tag" data-tag="plan" data-plan-id="' + escapeHtml(plan.id) + '">' +
          '<span class="icon___uCSIV" aria-hidden="true">◇</span>' +
          '<span class="text___u9Ggi">' + escapeHtml(plan.typeLabel) + '</span>' +
          '<span role="button" tabindex="0" class="close___ZupBD" data-clear="plan" aria-label="清除方案">' +
            '<svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" focusable="false">' +
              '<path d="M3.1 2.4 6 5.3l2.9-2.9.7.7L6.7 6l2.9 2.9-.7.7L6 6.7 3.1 9.6l-.7-.7L5.3 6 2.4 3.1z" fill="currentColor"></path>' +
            '</svg>' +
          '</span>' +
        '</span>');
    }
    Array.prototype.slice.call(container.querySelectorAll('[data-clear]')).forEach(function (clearButton) {
      clearButton.onclick = function (event) {
        event.preventDefault();
        event.stopPropagation();
        var state = getAgentSessionState(modal);
        if (clearButton.getAttribute('data-clear') === 'plan') {
          state.plan = null;
          state.client = null;
        }
        renderPlanPanel(modal);
        syncAgentInput(modal);
      };
    });
  }

  function syncAgentInput(modal) {
    var textarea = modal.querySelector('textarea.textarea___GMXtD');
    var state = getAgentSessionState(modal);
    var text = selectedPromptText(state);
    state.draft = text;
    renderAgentInputTags(modal);
    if (!textarea) return;
    setNativeTextareaValue(textarea, text);
  }

  function updateSkillToggleState(modal) {
    var state = getAgentSessionState(modal);
    var skillToggle = modal && modal.querySelector('.skillToggle___OpRvz');
    if (!skillToggle) return;
    skillToggle.classList.toggle('gaip-agent-skill-active', !!state.planPanelVisible);
    skillToggle.setAttribute('aria-pressed', state.planPanelVisible ? 'true' : 'false');
  }

  function renderPlanPanel(modal) {
    var contentArea = modal.querySelector('#agentModalContentArea');
    var chatPanel = modal.querySelector('.chatPanel___qIDO_');
    var messageList = chatPanel && (chatPanel.querySelector('.msgBox___NYtlO') || chatPanel);
    var sentinel = messageList && messageList.querySelector('.sentinel___SbISb');
    var panel = contentArea && contentArea.querySelector('.gaip-agent-plan-panel');
    var state = getAgentSessionState(modal);
    var plan = state.plan;
    var client = state.client;
    if (!contentArea || !chatPanel || !messageList) return;
    if (!state.planPanelVisible) {
      if (panel) panel.remove();
      if (state.empty) chatPanel.setAttribute('data-gaip-empty-session', 'true');
      renderEmptyState(modal);
      updateSkillToggleState(modal);
      return;
    }
    chatPanel.removeAttribute('data-gaip-empty-session');
    renderEmptyState(modal);
    if (panel && panel.parentNode !== messageList) {
      panel.remove();
      panel = null;
    }
    if (!panel) {
      panel = document.createElement(messageList.tagName === 'UL' || messageList.tagName === 'OL' ? 'li' : 'section');
      panel.className = 'gaip-agent-plan-panel';
      messageList.insertBefore(panel, sentinel || null);
    } else if (sentinel && panel.nextSibling !== sentinel) {
      messageList.insertBefore(panel, sentinel);
    } else if (!sentinel && panel !== messageList.lastElementChild) {
      messageList.appendChild(panel);
    }
    panel.innerHTML =
      '<div class="gaip-agent-plan-hero">' +
        '<h2># 请选择要创建的方案</h2>' +
      '</div>' +
      '<div class="gaip-agent-plan-body">' +
        '<div class="gaip-agent-plan-main">' +
          '<div class="gaip-agent-field-head">方案数量（' + agentPlanSelectionState.proposals.length + '）</div>' +
          '<div class="gaip-agent-option-list gaip-agent-option-list-plan">' +
            (agentPlanSelectionState.proposals.length ? agentPlanSelectionState.proposals.map(function (item) {
              return '<button type="button" class="gaip-agent-option' + (plan && String(plan.id) === String(item.id) ? ' is-selected' : '') + '" data-plan-id="' + escapeHtml(item.id) + '">' +
                '<span class="gaip-agent-radio" aria-hidden="true"></span>' +
                '<span class="gaip-agent-option-text">' + escapeHtml(item.name) + '</span>' +
              '</button>';
            }).join('') : '<div class="gaip-agent-empty">暂无可选方案</div>') +
          '</div>' +
        '</div>' +
        '<aside class="gaip-agent-client-main' + (!plan ? ' is-disabled' : '') + '">' +
          '<div class="gaip-agent-field-head">' + (plan ? '关联客户（' + agentPlanSelectionState.clients.length + '）' : '请先选择方案') + '</div>' +
          '<div class="gaip-agent-option-list gaip-agent-option-list-client">' +
            (agentPlanSelectionState.clients.length ? agentPlanSelectionState.clients.map(function (item) {
              return '<button type="button" class="gaip-agent-client-option' + (client && String(client.id) === String(item.id) ? ' is-selected' : '') + '" data-client-id="' + escapeHtml(item.id) + '"' + (!plan ? ' disabled aria-disabled="true"' : '') + '>' +
                '<span class="gaip-agent-client-name">' + escapeHtml(item.name) + '</span>' +
                '<span class="gaip-agent-client-code">' + escapeHtml(item.code || item.region || '') + '</span>' +
              '</button>';
            }).join('') : '<div class="gaip-agent-empty gaip-agent-empty-client">暂无客户</div>') +
          '</div>' +
          '<div class="gaip-agent-new-client-row">没有找到？ <button type="button" class="gaip-agent-new-client">新建客户</button></div>' +
        '</aside>' +
      '</div>';
    var newClientButton = panel.querySelector('.gaip-agent-new-client');
    Array.prototype.slice.call(panel.querySelectorAll('[data-plan-id]')).forEach(function (button) {
      button.onclick = function (event) {
        event.preventDefault();
        event.stopPropagation();
        getAgentSessionState(modal).plan = agentPlanSelectionState.proposals.find(function (item) {
          return String(item.id) === String(button.getAttribute('data-plan-id'));
        }) || null;
        renderPlanPanel(modal);
        syncAgentInput(modal);
      };
    });
    Array.prototype.slice.call(panel.querySelectorAll('[data-client-id]')).forEach(function (button) {
      button.onclick = function (event) {
        var state = getAgentSessionState(modal);
        var selectedClient = agentPlanSelectionState.clients.find(function (item) {
          return String(item.id) === String(button.getAttribute('data-client-id'));
        }) || null;
        event.preventDefault();
        event.stopPropagation();
        if (!state.plan) return;
        state.client = state.client && selectedClient && String(state.client.id) === String(selectedClient.id) ? null : selectedClient;
        renderPlanPanel(modal);
        syncAgentInput(modal);
      };
    });
    if (newClientButton) {
      newClientButton.onclick = function (event) {
        event.preventDefault();
        event.stopPropagation();
        triggerWorkspaceNewCustomer();
      };
    }
    updateSkillToggleState(modal);
  }

  function removeEmptyState(modal) {
    var empty = modal && modal.querySelector('.gaip-agent-empty-session');
    var contentArea = modal && modal.querySelector('#agentModalContentArea');
    if (contentArea) contentArea.removeAttribute('data-gaip-agent-empty');
    if (empty) empty.remove();
  }

  function renderEmptyState(modal) {
    var contentArea = modal.querySelector('#agentModalContentArea');
    var chatPanel = modal.querySelector('.chatPanel___qIDO_');
    var state = getAgentSessionState(modal);
    var empty = contentArea && contentArea.querySelector('.gaip-agent-empty-session');
    if (!contentArea || !chatPanel) return;
    if (!state.empty) {
      removeEmptyState(modal);
      return;
    }
    if (state.planPanelVisible) {
      contentArea.removeAttribute('data-gaip-agent-empty');
      if (empty) empty.style.display = 'none';
      return;
    }
    contentArea.setAttribute('data-gaip-agent-empty', 'true');
    if (!empty) {
      empty = document.createElement('section');
      empty.className = 'gaip-agent-empty-session';
      contentArea.insertBefore(empty, chatPanel);
    } else if (empty.getAttribute('data-gaip-rendered') === 'true') {
      empty.style.display = '';
      return;
    }
    empty.style.display = '';
    empty.setAttribute('data-gaip-rendered', 'true');
    empty.innerHTML =
      '<img class="gaip-agent-empty-title" src="./AI Agent/素材/你可以这样问.svg" alt="你可以这样问">' +
      '<div class="gaip-agent-suggestion-list">' +
        agentEmptySuggestions.map(function (text) {
          return '<button type="button" class="gaip-agent-suggestion" data-suggestion="' + escapeHtml(text) + '">' +
            '<img class="gaip-agent-suggestion-icon" src="./AI Agent/素材/跳出Icon.svg" alt="" aria-hidden="true">' +
            '<span>' + escapeHtml(text) + '</span>' +
          '</button>';
        }).join('') +
      '</div>';
    Array.prototype.slice.call(empty.querySelectorAll('[data-suggestion]')).forEach(function (button) {
      button.onclick = function (event) {
        var value = button.getAttribute('data-suggestion') || '';
        var state = getAgentSessionState(modal);
        event.preventDefault();
        event.stopPropagation();
        var textarea = modal.querySelector('textarea.textarea___GMXtD');
        state.draft = value;
        if (textarea) setNativeTextareaValue(textarea, value);
      };
    });
  }

  function enterNewSession(modal, autoEmpty) {
    var key = 'new:' + (++agentTransientSessionIndex);
    var textarea = modal.querySelector('textarea.textarea___GMXtD');
    var nativeNewChat = modal.querySelector('.newChatIcon___cOc4u');
    persistAgentDraft(modal);
    if (nativeNewChat) nativeNewChat.click();
    modal.__gaipAgentAutoEmptySession = !!autoEmpty;
    modal.setAttribute('data-gaip-agent-new-session', 'true');
    modal.setAttribute('data-gaip-agent-session-key', key);
    agentCurrentSessionKey = key;
    markHistoryItemActive(modal, null);
    agentSessionUiState[key] = {
      planPanelVisible: false,
      plan: null,
      client: null,
      empty: true,
      draft: ''
    };
    if (textarea) setNativeTextareaValue(textarea, '');
    var chatPanel = modal.querySelector('.chatPanel___qIDO_');
    if (chatPanel) {
      Array.prototype.slice.call(chatPanel.querySelectorAll('.gaip-agent-plan-panel')).forEach(function (node) {
        node.remove();
      });
    }
    Array.prototype.slice.call(modal.querySelectorAll('.container___jv7uB .gaip-agent-plan-tag')).forEach(function (node) {
      node.remove();
    });
    if (chatPanel) chatPanel.setAttribute('data-gaip-empty-session', 'true');
    renderPlanPanel(modal);
    renderEmptyState(modal);
  }

  function switchAgentHistorySession(modal, historyItem) {
    var key;
    if (!modal || !historyItem) return;
    persistAgentDraft(modal);
    key = getHistorySessionKey(historyItem);
    if (!key) return;
    window.__GAIP_AGENT_SWITCHING_HISTORY__ = true;
    modal.removeAttribute('data-gaip-agent-new-session');
    modal.setAttribute('data-gaip-agent-session-key', key);
    agentCurrentSessionKey = key;
    markHistoryItemActive(modal, historyItem);
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        var chatPanel = modal.querySelector('.chatPanel___qIDO_');
        if (chatPanel) chatPanel.removeAttribute('data-gaip-empty-session');
        removeEmptyState(modal);
        renderPlanPanel(modal);
      });
    });
    window.setTimeout(function () {
      if (modal.getAttribute('data-gaip-agent-session-key') === key) restoreAgentDraft(modal);
      if (modal.getAttribute('data-gaip-agent-session-key') === key) markHistoryItemActive(modal, historyItem);
      window.__GAIP_AGENT_SWITCHING_HISTORY__ = false;
    }, 180);
  }

  function leaveEmptySession(modal) {
    var state = getAgentSessionState(modal);
    if (!state.empty) return;
    state.empty = false;
    modal.removeAttribute('data-gaip-agent-new-session');
    var chatPanel = modal.querySelector('.chatPanel___qIDO_');
    if (chatPanel) chatPanel.removeAttribute('data-gaip-empty-session');
    removeEmptyState(modal);
  }

  function handleAgentSendClick(modal) {
    var textarea = modal.querySelector('textarea.textarea___GMXtD');
    var key = getAgentSessionKey(modal);
    var state = getAgentSessionState(modal);
    var message = textarea ? textarea.value || '' : '';
    var isNewSession = modal.getAttribute('data-gaip-agent-new-session') === 'true' || key.indexOf('new:') === 0 || !!state.empty;
    agentPendingSendContext = {
      key: key,
      isNewSession: isNewSession,
      title: makeHistoryTitle(message),
      message: message
    };
    state.planPanelVisible = false;
    state.plan = null;
    state.client = null;
    state.draft = '';
    if (state.empty) {
      state.empty = false;
      var chatPanel = modal.querySelector('.chatPanel___qIDO_');
      if (chatPanel) chatPanel.removeAttribute('data-gaip-empty-session');
      removeEmptyState(modal);
    }
    renderPlanPanel(modal);
    renderAgentInputTags(modal);
    updateSkillToggleState(modal);
  }

  function showPlanPanel(modal) {
    getAgentSessionState(modal).planPanelVisible = true;
    loadAgentPlanData(function () {
      renderPlanPanel(modal);
      window.requestAnimationFrame(function () {
        var panel = modal.querySelector('.gaip-agent-plan-panel');
        if (panel && panel.scrollIntoView) panel.scrollIntoView({ block: 'end', behavior: 'smooth' });
      });
    });
  }

  function togglePlanPanel(modal) {
    var state = getAgentSessionState(modal);
    state.planPanelVisible = !state.planPanelVisible;
    if (state.planPanelVisible) {
      showPlanPanel(modal);
      return;
    }
    renderPlanPanel(modal);
    renderEmptyState(modal);
    updateSkillToggleState(modal);
  }

  function ensureAgentButtonIcon(button, className, src, alt) {
    var icon;
    if (!button) return;
    icon = button.querySelector('.' + className) || button.querySelector('img');
    if (!icon) {
      icon = document.createElement('img');
      button.insertBefore(icon, button.firstChild);
    }
    icon.className = className;
    icon.alt = alt || '';
    if (icon.getAttribute('src') !== src) icon.setAttribute('src', src);
    Array.prototype.slice.call(button.querySelectorAll('img, svg, .anticon')).forEach(function (item) {
      if (item !== icon) item.remove();
    });
    Array.prototype.slice.call(button.children).forEach(function (item) {
      if (item !== icon && item.tagName === 'SPAN' && !item.textContent.trim()) item.remove();
    });
  }

  function hideNativeSkillCards(modal) {
    var title = modal.querySelector('.skillCards___lM9mG .title___U6m1a');
    var skillToggle = modal.querySelector('.skillToggle___OpRvz');
    var skillToggleText = skillToggle && Array.prototype.slice.call(skillToggle.querySelectorAll('span')).find(function (span) {
      return span.textContent && span.textContent.trim();
    });
    if (title && title.textContent) title.textContent = '';
    ensureAgentButtonIcon(skillToggle, 'gaip-agent-skill-icon', './AI Agent/素材/做方案.svg', '做方案');
    if (skillToggleText && skillToggleText.textContent !== '做方案') skillToggleText.textContent = '做方案';
  }

  function applyAgentHeaderAssets(modal) {
    var wrapper = modal.querySelector('.modalRenderWrapper___qz3XP');
    var endIcons = modal.querySelector('.endIcons___IOP5L');
    var historyButton = modal.querySelector('.historyBtn___ElWTU');
    var closeIcon = modal.querySelector('.closeIcon___X96Lj');
    var attachmentToggle = modal.querySelector('.attachmentToggle___m40lT');
    var fullscreenButton = modal.querySelector('.gaip-agent-fullscreen-toggle');
    if (historyButton && !historyButton.querySelector('.gaip-agent-collapse-icon')) {
      historyButton.innerHTML = '<img class="gaip-agent-collapse-icon" src="./AI Agent/素材/收起.svg" alt="">';
    }
    if (endIcons && !fullscreenButton) {
      fullscreenButton = document.createElement('button');
      fullscreenButton.type = 'button';
      fullscreenButton.className = 'gaip-agent-fullscreen-toggle';
      fullscreenButton.innerHTML =
        '<svg class="gaip-agent-fullscreen-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false">' +
          '<g class="gaip-agent-icon-expand" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M7.2 3.5H3.5v3.7"></path><path d="M12.8 3.5h3.7v3.7"></path>' +
            '<path d="M7.2 16.5H3.5v-3.7"></path><path d="M12.8 16.5h3.7v-3.7"></path>' +
          '</g>' +
          '<g class="gaip-agent-icon-collapse" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M3.8 7.2h3.4V3.8"></path><path d="M16.2 7.2h-3.4V3.8"></path>' +
            '<path d="M3.8 12.8h3.4v3.4"></path><path d="M16.2 12.8h-3.4v3.4"></path>' +
          '</g>' +
        '</svg>';
      if (closeIcon) {
        endIcons.insertBefore(fullscreenButton, closeIcon);
      } else {
        endIcons.appendChild(fullscreenButton);
      }
    }
    if (fullscreenButton) {
      var isFullscreen = wrapper && wrapper.classList.contains('gaip-agent-fullscreen');
      fullscreenButton.setAttribute('aria-label', isFullscreen ? '退出全屏' : '全屏');
      fullscreenButton.setAttribute('title', isFullscreen ? '退出全屏' : '全屏');
      fullscreenButton.setAttribute('aria-pressed', isFullscreen ? 'true' : 'false');
    }
    if (closeIcon && closeIcon.getAttribute('src') !== './AI Agent/素材/最小化.svg') {
      closeIcon.setAttribute('src', './AI Agent/素材/最小化.svg');
      closeIcon.setAttribute('alt', '最小化');
    }
    ensureAgentButtonIcon(attachmentToggle, 'gaip-agent-attachment-icon', './AI Agent/素材/上传附件.svg', '上传附件');
  }

  function ensureAgentSidebar(modal) {
    var wrapper = modal.querySelector('.modalRenderWrapper___qz3XP');
    var historyButton = modal.querySelector('.historyBtn___ElWTU');
    var historyWrapper = modal.querySelector('.historyWrapper___KBX5W');
    var head;
    if (!wrapper || !historyButton) return;
    if (!wrapper.classList.contains('gaip-agent-redesign-wrapper')) wrapper.classList.add('gaip-agent-redesign-wrapper');
    var modalWidth = Math.max(720, Math.min(1314, window.innerWidth - 96));
    if (wrapper.classList.contains('gaip-agent-fullscreen')) {
      if (modal.__gaipAgentAppliedWidth !== 'fullscreen') {
        modal.style.setProperty('width', '100vw', 'important');
        modal.style.setProperty('max-width', '100vw', 'important');
        modal.__gaipAgentAppliedWidth = 'fullscreen';
      }
    } else if (modal.__gaipAgentAppliedWidth !== modalWidth) {
      modal.style.setProperty('width', modalWidth + 'px', 'important');
      modal.style.setProperty('max-width', modalWidth + 'px', 'important');
      modal.__gaipAgentAppliedWidth = modalWidth;
    }
    historyButton.setAttribute('aria-label', wrapper.classList.contains('gaip-agent-sidebar-collapsed') ? '展开左侧会话' : '收起左侧会话');
    historyButton.setAttribute('title', wrapper.classList.contains('gaip-agent-sidebar-collapsed') ? '展开左侧会话' : '收起左侧会话');
    head = wrapper.querySelector('.gaip-agent-sidebar-head');
    if (!head) {
      head = document.createElement('aside');
      head.className = 'gaip-agent-sidebar-head';
      head.innerHTML =
        '<div class="gaip-agent-brand">' +
          '<img src="./AI Agent/素材/Agent头像.svg" alt="">' +
          '<div><strong>GAIP Agent助手</strong><span>Powered by Anthropic</span></div>' +
        '</div>' +
        '<button type="button" class="gaip-agent-new-session">' +
          '<img src="./AI Agent/素材/新建对话.svg" alt="">' +
          '<span>新建会话</span>' +
        '</button>' +
        '<div class="gaip-agent-history-label">历史会话</div>';
      wrapper.insertBefore(head, wrapper.firstChild);
    }
    if (historyWrapper) {
      if (!historyWrapper.classList.contains('gaip-agent-history-pinned')) historyWrapper.classList.add('gaip-agent-history-pinned');
      var historyTitle = historyWrapper.querySelector('.headerTitle___jcN2X');
      if (historyTitle) historyTitle.textContent = '历史会话';
    }
    hideNativeSkillCards(modal);
    applyAgentHeaderAssets(modal);
    var newSessionButton = wrapper.querySelector('.gaip-agent-new-session');
    var fullscreenButton = modal.querySelector('.gaip-agent-fullscreen-toggle');
    var skillToggle = modal.querySelector('.skillToggle___OpRvz');
    if (newSessionButton) {
      newSessionButton.onclick = function (event) {
        event.preventDefault();
        event.stopPropagation();
        enterNewSession(modal);
      };
    }
    if (skillToggle) {
      skillToggle.setAttribute('tabindex', '0');
      skillToggle.onclick = function (event) {
        event.preventDefault();
        event.stopPropagation();
        skillToggle.focus();
        togglePlanPanel(modal);
      };
    }
    if (fullscreenButton) {
      fullscreenButton.onclick = function (event) {
        event.preventDefault();
        event.stopPropagation();
        wrapper.classList.toggle('gaip-agent-fullscreen');
        modal.classList.toggle('gaip-agent-modal-fullscreen', wrapper.classList.contains('gaip-agent-fullscreen'));
        modal.__gaipAgentAppliedWidth = null;
        ensureAgentSidebar(modal);
      };
    }
  }

  function ensureAgentScopedObserver(modal) {
    var wrapper = modal && modal.querySelector('.modalRenderWrapper___qz3XP');
    if (!wrapper || wrapper.__gaipAgentScopedObserver) return;
    wrapper.__gaipAgentScopedObserver = new MutationObserver(function (records) {
      var shouldRestore = records.some(function (record) {
        if (record.type === 'attributes') {
          return record.target && record.target.matches &&
            record.target.matches('.modalRenderWrapper___qz3XP, .historyWrapper___KBX5W, .historyItem___pomxN');
        }
        return Array.prototype.slice.call(record.addedNodes || []).some(function (node) {
          return node.nodeType === 1 && (
            node.matches && node.matches('.historyWrapper___KBX5W, .historyItem___pomxN, .headerTitle___jcN2X') ||
            node.querySelector && node.querySelector('.historyWrapper___KBX5W, .historyItem___pomxN, .headerTitle___jcN2X')
          );
        });
      });
      if (!shouldRestore || wrapper.__gaipAgentScopedRestoreScheduled) return;
      wrapper.__gaipAgentScopedRestoreScheduled = true;
      window.requestAnimationFrame(function () {
        wrapper.__gaipAgentScopedRestoreScheduled = false;
        ensureAgentSidebar(modal);
        renderEmptyState(modal);
        renderAgentInputTags(modal);
        updateSkillToggleState(modal);
      });
    });
    wrapper.__gaipAgentScopedObserver.observe(wrapper, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });
  }

  function ensureHistoryLoaded(modal) {
    var historyButton = modal.querySelector('.historyBtn___ElWTU');
    var historyWrapper = modal.querySelector('.historyWrapper___KBX5W');
    var hasPinnedHistoryItems = historyWrapper &&
      historyWrapper.classList.contains('gaip-agent-history-pinned') &&
      historyWrapper.querySelector('.historyItem___pomxN');
    if (!historyButton || !historyWrapper || historyWrapper.classList.contains('open___eL3Lm')) return;
    if (hasPinnedHistoryItems || modal.__gaipAgentHistoryLoadRequested || window.__GAIP_AGENT_SWITCHING_HISTORY__) return;
    modal.__gaipAgentHistoryLoadRequested = true;
    window.__GAIP_AGENT_INTERNAL_HISTORY_CLICK__ = true;
    historyButton.click();
    window.setTimeout(function () {
      window.__GAIP_AGENT_INTERNAL_HISTORY_CLICK__ = false;
      scheduleAgentRedesign();
    }, 0);
    scheduleAgentHistoryReadyCheck(modal);
  }

  function triggerWorkspaceNewCustomer() {
    var button = document.querySelector('.btnNewCustomer___Rsj8E');
    if (button) {
      button.click();
      return;
    }
    window.alert('当前页面没有加载工作台的新建客户抽屉入口。请在工作台总览打开 AI Agent 后使用该按钮。');
  }

  function bindAgentRedesignEvents(modal) {
    if (modal.__gaipAgentRedesignBound) return;
    modal.__gaipAgentRedesignBound = true;
    modal.addEventListener('click', function (event) {
      var historyButton = event.target.closest && event.target.closest('.historyBtn___ElWTU');
      var historyItem = event.target.closest && event.target.closest('.historyWrapper___KBX5W .historyItem___pomxN');
      var historyMenu = event.target.closest && event.target.closest('.historyWrapper___KBX5W .moreBtn___oyzcW, .historyWrapper___KBX5W .ant-dropdown-trigger');
      var syntheticHistoryMore = event.target.closest && event.target.closest('.historyWrapper___KBX5W .historyItem___pomxN[data-gaip-agent-synthetic="true"] .moreBtn___oyzcW');
      var newSession = event.target.closest && event.target.closest('.gaip-agent-new-session');
      var skillToggle = event.target.closest && event.target.closest('.skillToggle___OpRvz');
      var skillCard = event.target.closest && event.target.closest('.skillCards___lM9mG .card___q_LYG');
      var newClient = event.target.closest && event.target.closest('.gaip-agent-new-client');
      if (historyButton && !window.__GAIP_AGENT_INTERNAL_HISTORY_CLICK__) {
        event.preventDefault();
        event.stopPropagation();
        var wrapper = modal.querySelector('.modalRenderWrapper___qz3XP');
        if (wrapper) wrapper.classList.toggle('gaip-agent-sidebar-collapsed');
        ensureAgentSidebar(modal);
        return;
      }

      if (syntheticHistoryMore && historyItem) {
        event.preventDefault();
        event.stopPropagation();
        showSyntheticHistoryMenu(modal, historyItem, syntheticHistoryMore);
        return;
      }

      if (historyItem && !historyMenu) {
        if (historyItem.getAttribute('data-gaip-agent-synthetic') === 'true') {
          event.preventDefault();
          event.stopPropagation();
          switchAgentHistorySession(modal, historyItem);
          renderSyntheticAgentSession(modal, historyItem.getAttribute('data-gaip-agent-session-id'));
          markHistoryItemActive(modal, historyItem);
          return;
        }
        switchAgentHistorySession(modal, historyItem);
        return;
      }

      if (newSession || skillToggle) return;

      if (skillCard && skillCard.querySelector('img[alt="lifePlan"]')) {
        event.preventDefault();
        event.stopPropagation();
        togglePlanPanel(modal);
        return;
      }

      if (newClient) {
        event.preventDefault();
        event.stopPropagation();
        triggerWorkspaceNewCustomer();
      }
    }, false);

    modal.addEventListener('click', function (event) {
      if (event.target && event.target.closest('.sendBtn___m_z0G')) {
        handleAgentSendClick(modal);
        window.setTimeout(function () {
          var textarea = modal.querySelector('textarea.textarea___GMXtD');
          getAgentSessionState(modal).draft = textarea ? textarea.value || '' : '';
        }, 0);
      }
    });

    modal.addEventListener('input', function (event) {
      if (event.target && event.target.matches && event.target.matches('textarea.textarea___GMXtD')) {
        getAgentSessionState(modal).draft = event.target.value || '';
      }
    });

    if (!agentDocumentClickBound) {
      agentDocumentClickBound = true;
      document.addEventListener('click', closeSyntheticHistoryMenu);
    }
  }

  function mountAgentRedesign() {
    var modal = document.querySelector('.agentModal___Nxp06');
    var state;
    if (!modal) return;
    ensureAgentSidebar(modal);
    ensureAgentScopedObserver(modal);
    ensureHistoryLoaded(modal);
    ensureNoHistoryEmptyState(modal);
    ensureInitialHistorySession(modal);
    bindAgentRedesignEvents(modal);
    state = getAgentSessionState(modal);
    renderEmptyState(modal);
    if (!state.planPanelVisible || !modal.querySelector('.gaip-agent-plan-panel')) {
      renderPlanPanel(modal);
    }
    renderAgentInputTags(modal);
    updateSkillToggleState(modal);
  }

  function scheduleAgentRedesign() {
    if (agentRedesignScheduled) return;
    agentRedesignScheduled = true;
    window.requestAnimationFrame(function () {
      agentRedesignScheduled = false;
      mountAgentRedesign();
    });
  }

  window.__GAIP_AGENT_MOCK__ = {
    dataFor: dataFor,
    fetch: fetchAgent
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleAgentRedesign);
  } else {
    scheduleAgentRedesign();
  }
  document.addEventListener('click', function (event) {
    if (event.target && event.target.closest && event.target.closest('.globalButton___DVYbX')) {
      window.setTimeout(scheduleAgentRedesign, 0);
      window.setTimeout(scheduleAgentRedesign, 160);
    }
  }, true);
  agentRedesignObserver = new MutationObserver(function (records) {
    var shouldSchedule = records.some(function (record) {
      return Array.prototype.slice.call(record.addedNodes || []).some(function (node) {
        return node.nodeType === 1 && (
          node.matches && node.matches('.agentModal___Nxp06, .historyWrapper___KBX5W, .modalRenderWrapper___qz3XP') ||
          node.querySelector && node.querySelector('.agentModal___Nxp06, .historyWrapper___KBX5W, .modalRenderWrapper___qz3XP')
        );
      });
    });
    if (shouldSchedule) scheduleAgentRedesign();
  });
  agentRedesignObserver.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true
  });
}());
