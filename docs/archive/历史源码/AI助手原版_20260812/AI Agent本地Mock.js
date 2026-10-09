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
        title: message.slice(0, 24) || '未命名对话',
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
    var chatSessionId = addMockAgentConversation(chatRequestBody);
    return Promise.resolve(createAgentChatResponse(options && options.signal, chatSessionId));
  }

  window.__GAIP_AGENT_MOCK__ = {
    dataFor: dataFor,
    fetch: fetchAgent
  };
}());
