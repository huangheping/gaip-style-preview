(function () {
  'use strict';

  var nowYear = 2026;
  var people = [
    { name: '林若水', domainAccount: 'local-preview', roleDesc: '线索运营' },
    { name: '陈嘉言', domainAccount: 'owner-chen', roleDesc: '业务负责人' },
    { name: '周以安', domainAccount: 'owner-zhou', roleDesc: '业务负责人' },
    { name: '许清禾', domainAccount: 'consultant-xu', roleDesc: '前线顾问' },
    { name: '何予星', domainAccount: 'consultant-he', roleDesc: '前线顾问' }
  ];

  var baseClues = [
    {
      clueCode: 'CLUE-202607-0001',
      contactName: '沈知夏',
      mobile: '+86 138 0018 2617',
      email: 'zhixia.shen@example.com',
      region: 'HK',
      clueStatus: 'PENDING_ASSIGN',
      clueType: 'CLIENT_BUSINESS',
      clueSource: 'IDENTITY_PLAN',
      planDirection: 'IDENTITY_PLANNING',
      assetTier: 'W1000_3000',
      ownerAccount: 'local-preview',
      ownerName: '林若水',
      followerAccount: '',
      followerName: '',
      inputMethod: 'API_SYNC',
      createdBy: 'system',
      createdByName: '身份规划表单',
      createdDt: nowYear + '-07-27 09:28',
      lastFollowDt: nowYear + '-07-27 10:10',
      timeout: 'Y',
      canAssign: true,
      canOperate: true,
      canChangeType: true,
      extraInfo: {
        '表单编号': 'FORM-HKID-0727-001',
        '客户身份': '企业主，计划配置香港身份与家庭保障',
        '预约沟通时段': '工作日 19:00 后',
        '预算币种': 'HKD',
        '核心诉求': '身份规划、子女教育、跨境资产承接',
        '风险偏好': '稳健型',
        '可接受联系渠道': '微信、电话'
      }
    },
    {
      clueCode: 'CLUE-202607-0002',
      contactName: '顾明澈',
      mobile: '+86 139 1122 0901',
      email: 'mingche.gu@example.com',
      region: 'MAINLAND',
      clueStatus: 'PENDING_FOLLOW',
      clueType: 'CHANNEL_COOPERATION',
      clueSource: 'XIAO_HONG_SHU',
      planDirection: 'ASSET_ALLOCATION',
      assetTier: 'W500_1000',
      ownerAccount: 'owner-chen',
      ownerName: '陈嘉言',
      followerAccount: 'consultant-xu',
      followerName: '许清禾',
      inputMethod: 'MANUAL',
      createdBy: 'local-preview',
      createdByName: '林若水',
      createdDt: nowYear + '-07-26 15:12',
      lastFollowDt: nowYear + '-07-27 08:46',
      timeout: 'N',
      canAssign: true,
      canOperate: true,
      canChangeType: true,
      extraInfo: {
        '内容来源': '小红书私信',
        '合作类型': '高净值客户转介绍',
        '渠道规模': '理财社群约 800 人',
        '预期首批名单': '12 位潜在客户',
        '跟进优先级': '高'
      }
    },
    {
      clueCode: 'CLUE-202607-0003',
      contactName: '叶南星',
      mobile: '+852 6123 8842',
      email: 'nanxing.ye@example.com',
      region: 'SINGAPORE',
      clueStatus: 'FOLLOWING',
      clueType: 'CLIENT_BUSINESS',
      clueSource: 'AI_SESSION',
      planDirection: 'WEALTH_INHERITANCE',
      assetTier: 'ABOVE_3000W',
      ownerAccount: 'owner-zhou',
      ownerName: '周以安',
      followerAccount: 'local-preview',
      followerName: '林若水',
      inputMethod: 'API_SYNC',
      createdBy: 'gaip-agent',
      createdByName: 'AI Agent',
      createdDt: nowYear + '-07-24 11:36',
      lastFollowDt: nowYear + '-07-27 11:05',
      timeout: 'N',
      canAssign: true,
      canOperate: true,
      canChangeType: true,
      extraInfo: {
        'AI 会话主题': '家族信托与美元保单配置',
        '家庭结构': '夫妻二人，两个子女海外就读',
        '关注产品': '储蓄险、万用寿险、信托架构',
        '预计保费': 'USD 30-50 万/年',
        '下一步动作': '安排顾问与税务顾问联合沟通'
      }
    },
    {
      clueCode: 'CLUE-202607-0004',
      contactName: '赵云舒',
      mobile: '+1 415 889 2710',
      email: 'yunshu.zhao@example.com',
      region: 'USA',
      clueStatus: 'CONVERTED',
      clueType: 'CLIENT_BUSINESS',
      clueSource: 'OFFLINE_EVENT',
      planDirection: 'INSURANCE_PLANNING',
      assetTier: 'W300_500',
      ownerAccount: 'owner-chen',
      ownerName: '陈嘉言',
      followerAccount: 'consultant-he',
      followerName: '何予星',
      inputMethod: 'EXCEL_IMPORT',
      createdBy: 'event-import',
      createdByName: '湾区活动导入',
      createdDt: nowYear + '-07-18 13:40',
      lastFollowDt: nowYear + '-07-25 16:28',
      timeout: 'N',
      convertOperatorName: '何予星',
      convertDt: nowYear + '-07-25 16:28',
      convertRemark: '已完成需求确认并转入客户中心，客户计划先完成家庭保障方案测算。',
      convertEvidenceFiles: [
        { fileCode: 'mock-convert-001', fileName: '需求确认截图.png', fileSuffix: 'png' }
      ],
      canAssign: false,
      canOperate: false,
      canChangeType: false,
      extraInfo: {
        '活动名称': '湾区高净值家庭保障沙龙',
        '签到城市': 'San Francisco',
        '现场关注': '家庭保障、美元资产配置',
        '客户意向': '已同意顾问后续服务'
      }
    },
    {
      clueCode: 'CLUE-202607-0005',
      contactName: '唐若澜',
      mobile: '+44 7700 900218',
      email: 'ruolan.tang@example.com',
      region: 'UK',
      clueStatus: 'CLOSED',
      clueType: 'BROKER_RECRUIT',
      clueSource: 'BROKER_RECRUIT',
      planDirection: 'TAX_PLANNING',
      assetTier: 'UNKNOWN',
      ownerAccount: 'owner-zhou',
      ownerName: '周以安',
      followerAccount: 'consultant-xu',
      followerName: '许清禾',
      inputMethod: 'MANUAL',
      createdBy: 'local-preview',
      createdByName: '林若水',
      createdDt: nowYear + '-07-10 17:54',
      lastFollowDt: nowYear + '-07-13 10:20',
      timeout: 'N',
      closeOperatorName: '许清禾',
      closeDt: nowYear + '-07-13 10:20',
      closeReason: 'MISMATCH',
      closeRemark: '候选人目前主要做英国本土年金业务，暂不匹配本季度招募方向。',
      closeEvidenceFiles: [
        { fileCode: 'mock-close-001', fileName: '沟通纪要.png', fileSuffix: 'png' }
      ],
      canAssign: false,
      canOperate: false,
      canChangeType: false,
      extraInfo: {
        '从业年限': '5 年',
        '所在机构': '独立理财顾问',
        '主要市场': '英国本地客户',
        '牌照状态': '待进一步核验'
      }
    },
    {
      clueCode: 'CLUE-202607-0006',
      contactName: '梁予川',
      mobile: '+65 8123 4567',
      email: 'yuchuan.liang@example.com',
      region: 'AUSTRALIA',
      clueStatus: 'FOLLOWING',
      clueType: 'CHANNEL_COOPERATION',
      clueSource: 'VIDEO_LIVE',
      planDirection: 'CHILDREN_EDUCATION',
      assetTier: 'W100_300',
      ownerAccount: 'local-preview',
      ownerName: '林若水',
      followerAccount: 'consultant-he',
      followerName: '何予星',
      inputMethod: 'API_SYNC',
      createdBy: 'live-sync',
      createdByName: '视频号直播',
      createdDt: nowYear + '-07-22 20:18',
      lastFollowDt: nowYear + '-07-26 18:05',
      timeout: 'N',
      canAssign: true,
      canOperate: true,
      canChangeType: true,
      extraInfo: {
        '直播场次': '海外教育金配置专场',
        '报名备注': '孩子 9 岁，计划初中后出国',
        '预算区间': '每年 15-20 万人民币',
        '当前顾虑': '汇率波动与资金灵活性'
      }
    }
  ];

  var clues = baseClues.map(function (item, index) {
    return Object.assign({
      id: index + 1,
      version: 1,
      duplicateList: [],
      followRecordList: [
        {
          recorderName: item.followerName || item.ownerName || '林若水',
          recordDt: item.lastFollowDt,
          content: '已完成首轮信息核验，补充了客户预算、地区和规划方向，等待下一步分配或方案沟通。'
        },
        {
          recorderName: item.createdByName || '系统',
          recordDt: item.createdDt,
          content: '线索进入线索中心，来源字段与联系方式已同步。'
        }
      ],
      operateLogList: [
        {
          operatorName: item.createdByName || '系统',
          operateDt: item.createdDt,
          operateType: 'CREATE',
          operateDetail: '创建线索'
        },
        {
          operatorName: item.ownerName || '林若水',
          operateDt: item.lastFollowDt,
          operateType: item.clueStatus === 'CONVERTED' ? 'MARK_CONVERTED' : item.clueStatus === 'CLOSED' ? 'MARK_CLOSED' : 'ASSIGN_BY_OPS',
          operateDetail: item.clueStatus === 'CONVERTED' ? '标记为已转化' : item.clueStatus === 'CLOSED' ? '标记为已关闭' : '分配并更新跟进人'
        }
      ]
    }, item);
  });

  clues[0].duplicateList = [
    {
      clueCode: 'CLUE-202607-9001',
      contactName: '沈知夏',
      mobile: '+86 138 0018 2617',
      clueStatus: 'FOLLOWING',
      clueSource: 'WECHAT_PUSH',
      createdDt: nowYear + '-07-12 10:08',
      canView: 'Y'
    },
    {
      clueCode: 'CLUE-202607-9002',
      contactName: '沈女士',
      mobile: '+86 138 0018 2617',
      clueStatus: 'CLOSED',
      clueSource: 'ONLINE_QUESTIONNAIRE',
      createdDt: nowYear + '-07-05 14:31',
      canView: 'N'
    }
  ];
  clues[0].duplicateCount = clues[0].duplicateList.length;

  function parseBody(request) {
    var body = request && request.body;
    if (!body) return {};
    if (typeof body === 'string') {
      try { return JSON.parse(body); } catch (_) { return {}; }
    }
    if (body && typeof body === 'object') return body;
    return {};
  }

  function matchField(value, expected) {
    return !expected || expected === 'all' || value === expected;
  }

  function inKeyword(item, keyword) {
    if (!keyword) return true;
    var target = [item.contactName, item.mobile, item.email, item.clueCode].join(' ').toLowerCase();
    return target.indexOf(String(keyword).toLowerCase()) >= 0;
  }

  function filterByTab(item, tabType) {
    if (tabType === 'PENDING_ASSIGN') return item.clueStatus === 'PENDING_ASSIGN';
    if (tabType === 'PENDING_MY_ASSIGN') return item.clueStatus === 'PENDING_ASSIGN' && item.ownerAccount === 'local-preview';
    if (tabType === 'MY_FOLLOWING') return item.followerAccount === 'local-preview';
    if (tabType === 'TEAM_FOLLOWING') return item.clueStatus === 'FOLLOWING';
    return true;
  }

  function pageData(request) {
    var params = parseBody(request);
    var curPage = Number(params.curPage || 1);
    var pageSize = Number(params.pageSize || 10);
    var filtered = clues.filter(function (item) {
      return filterByTab(item, params.tabType) &&
        matchField(item.clueStatus, params.clueStatus) &&
        matchField(item.clueType, params.clueType) &&
        matchField(item.clueSource, params.clueSource) &&
        matchField(item.region, params.region) &&
        matchField(item.planDirection, params.planDirection) &&
        matchField(item.assetTier, params.assetTier) &&
        matchField(item.ownerAccount, params.filterPersonAccount) &&
        inKeyword(item, params.keyword);
    });
    var start = (curPage - 1) * pageSize;
    return { list: filtered.slice(start, start + pageSize), total: filtered.length };
  }

  function overview() {
    return {
      total: clues.length,
      pendingAssignCount: clues.filter(function (item) { return item.clueStatus === 'PENDING_ASSIGN'; }).length,
      pendingFollowCount: clues.filter(function (item) { return item.clueStatus === 'PENDING_FOLLOW'; }).length,
      followingCount: clues.filter(function (item) { return item.clueStatus === 'FOLLOWING'; }).length,
      convertedCount: clues.filter(function (item) { return item.clueStatus === 'CONVERTED'; }).length,
      closedCount: clues.filter(function (item) { return item.clueStatus === 'CLOSED'; }).length,
      teamFollowing: clues.filter(function (item) { return item.clueStatus === 'FOLLOWING'; }).length,
      tabMyFollowingCount: clues.filter(function (item) { return item.followerAccount === 'local-preview'; }).length,
      tabPendingMyAssignCount: clues.filter(function (item) { return item.clueStatus === 'PENDING_ASSIGN' && item.ownerAccount === 'local-preview'; }).length,
      tabTeamFollowingCount: clues.filter(function (item) { return item.clueStatus === 'FOLLOWING'; }).length
    };
  }

  function success() {
    return { success: true, version: Date.now() };
  }

  function dataFor(url, request) {
    var value = String(url || '');
    if (value.indexOf('/api/gaip/clue/page') >= 0) return { handled: true, data: pageData(request) };
    if (value.indexOf('/api/gaip/clue/overview') >= 0) return { handled: true, data: overview() };
    if (value.indexOf('/api/gaip/clue/info/') >= 0) {
      var code = decodeURIComponent(value.split('/api/gaip/clue/info/')[1].split(/[?#]/)[0]);
      var detail = clues.find(function (item) { return item.clueCode === code; }) || clues[0];
      return { handled: true, data: detail };
    }
    if (value.indexOf('/api/gaip/clue/ownerAndFollowers') >= 0) return { handled: true, data: people };
    if (value.indexOf('/api/gaip/clue/assignMember') >= 0) return { handled: true, data: people };
    if (value.indexOf('/api/gaip/clue/save') >= 0) return { handled: true, data: success() };
    if (value.indexOf('/api/gaip/clue/assign') >= 0) return { handled: true, data: success() };
    if (value.indexOf('/api/gaip/clue/changeType') >= 0) return { handled: true, data: success() };
    if (value.indexOf('/api/gaip/clue/addFollowRecord') >= 0) return { handled: true, data: success() };
    if (value.indexOf('/api/gaip/clue/markConverted') >= 0) return { handled: true, data: success() };
    if (value.indexOf('/api/gaip/clue/markClosed') >= 0) return { handled: true, data: success() };
    if (value.indexOf('/api/gaip/clue/export') >= 0) return { handled: true, data: success() };
    return { handled: false };
  }

  window.__GAIP_CLUE_MOCK__ = { dataFor: dataFor, clues: clues, people: people };
})();
