(function () {
  'use strict';

  var policies = [
    {
      policyNo: 'GL-HK-2026-0018',
      productName: '臻享环球医疗保障计划',
      holder: '陈思远',
      insuranceCompanyName: '荣耀人寿（香港）',
      annualPremium: 36000,
      premiumCurrency: 'USD',
      premiumTerm: '10年',
      clientName: '陈思远',
      clientCode: 'C20260001',
      associated: 'Y',
      policyStatus: '01',
      nextPremiumDueDate: '2026-11-18',
      policyProductClassify: 'medical',
      policySource: 'GAIP'
    },
    {
      policyNo: 'GL-CN-2025-1026',
      productName: '京福传世爱如意版',
      holder: '陈思远',
      insuranceCompanyName: '荣耀保险',
      annualPremium: 200000,
      premiumCurrency: 'CNY',
      premiumTerm: '5年',
      clientName: '陈思远',
      clientCode: 'C20260001',
      associated: 'Y',
      policyStatus: '01',
      nextPremiumDueDate: '2026-09-26',
      policyProductClassify: 'savings',
      policySource: 'GAIP'
    },
    {
      policyNo: 'GL-SG-2026-0032',
      productName: '亚洲菁英传承计划',
      holder: '周雅宁',
      insuranceCompanyName: '荣耀国际保险',
      annualPremium: 80000,
      premiumCurrency: 'SGD',
      premiumTerm: '8年',
      clientName: '周雅宁',
      clientCode: 'C20260002',
      associated: 'Y',
      policyStatus: '02',
      nextPremiumDueDate: '2027-01-08',
      policyProductClassify: 'savings',
      policySource: 'GAIP'
    },
    {
      policyNo: 'GL-HK-2024-0876',
      productName: '永明满心医疗保',
      holder: '林嘉衡',
      insuranceCompanyName: '永明金融',
      annualPremium: 18600,
      premiumCurrency: 'HKD',
      premiumTerm: '20年',
      clientName: '林嘉衡',
      clientCode: 'C20260003',
      associated: 'Y',
      policyStatus: '01',
      nextPremiumDueDate: '2026-12-03',
      policyProductClassify: 'medical',
      policySource: 'IMPORT'
    },
    {
      policyNo: 'GL-US-2025-0419',
      productName: '环球家族保障计划',
      holder: '许安然',
      insuranceCompanyName: 'Global Life',
      annualPremium: 52000,
      premiumCurrency: 'USD',
      premiumTerm: '12年',
      clientName: '许安然',
      clientCode: 'C20260004',
      associated: 'Y',
      policyStatus: '03',
      nextPremiumDueDate: '2026-10-19',
      policyProductClassify: 'life',
      policySource: 'IMPORT'
    },
    {
      policyNo: 'GL-HK-2026-0068',
      productName: '隽富多元货币计划',
      holder: '顾明哲',
      insuranceCompanyName: '荣耀人寿（香港）',
      annualPremium: 100000,
      premiumCurrency: 'USD',
      premiumTerm: '5年',
      clientName: '',
      clientCode: '',
      associated: 'N',
      policyStatus: '01',
      nextPremiumDueDate: '2027-03-12',
      policyProductClassify: 'savings',
      policySource: 'GAIP'
    }
  ];

  var proposals = [
    {
      id: 8101,
      clientId: 1001,
      clientName: '陈思远',
      planType: 'TRUST',
      scoreOverall: 91,
      createdDt: '2026-07-10 10:20:00',
      updatedDt: '2026-07-28 16:40:00',
      proposalContent: '## 家族信托方案建议\n\n围绕资产隔离、跨代传承与保单治理，建立分阶段落地路径。'
    },
    {
      id: 8102,
      clientId: 1001,
      clientName: '陈思远',
      planType: 'PREMIUM_FINANCING',
      scoreOverall: 86,
      createdDt: '2026-07-16 09:30:00',
      updatedDt: '2026-07-26 11:15:00',
      proposalContent: '## 保费融资测算\n\n结合现金流、融资成本和保障杠杆，建议保留充足的利率波动缓冲。'
    },
    {
      id: 8103,
      clientId: 1002,
      clientName: '周雅宁',
      planType: 'IDENTITY',
      scoreOverall: 88,
      createdDt: '2026-06-22 14:10:00',
      updatedDt: '2026-07-24 18:05:00',
      proposalContent: '## 身份规划方案\n\n以家庭教育、税务身份和出行便利为主线，对香港与新加坡路径进行比较。'
    },
    {
      id: 8104,
      clientId: 1003,
      clientName: '林嘉衡',
      planType: 'GUARANTEE',
      scoreOverall: 82,
      createdDt: '2026-07-05 15:45:00',
      updatedDt: '2026-07-21 09:50:00',
      proposalContent: '## 家庭保障方案\n\n优先补足医疗与重疾保障，再逐步完善长期储蓄和退休现金流。'
    },
    {
      id: 8105,
      clientId: 1004,
      clientName: '许安然',
      planType: 'TRUST',
      scoreOverall: 79,
      createdDt: '2026-06-18 11:00:00',
      updatedDt: '2026-07-18 13:25:00',
      proposalContent: '## 跨境传承方案\n\n梳理不同法域资产，形成信托持有、受益人安排和持续治理框架。'
    }
  ];

  var clients = [
    {
      clientId: 1001,
      clientCode: 'C20260001',
      name: '陈思远',
      gender: 'M',
      birthYear: 1982,
      region: '上海',
      phone: '13800138001',
      status: 'PROPOSAL',
      clientTier: 'VIP',
      netAssetsTier: 'OVER_1000W',
      annualIncomeTier: 'OVER_300W',
      childrenCount: 2,
      occupation: 'ENTERPRISE_OWNER',
      industry: '科技与高端制造',
      healthStatus: 'GOOD',
      smokingHabit: 'N',
      maritalStatus: 'MARRIED',
      associated: 'Y',
      signedDate: '2025-09-18',
      fyp: 'USD 88,000',
      renewalDueDate: '2026-09-26',
      bio: '科技企业创始人，关注家族传承、跨境资产治理及子女教育安排，希望建立长期、可持续的家庭财富治理框架。',
      completeness: 94,
      threeDegreeOverall: 88,
      threeDegreeComplete: 92,
      threeDegreeDiverse: 84,
      threeDegreeSuitable: 89,
      needInheritance: 'HIGH',
      needChildProtection: 'MEDIUM',
      needAssetIsolation: 'HIGH',
      needRetirement: 'MEDIUM',
      needHealth: 'MEDIUM',
      needBasic: 'LOW'
    },
    {
      clientId: 1002,
      clientCode: 'C20260002',
      name: '周雅宁',
      gender: 'F',
      birthYear: 1988,
      region: '杭州',
      phone: '13800138002',
      status: 'FOLLOWING',
      clientTier: 'IMPORTANT',
      netAssetsTier: 'BETWEEN_500W_1000W',
      annualIncomeTier: 'BETWEEN_100W_300W',
      childrenCount: 1,
      occupation: 'EXECUTIVE',
      industry: '消费与品牌管理',
      healthStatus: 'GOOD',
      smokingHabit: 'N',
      maritalStatus: 'MARRIED',
      associated: 'Y',
      bio: '家庭处于教育与身份规划阶段，重点关注子女升学、家庭保障和跨境生活便利。',
      completeness: 86,
      threeDegreeOverall: 82,
      threeDegreeComplete: 88,
      threeDegreeDiverse: 75,
      threeDegreeSuitable: 84,
      needInheritance: 'MEDIUM',
      needChildProtection: 'HIGH',
      needAssetIsolation: 'MEDIUM',
      needRetirement: 'MEDIUM',
      needHealth: 'HIGH',
      needBasic: 'LOW'
    },
    {
      clientId: 1003,
      clientCode: 'C20260003',
      name: '林嘉衡',
      gender: 'M',
      birthYear: 1991,
      region: '深圳',
      phone: '13800138003',
      status: 'SIGNED',
      clientTier: 'IMPORTANT',
      netAssetsTier: 'BETWEEN_100W_500W',
      annualIncomeTier: 'BETWEEN_50W_100W',
      childrenCount: 1,
      occupation: 'PROFESSIONAL',
      industry: '金融服务',
      healthStatus: 'GOOD',
      smokingHabit: 'N',
      maritalStatus: 'MARRIED',
      associated: 'Y',
      signedDate: '2026-03-06',
      fyp: 'HKD 120,000',
      renewalDueDate: '2026-12-03',
      bio: '金融行业专业人士，当前优先完善医疗保障与长期退休现金流。',
      completeness: 79,
      threeDegreeOverall: 76,
      threeDegreeComplete: 81,
      threeDegreeDiverse: 70,
      threeDegreeSuitable: 78,
      needInheritance: 'LOW',
      needChildProtection: 'MEDIUM',
      needAssetIsolation: 'LOW',
      needRetirement: 'MEDIUM',
      needHealth: 'HIGH',
      needBasic: 'HIGH'
    },
    {
      clientId: 1004,
      clientCode: 'C20260004',
      name: '许安然',
      gender: 'F',
      birthYear: 1976,
      region: '北京',
      phone: '13800138004',
      status: 'SERVICING',
      clientTier: 'VIP',
      netAssetsTier: 'OVER_1000W',
      annualIncomeTier: 'OVER_300W',
      childrenCount: 2,
      occupation: 'PRIVATE_OWNER',
      industry: '医疗与投资',
      healthStatus: 'PRE_EXISTING',
      smokingHabit: 'N',
      maritalStatus: 'MARRIED',
      associated: 'Y',
      signedDate: '2024-11-12',
      fyp: 'USD 52,000',
      renewalDueDate: '2026-10-19',
      bio: '拥有多地资产及企业股权，希望通过信托与保单组合完成风险隔离和跨代传承。',
      completeness: 91,
      threeDegreeOverall: 85,
      threeDegreeComplete: 90,
      threeDegreeDiverse: 82,
      threeDegreeSuitable: 83,
      needInheritance: 'HIGH',
      needChildProtection: 'LOW',
      needAssetIsolation: 'HIGH',
      needRetirement: 'HIGH',
      needHealth: 'MEDIUM',
      needBasic: 'LOW'
    },
    {
      clientId: 1005,
      clientCode: 'C20260005',
      name: '赵奕辰',
      gender: 'M',
      birthYear: 1994,
      region: '成都',
      phone: '13800138005',
      status: 'POTENTIAL',
      clientTier: 'NORMAL',
      netAssetsTier: 'UNDER_100W',
      annualIncomeTier: 'BETWEEN_30W_50W',
      childrenCount: 0,
      occupation: 'PROFESSIONAL',
      industry: '互联网',
      healthStatus: 'GOOD',
      smokingHabit: 'N',
      maritalStatus: 'SINGLE',
      associated: 'N',
      bio: '处于家庭保障规划初期，建议先完成基础信息与风险需求评估。',
      completeness: 58,
      threeDegreeOverall: 64,
      threeDegreeComplete: 61,
      threeDegreeDiverse: 58,
      threeDegreeSuitable: 72,
      needInheritance: 'LOW',
      needChildProtection: 'MEDIUM',
      needAssetIsolation: 'LOW',
      needRetirement: 'MEDIUM',
      needHealth: 'MEDIUM',
      needBasic: 'HIGH'
    }
  ];

  var workspaceOverview = {
    totalClients: clients.length,
    monthlyNewClients: 2,
    signingRate: 40,
    avgDeliveryDays: 12,
    funnel: [
      { stage: 'POTENTIAL', count: 1 },
      { stage: 'FOLLOWING', count: 1 },
      { stage: 'PROPOSAL', count: 1 },
      { stage: 'SIGNED', count: 1 },
      { stage: 'SERVICING', count: 1 }
    ]
  };

  var workspaceFocus = [
    {
      clientId: 1001,
      clientCode: 'C20260001',
      clientName: '陈思远',
      status: 'PROPOSAL',
      ruleDesc: '家族信托方案已完成初稿，待确认受益人范围与保单装入安排',
      days: 5
    },
    {
      clientId: 1002,
      clientCode: 'C20260002',
      clientName: '周雅宁',
      status: 'FOLLOWING',
      ruleDesc: '教育与身份规划需求已明确，建议预约下一次方案比较沟通',
      days: 8
    },
    {
      clientId: 1005,
      clientCode: 'C20260005',
      clientName: '赵奕辰',
      status: 'POTENTIAL',
      ruleDesc: '基础信息完整度偏低，优先补充家庭责任与保障预算',
      days: 12
    }
  ];

  var workspaceRenewals = [
    {
      clientId: 1001,
      clientCode: 'C20260001',
      clientName: 'M5XF+TSNCb8tk2ZxCCP3g/nhHJrLG4tRBu8rHFhI4fi3vWszKLFLeB/Mufyu57A1xM+ogaZ4kXQ+xcu2HoHHOV3eWinPFGnCfdbNZhKiIzu4DIKuUO8+VbIR+fEYA1En/ON/K/LwbtGeIH/sncYZtF8tdcY/SQSK6zcvO4LYXXxU8bnEvqJf4M8bE+LpbSnHcksh//m3Af7aWZCx5QBnFgh3Wh8CCOhYymGxIrS5KlriRQCtSPt93/ligOqferdkH2P1gGJhxi7i974h/LuAinncSgftEPOPKZ2nRhm+DBBMCq5Z09lnNN/nRuSB5dZOvu56Sn4KlTVLQElHeYLLpw==',
      policyNo: 'GL-CN-2025-1026',
      expiryDate: '2026-08-12',
      daysFromNow: 13
    },
    {
      clientId: 1002,
      clientCode: 'C20260002',
      clientName: 'rjVJBvDuRNhVKyigbwMCEXeY/i54b96Fc6nQ1Ae/4kYZQe7iF1kYAFDVc9lCbVleaN9DswLpbDwqZLAtOcW8fiBUd/1bMurcs7lXjDg46Pj5auxzej1O8tZGmRFftWfeuIg28jyZHvMDbW1G/785TDjkpYIsueEsPwCi4dhFrrUH4z6s646Dey8zA/79OkLMzsdyH8w/tnkvlwmETT06woJ20iZnEkfktZNw6H9UZ2LG40TGlGriaPkWqXIF41Ltkco0GGNyuDzoWmVUjZH4Ztiv7nsvNL+hiCqOldy7Nk2ml92CdE6RimCIs8fMc4s8RXhzcyVsDIlKrNsUixHL7A==',
      policyNo: 'GL-SG-2026-0032',
      expiryDate: '2026-08-25',
      daysFromNow: 26
    },
    {
      clientId: 1003,
      clientCode: 'C20260003',
      clientName: 'nAB3FTJH9kmptzsNvfWitVy+0oOcRhj3p4xQbsaY2zpbBMdkGWBmzSzYhEqWeMdZcYq0bCsJEi+lfnrTbD9H8CUHwkyjqomiQMfuVEtbM9cu9I8R4+rFR0nHrTL6ZBHtnTQXB1JLObUu1j4XVOn1MBm49QEJvWkaGGT9QcIdmjtxLlP8/KV3EsfDHCoaGQ7DLUHqjEOe++BYxyPp5bKuTbrL01aXVP0vxcEn34/60Nfh1fe1fE7cpDGbhdsLAT7UUjutVklIO/EBgeN/Z0YLXRa32Elsbcweyh2mr3ZWEGMNU31EWaHVNQzL/CCXT/LbNbn211mFB3dS4Z+frO1jXA==',
      policyNo: 'GL-HK-2024-0876',
      expiryDate: '2026-09-18',
      daysFromNow: 50
    }
  ];

  var communications = {
    C20260001: [
      {
        id: 7101,
        communicationDate: '2026-07-25',
        communicationMethod: 'INTERVIEW',
        nextCommunicationDate: '2026-08-08',
        communicationTopic: '家族信托架构确认',
        communicationSummary: '客户认可分阶段设立思路，希望下一次沟通重点确认受益人范围和保单装入安排。'
      },
      {
        id: 7102,
        communicationDate: '2026-07-11',
        communicationMethod: 'ONLINE',
        nextCommunicationDate: '2026-07-25',
        communicationTopic: '跨境资产梳理',
        communicationSummary: '已完成香港保单、境内股权和海外账户的初步清单。'
      }
    ],
    C20260002: [
      {
        id: 7201,
        communicationDate: '2026-07-22',
        communicationMethod: 'PHONE',
        nextCommunicationDate: '2026-08-05',
        communicationTopic: '子女教育与身份规划',
        communicationSummary: '客户希望优先比较香港和新加坡路径，并同步评估家庭保障缺口。'
      }
    ]
  };

  var activities = [
    {
      activityCode: 'GA1001',
      activityName: '2026 家族传承与全球配置峰会',
      organizer: '荣耀家族研究院',
      activityType: 'family_succession_summit',
      activityStatus: 'SIGNUP_OPEN',
      activityStatusDesc: '报名中',
      startDate: '2026.08.16',
      endDate: '2026.08.17',
      signupStartDate: '2026.07.20',
      signupEndDate: '2026.08.10',
      location: '上海',
      targetCustomer: '高净值企业家家庭',
      scale: '120人',
      signedCount: 18,
      signupCount: 2,
      externalGuest: '家族治理与跨境税务专家',
      internalSpeaker: '荣耀家族研究院顾问团队',
      resourceAllocation: '主题演讲、闭门圆桌、方案咨询',
      posterFileList: []
    },
    {
      activityCode: 'GA1002',
      activityName: '香港保险产品与保单治理训练营',
      organizer: '产品解决方案中心',
      activityType: 'training',
      activityStatus: 'IN_PROGRESS',
      activityStatusDesc: '进行中',
      startDate: '2026.07.29',
      endDate: '2026.07.31',
      signupStartDate: '2026.07.01',
      signupEndDate: '2026.07.24',
      location: '香港',
      targetCustomer: '财富顾问与保险规划师',
      scale: '60人',
      signedCount: 24,
      signupCount: 1,
      externalGuest: '香港保险及信托行业嘉宾',
      internalSpeaker: '产品与合规团队',
      resourceAllocation: '产品手册、案例工作坊、合规答疑',
      posterFileList: []
    },
    {
      activityCode: 'GA1003',
      activityName: '新加坡身份规划私享会',
      organizer: '全球身份规划中心',
      activityType: 'grass_planting',
      activityStatus: 'PREPARING',
      activityStatusDesc: '筹备中',
      startDate: '2026.09.05',
      endDate: '2026.09.05',
      signupStartDate: '2026.08.05',
      signupEndDate: '2026.08.30',
      location: '深圳',
      targetCustomer: '有子女教育及企业出海需求的家庭',
      scale: '30组家庭',
      signedCount: 0,
      signupCount: 0,
      externalGuest: '新加坡持牌专业人士',
      internalSpeaker: '全球身份规划顾问',
      resourceAllocation: '主题分享、一对一咨询',
      posterFileList: []
    },
    {
      activityCode: 'GA1004',
      activityName: '保险金信托签约团',
      organizer: '信托服务中心',
      activityType: 'signing',
      activityStatus: 'SIGNUP_CLOSED',
      activityStatusDesc: '报名结束',
      startDate: '2026.08.02',
      endDate: '2026.08.03',
      signupStartDate: '2026.06.20',
      signupEndDate: '2026.07.25',
      location: '杭州',
      targetCustomer: '已完成信托方案确认的客户',
      scale: '20组家庭',
      signedCount: 20,
      signupCount: 1,
      externalGuest: '合作信托机构代表',
      internalSpeaker: '信托架构师',
      resourceAllocation: '签约室、文件预审、专属接待',
      posterFileList: []
    },
    {
      activityCode: 'GA1005',
      activityName: '全球市场月度直播：利率与汇率观察',
      organizer: '投资研究中心',
      activityType: 'live',
      activityStatus: 'ENDED',
      activityStatusDesc: '活动结束',
      startDate: '2026.07.18',
      endDate: '2026.07.18',
      signupStartDate: '2026.07.01',
      signupEndDate: '2026.07.18',
      location: '线上直播',
      targetCustomer: '关注全球资产配置的客户',
      scale: '500人',
      signedCount: 186,
      signupCount: 0,
      externalGuest: '全球宏观研究员',
      internalSpeaker: '投资研究中心',
      resourceAllocation: '直播回放、市场月报',
      posterFileList: []
    },
    {
      activityCode: 'GA1006',
      activityName: '荣耀年度顾问大会',
      organizer: '品牌与市场中心',
      activityType: 'annual_meeting',
      activityStatus: 'PREPARING',
      activityStatusDesc: '筹备中',
      startDate: '2026.12.12',
      endDate: '2026.12.13',
      signupStartDate: '2026.10.15',
      signupEndDate: '2026.11.30',
      location: '三亚',
      targetCustomer: '荣耀财富顾问',
      scale: '300人',
      signedCount: 0,
      signupCount: 0,
      externalGuest: '行业与品牌嘉宾',
      internalSpeaker: '管理层与业务负责人',
      resourceAllocation: '年度复盘、专题论坛、荣誉晚宴',
      posterFileList: []
    }
  ];

  clients.forEach(function (client) {
    client.policyList = policies.filter(function (policy) {
      return policy.clientCode === client.clientCode;
    });
    client.proposals = proposals.filter(function (proposal) {
      return proposal.clientId === client.clientId;
    });
  });

  function requestBody(request) {
    var body = request && request.body;
    if (!body) return {};
    if (typeof body === 'string') {
      try { return JSON.parse(body); } catch (_) { return {}; }
    }
    return typeof body === 'object' ? body : {};
  }

  function idAfter(url, marker) {
    return decodeURIComponent(String(url || '').split(marker)[1] || '').split(/[?#]/)[0];
  }

  function activityPage(request) {
    var filters = requestBody(request);
    var list = activities.filter(function (item) {
      var matchesType = !filters.activityTypes || !filters.activityTypes.length ||
        filters.activityTypes.indexOf(item.activityType) >= 0;
      var matchesOrganizer = !filters.organizers || !filters.organizers.length ||
        filters.organizers.indexOf(item.organizer) >= 0;
      var matchesStatus = !filters.activityStatuses || !filters.activityStatuses.length ||
        filters.activityStatuses.indexOf(item.activityStatus) >= 0;
      var keyword = String(filters.keyword || '').trim().toLowerCase();
      var matchesKeyword = !keyword ||
        item.activityName.toLowerCase().indexOf(keyword) >= 0 ||
        item.organizer.toLowerCase().indexOf(keyword) >= 0 ||
        item.location.toLowerCase().indexOf(keyword) >= 0;
      return matchesType && matchesOrganizer && matchesStatus && matchesKeyword;
    });
    var typeCounts = {};
    activities.forEach(function (item) {
      typeCounts[item.activityType] = (typeCounts[item.activityType] || 0) + 1;
    });
    return {
      pageData: { list: list, total: list.length },
      activityTypeCount: typeCounts
    };
  }

  function proposalCounts() {
    return proposals.reduce(function (counts, proposal) {
      counts[proposal.planType] = (counts[proposal.planType] || 0) + 1;
      return counts;
    }, {
      GUARANTEE: 0,
      TRUST: 0,
      IDENTITY: 0,
      THREE_DEGREE: 0,
      PREMIUM_FINANCING: 0
    });
  }

  function dataFor(url, request) {
    var value = String(url || '');
    var id;
    var item;

    if (value.indexOf('/api/gaip/workspace/overview') >= 0) {
      return { handled: true, data: workspaceOverview };
    }
    if (value.indexOf('/api/gaip/workspace/focus') >= 0) {
      return { handled: true, data: workspaceFocus };
    }
    if (value.indexOf('/api/gaip/policy/expiring/list') >= 0) {
      return { handled: true, data: workspaceRenewals };
    }

    if (value.indexOf('/api/gaip/client/list') >= 0) {
      return { handled: true, data: clients };
    }
    if (value.indexOf('/api/gaip/client/info/') >= 0) {
      id = idAfter(value, '/api/gaip/client/info/');
      item = clients.find(function (client) {
        return String(client.clientId) === id || client.clientCode === id;
      });
      return { handled: true, data: item || {} };
    }
    if (value.indexOf('/api/gaip/client/communication/list/') >= 0) {
      id = idAfter(value, '/api/gaip/client/communication/list/');
      return { handled: true, data: communications[id] || [] };
    }
    if (/\/api\/gaip\/client\/(?:save|update|delete\/)/.test(value) ||
        /\/api\/gaip\/client\/communication\/(?:save|update|delete\/)/.test(value)) {
      return { handled: true, data: { success: true } };
    }

    if (value.indexOf('/api/gaip/policy/unbound/list') >= 0) {
      return {
        handled: true,
        data: policies.filter(function (policy) { return policy.associated !== 'Y'; })
      };
    }
    if (value.indexOf('/api/gaip/policy/list') >= 0) {
      return { handled: true, data: policies };
    }
    if (/\/api\/gaip\/policy\/(?:bind|unbind)/.test(value)) {
      return { handled: true, data: { success: true } };
    }

    if (value.indexOf('/api/gaip/proposal/counts') >= 0) {
      return { handled: true, data: proposalCounts() };
    }
    if (value.indexOf('/api/gaip/proposal/list') >= 0) {
      return { handled: true, data: proposals };
    }
    if (value.indexOf('/api/gaip/proposal/info/') >= 0) {
      id = idAfter(value, '/api/gaip/proposal/info/');
      item = proposals.find(function (proposal) { return String(proposal.id) === id; });
      return { handled: true, data: item || {} };
    }
    if (value.indexOf('/api/gaip/proposal/delete/') >= 0) {
      return { handled: true, data: { success: true } };
    }

    if (value.indexOf('/api/gaip/dashboard/activity/page') >= 0) {
      return { handled: true, data: activityPage(request) };
    }
    if (value.indexOf('/api/gaip/dashboard/activityOrganizer/distinctList') >= 0) {
      return {
        handled: true,
        data: activities.map(function (activity) { return activity.organizer; })
          .filter(function (organizer, index, list) { return list.indexOf(organizer) === index; })
      };
    }
    if (value.indexOf('/api/gaip/dashboard/activity/statistics') >= 0) {
      return {
        handled: true,
        data: {
          thisQuarter: 6,
          thisMonth: 3,
          inProgress: 1,
          preparing: 2,
          endedThisYear: 14,
          signupOpen: 1
        }
      };
    }
    if (value.indexOf('/api/gaip/dashboard/activity/myList') >= 0) {
      return {
        handled: true,
        data: activities.filter(function (activity) { return activity.signupCount > 0; })
      };
    }
    if (value.indexOf('/api/gaip/dashboard/activity/info/') >= 0) {
      id = idAfter(value, '/api/gaip/dashboard/activity/info/');
      item = activities.find(function (activity) { return activity.activityCode === id; });
      return { handled: true, data: item || {} };
    }
    if (value.indexOf('/api/gaip/dashboard/activity/signupMembers/') >= 0) {
      return {
        handled: true,
        data: [{
          signupCode: 'SIGNUP-001',
          createdDt: '2026-07-24 10:30:00',
          activityName: '本地预览报名记录',
          name: '陈思远'
        }]
      };
    }
    if (value.indexOf('/api/gaip/dashboard/activity/signup') >= 0) {
      return { handled: true, data: { success: true } };
    }

    return { handled: false };
  }

  window.__GAIP_CHANNEL_DATA_MOCK__ = {
    clients: clients,
    policies: policies,
    proposals: proposals,
    activities: activities,
    workspaceOverview: workspaceOverview,
    dataFor: dataFor
  };
})();
