(function () {
  'use strict';

  function createMemoryStorage() {
    var values = Object.create(null);
    return {
      getItem: function (key) { return Object.prototype.hasOwnProperty.call(values, key) ? values[key] : null; },
      setItem: function (key, value) { values[key] = String(value); },
      removeItem: function (key) { delete values[key]; },
      clear: function () { values = Object.create(null); },
      key: function (index) { return Object.keys(values)[index] || null; },
      get length() { return Object.keys(values).length; }
    };
  }

  function usableStorage(name) {
    try {
      var storage = window[name];
      var key = '__gaip_preview_test__';
      storage.setItem(key, '1');
      storage.removeItem(key);
      return storage;
    } catch (error) {
      var memory = createMemoryStorage();
      try { Object.defineProperty(window, name, { configurable: true, value: memory }); } catch (_) {}
      return memory;
    }
  }

  var local = usableStorage('localStorage');
  var session = usableStorage('sessionStorage');
  window.__GAIP_LOCAL_STORAGE__ = local;
  window.__GAIP_SESSION_STORAGE__ = session;

  // 产品中心与活动中心分包都包含模块 90894，但活动中心里的旧版本
  // 少导出了产品地区枚举 fV。若先进入活动中心，Webpack 会缓存旧模块，
  // 再切换到产品中心时读取 fV.CN 就会报错。主包执行前先注册一份完整、
  // 向后兼容的公共常量模块，避免分包加载顺序影响主导航切换。
  var ProductType = {
    INSURANCE: 'insurance',
    IMMIGRATION: 'immigration',
    TRUST: 'trust',
    OVERSEAS: 'overseas'
  };
  var ProductTypeLabel = {
    insurance: '保险产品',
    immigration: '移民项目',
    trust: '信托架构',
    overseas: '出海方案'
  };
  var ProductRegion = {
    HK: 'HK',
    SG: 'SG',
    US: 'US',
    CN: 'CN',
    BM: 'BM',
    CARIBBEAN: 'CARIBBEAN',
    EU: 'EU',
    AE: 'AE'
  };
  var ProductRegionLabel = {
    HK: '香港',
    SG: '新加坡',
    US: '美国',
    CN: '中国大陆',
    BM: '百慕大',
    CARIBBEAN: '加勒比地区',
    EU: '欧洲',
    AE: '阿联酋'
  };
  var ActivityTypeLabel = {
    family_succession_summit: '家业长青峰会',
    group_summit: '集团峰会',
    signing: '签约团',
    grass_planting: '种草活动',
    live: '直播',
    media_activity: '媒体活动',
    training: '培训活动',
    annual_meeting: '年会'
  };
  var ActivityStatus = {
    SIGNUP_OPEN: 'SIGNUP_OPEN',
    PREPARING: 'PREPARING',
    SIGNUP_CLOSED: 'SIGNUP_CLOSED',
    IN_PROGRESS: 'IN_PROGRESS',
    ENDED: 'ENDED'
  };
  var ActivityStatusLabel = {
    SIGNUP_OPEN: '报名中',
    PREPARING: '筹备中',
    SIGNUP_CLOSED: '报名结束',
    IN_PROGRESS: '进行中',
    ENDED: '活动结束'
  };

  self.webpackChunk = self.webpackChunk || [];
  self.webpackChunk.push([['gaip-preview-compat'], {
    90894: function (_module, exports, webpackRequire) {
      webpackRequire.d(exports, {
        C0: function () { return ProductType; },
        ER: function () { return ActivityTypeLabel; },
        NH: function () { return ProductTypeLabel; },
        Om: function () { return ActivityStatus; },
        RS: function () { return ProductRegionLabel; },
        bo: function () { return ActivityStatusLabel; },
        fV: function () { return ProductRegion; }
      });
    }
  }, function (webpackRequire) {
    // 立即写入模块缓存；后续分包即使覆盖同 ID 的工厂也不会替换现有导出。
    webpackRequire(90894);
  }]);

  var menuCodes = [
    'gaip_menu_workspace',
    'gaip_menu_client_dashboard',
    'gaip_menu_policy_dashboard',
    'gaip_menu_proposal_dashboard',
    'gaip_menu_product_dashboard',
    'gaip_menu_activity_dashboard',
    'gaip_menu_induction',
    'gaip_menu_clue_center'
  ];

  var previewUser = {
    token: 'local-file-preview',
    domainAccount: 'local-preview',
    userName: '本地预览用户',
    nickName: '本地预览用户',
    disclaimerConfirmed: true,
    roleCodes: ['gaip_role_clue_online_ops'],
    authCodes: menuCodes.slice(),
    menuList: menuCodes.map(function (code) { return { menuCode: code }; })
  };

  local.setItem('token', previewUser.token);
  local.setItem('userInfo', JSON.stringify(previewUser));

  // 原站登录页依赖阿里云滑块 SDK。离线预览时用同样的回调接口
  // 直接返回验证成功，让任意非空账号和密码都能进入本地页面。
  window.initAlicom4 = function (_options, ready) {
    var successHandler = null;
    var captcha = {
      onNextReady: function (handler) {
        setTimeout(handler, 0);
        return captcha;
      },
      onSuccess: function (handler) {
        successHandler = handler;
        return captcha;
      },
      onError: function () { return captcha; },
      getValidate: function () {
        return {
          lot_number: 'local-preview',
          captcha_output: 'local-preview',
          pass_token: 'local-preview',
          gen_time: String(Date.now())
        };
      },
      reset: function () {},
      showCaptcha: function () {
        if (typeof successHandler === 'function') setTimeout(successHandler, 0);
      }
    };
    ready(captcha);
  };

  var productDictionaries = {
    gaipInsuranceType: {
      savings: '储蓄分红险',
      medical: '医疗保险'
    },
    policyProductClassify: {
      savings: '储蓄分红险',
      medical: '医疗保险',
      life: '人寿保障'
    },
    policyStatus: {
      '01': '生效',
      '02': '承保处理中',
      '03': '待续期',
      '04': '宽限期',
      '05': '暂停'
    },
    gaipCommunicationMethod: {
      INTERVIEW: '面谈',
      PHONE: '电话',
      SMS: '短信',
      ONLINE: '线上沟通'
    },
    gaipCustomerProfile: {
      medical_security: '医疗与健康保障',
      cashflow: '现金流规划（含教育金、养老金等）',
      base_allocation: '长期底仓配置',
      tax_identity: '税务身份规划',
      travel_freedom: '出行自由',
      children_education: '子女教育',
      enterprise_overseas: '企业出海类',
      legacy_planning: '财富传承规划',
      risk_isolation: '风险隔离',
      tax_compliance: '税务合规计划',
      policy_governance: '保单治理（保险金信托）'
    }
  };

  function detailHtml(product) {
    return [
      '<div class="gaip-product-detail">',
      '<section id="m1"><h2>产品特点</h2><ul>',
      '<li>' + product.feature1 + '</li>',
      '<li>' + product.feature2 + '</li>',
      '<li>' + product.feature3 + '</li>',
      '</ul></section>',
      '<section id="m2"><h2>签约要素</h2><p>' + product.signing + '</p></section>',
      '<section id="m3"><h2>营销亮点</h2><p>' + product.marketing + '</p></section>',
      '<section id="m4"><h2>详细信息</h2><p>' + product.detail + '</p></section>',
      '</div>'
    ].join('');
  }

  function mockAttachments(product) {
    var prefix = product.productCode || 'PRODUCT';
    var supplierName = product.provider || '供应商';
    var productFiles = [
      ['001', '产品说明书-核心卖点与配置场景.pdf', '产品手册'],
      ['002', '签约要素清单-客户资料与流程.pdf', '签约材料'],
      ['003', '费率及利益演示摘要.pdf', '利益演示'],
      ['004', '常见问题与异议处理话术.pdf', '营销资料'],
      ['005', '名字再长也得忍啊啊啊啊啊啊看看 ... 卷发的身份啊看见对方 .pdf', '产品手册']
    ].map(function (file) {
      return {
        fileCode: prefix + '-ATT-PRODUCT-' + file[0],
        fileName: file[1],
        fileSuffix: 'pdf',
        fileSize: '6.1 MB',
        fileCategory: 'product',
        bizType: file[2],
        source: '产品上传',
        displayScope: '仅在当前产品中展示'
      };
    });
    var supplierFiles = [
      ['001', '供应商公司介绍与服务团队.pdf', '公司资料'],
      ['002', '合规资质与牌照证明.pdf', '公司资料'],
      ['003', '产品共用条款与披露文件.pdf', '合规文件'],
      ['004', '客户适配场景培训材料.pdf', '培训材料'],
      ['005', '历史案例与交付流程说明.pdf', '营销资料'],
      ['006', '名字再长也得忍啊啊啊啊啊啊看看 ... 卷发的身份啊看见对方 .pdf', '公司资料']
    ].map(function (file) {
      return {
        fileCode: prefix + '-ATT-SUPPLIER-' + file[0],
        fileName: file[1],
        fileSuffix: 'pdf',
        fileSize: '6.1 MB',
        fileCategory: 'supplier',
        bizType: file[2],
        source: supplierName + '共享',
        inheritedFrom: '自动继承自' + supplierName
      };
    });
    return productFiles.concat(supplierFiles);
  }

  function product(item) {
    var result = {
      productCode: item.productCode,
      productType: item.productType,
      productNameCn: item.productNameCn,
      productNameEn: item.productNameEn || '',
      productRegion: item.productRegion,
      provider: item.provider,
      policyProductClassify: item.policyProductClassify || '',
      customerProfile: item.customerProfile || [],
      feature1: item.feature1,
      feature2: item.feature2,
      feature3: item.feature3,
      signing: item.signing,
      marketing: item.marketing,
      detail: item.detail,
      hasComparisonFile: false,
      comparisonFileCode: '',
      attachments: item.attachments || []
    };
    result.attachments = item.attachments || mockAttachments(result);
    result.productShowDetail = detailHtml(result);
    return result;
  }

  var mockProducts = [
    product({
      productCode: 'INS-001',
      productType: 'insurance',
      productNameCn: '臻x环球医疗保障-精选',
      productRegion: 'HK',
      provider: '安记',
      policyProductClassify: 'medical',
      customerProfile: ['medical_security'],
      feature1: '市場罕有：投保無需健康申報, 無需填寫健康問卷、無需驗身，大幅簡化了核保流程',
      feature2: '極高靈活度（多達 48 種保障組合）：客戶可自由配搭 3 個保障地區（亞洲、環球及自選地區）',
      feature3: '高額醫療保障，不設終身限制',
      signing: '适合关注香港及海外医疗资源的客户；签约前重点确认保障地区、免赔额、续保规则及既往症披露要求。',
      marketing: '可围绕“免健康申报”“灵活保障地区”和“高额医疗资源”沟通，适合医疗与健康保障场景。',
      detail: '内容参考 GAIP 产品中心镜像中的保险产品条目，用于本地 mock 展示，实际条款以保险公司正式材料为准。'
    }),
    product({
      productCode: 'INS-002',
      productType: 'insurance',
      productNameCn: '京福传世爱如意版（1.75%）',
      productRegion: 'CN',
      provider: '北京人寿',
      policyProductClassify: 'savings',
      customerProfile: ['cashflow', 'base_allocation'],
      feature1: '保单现金价值终身增长，锁定利益，稳健增值；',
      feature2: '保单享红利，红利三种领取方式可选：现金领取、累积生息、交清增额；',
      feature3: '红利演示情况下，趸缴第5年现价超过已交保费；',
      signing: '适合以人民币资产做中长期现金流规划的客户；签约前重点确认缴费方式、红利领取方式及利益演示口径。',
      marketing: '适合从教育金、养老金和长期底仓配置切入，突出现金价值增长与红利领取灵活性。',
      detail: '内容参考 GAIP 产品中心镜像中的保险产品条目，用于本地 mock 展示，利益演示不代表实际收益承诺。'
    }),
    product({
      productCode: 'INS-003',
      productType: 'insurance',
      productNameCn: '福满佳C悦享版（1.25%）',
      productRegion: 'CN',
      provider: '中英人寿',
      policyProductClassify: 'savings',
      customerProfile: ['cashflow', 'base_allocation'],
      feature1: '保单现金价值终身增长，锁定利益，稳健增值；',
      feature2: '红利领取方式按需选择：现金领取、累积生息、抵交保费、交清增额;',
      feature3: '额外重大自然灾害意外身故保障。',
      signing: '适合关注稳健增值和附加身故保障的家庭；签约前需确认保险期间、缴费期、红利实现方式及退保影响。',
      marketing: '以“现金价值增长+红利灵活领取+额外意外保障”组合表达，适合长期底仓配置客户。',
      detail: '内容参考 GAIP 产品中心镜像中的保险产品条目，用于本地 mock 展示，具体责任和红利分配以正式合同为准。'
    }),
    product({
      productCode: 'INS-004',
      productType: 'insurance',
      productNameCn: '永明满心医疗保 - 环球',
      productRegion: 'HK',
      provider: '永记',
      policyProductClassify: 'medical',
      customerProfile: ['medical_security'],
      feature1: '全数赔偿标准私家病房住院及手术费，',
      feature2: '不设住院时数限制 (一般市场要求住院≥6小时方合资格)；',
      feature3: '保证续保至100岁 + 申请程序简易 (仅5条核保问题)；',
      signing: '适合希望获得环球医疗保障的客户；签约前需确认保障地区、病房级别、续保年龄和核保问题。',
      marketing: '可突出“标准私家病房”“不设住院时数限制”和“保证续保至100岁”等医疗保障卖点。',
      detail: '内容参考 GAIP 产品中心镜像中的保险产品条目，用于本地 mock 展示，实际保障责任以正式条款为准。'
    }),
    product({
      productCode: 'IMM-001',
      productType: 'immigration',
      productNameCn: '新加坡-自雇EP/PIC',
      productRegion: 'SG',
      provider: '新加坡',
      customerProfile: ['tax_identity', 'travel_freedom', 'children_education', 'enterprise_overseas'],
      feature1: '办理周期短(1-2个月获EP)',
      feature2: '不需要居住即可获税务居民身份',
      feature3: '可为家人申请身份(DP/LTVP)',
      signing: '适合有新加坡业务或出海规划的客户；签约前需确认公司设立、岗位合理性、家庭成员随行和税务居民目标。',
      marketing: '从“企业出海+税务身份+家庭随行”切入，帮助客户理解自雇EP/PIC的组合价值。',
      detail: '内容参考 GAIP 产品中心镜像中的移民项目条目，用于本地 mock 展示，政策细节需以新加坡主管部门最新要求为准。'
    }),
    product({
      productCode: 'IMM-002',
      productType: 'immigration',
      productNameCn: '阿联酋(迪拜)-十年黄金签证',
      productRegion: 'AE',
      provider: '阿联酋(迪拜)',
      customerProfile: ['tax_identity', 'travel_freedom', 'enterprise_overseas'],
      feature1: '黄金签证10年+无限制出境',
      feature2: '阿联酋零个税+全球化程度最高',
      feature3: '迪拜政策稳定无收紧趋势',
      signing: '适合关注中东税务身份、企业出海和长期居留便利的客户；签约前需确认资产、投资或专业资格路径。',
      marketing: '围绕“10年长期身份”“零个税环境”和“迪拜国际化营商场景”进行方案沟通。',
      detail: '内容参考 GAIP 产品中心镜像中的移民项目条目，用于本地 mock 展示，实际办理条件以阿联酋最新政策为准。'
    }),
    product({
      productCode: 'IMM-003',
      productType: 'immigration',
      productNameCn: '中国香港-优秀人才入境计划 (优才)',
      productRegion: 'HK',
      provider: '中国香港',
      customerProfile: ['tax_identity', 'travel_freedom', 'children_education', 'enterprise_overseas'],
      feature1: '0投资获香港身份',
      feature2: '无需雇主担保',
      feature3: '子女DSE/华侨生联考',
      signing: '适合具备学历、专业经验或人才优势的客户；签约前需梳理评分条件、证明材料、赴港计划和续签路径。',
      marketing: '以“无需投资”“无雇主担保”和“子女教育路径”作为核心沟通点，适合家庭身份规划场景。',
      detail: '内容参考 GAIP 产品中心镜像中的移民项目条目，用于本地 mock 展示，真实评分和审批结果以香港入境处要求为准。'
    }),
    product({
      productCode: 'IMM-004',
      productType: 'immigration',
      productNameCn: '圣基茨和尼维斯-英联邦护照 (CBI投资入籍)',
      productRegion: 'CARIBBEAN',
      provider: '圣基茨和尼维斯',
      customerProfile: ['tax_identity', 'travel_freedom'],
      feature1: '历史最久(41年)入宪法，政策最稳定',
      feature2: '免签国数量相当，圣基茨品牌认知度更高',
      feature3: '圣基茨为英联邦，国际认可度更高',
      signing: '适合重视出行便利和第二身份备选的客户；签约前需准备尽调材料、无犯罪记录和资金来源证明。',
      marketing: '可突出“历史较久”“英联邦体系”和“国际认可度”，适合高频跨境商务客户。',
      detail: '内容参考 GAIP 产品中心镜像中的移民项目条目，用于本地 mock 展示，护照免签范围和投资入籍要求需实时核验。'
    }),
    product({
      productCode: 'TRU-001',
      productType: 'trust',
      productNameCn: '权利保留信托',
      productRegion: 'HK',
      provider: 'Glory',
      customerProfile: ['legacy_planning', 'risk_isolation', 'tax_compliance'],
      feature1: '01 运营体系全链路 SUSTAINABLE OPE',
      feature2: '前台(客户识别)，中台(结构设计)，后台(执行存续)完整团队',
      feature3: '每一单信托都有明确责任人与标准流程',
      signing: '适合希望在保留一定控制权的同时完成家族传承安排的客户；签约前需确认保留权利边界和税务影响。',
      marketing: '以“保留权利+标准化运营+长期传承”作为沟通主线，适合财富传承规划、风险隔离和税务合规场景。',
      detail: '内容参考 GAIP 产品中心镜像中的信托架构条目，用于本地 mock 展示，实际设立需由信托、法律和税务专业人士评估。'
    }),
    product({
      productCode: 'TRU-002',
      productType: 'trust',
      productNameCn: '高税区税务居民受益人信托',
      productRegion: 'HK',
      provider: 'Glory',
      customerProfile: ['legacy_planning', 'risk_isolation'],
      feature1: '01 运营体系全链路 SUSTAINABLE OPE',
      feature2: '前台(客户识别)，中台(结构设计)，后台(执行存续)完整团队',
      feature3: '每一单信托都有明确责任人与标准流程',
      signing: '适合家庭成员分布在高税区的客户；签约前需重点评估受益人税务居民身份、分配规则和信息申报义务。',
      marketing: '从“高税区受益人分配风险”和“跨境传承合规”切入，帮助客户理解架构设计必要性。',
      detail: '内容参考 GAIP 产品中心镜像中的信托架构条目，用于本地 mock 展示，真实税务影响需由专业税务顾问判断。'
    }),
    product({
      productCode: 'TRU-003',
      productType: 'trust',
      productNameCn: '备用信托（保险金备用信托）',
      productRegion: 'HK',
      provider: 'Glory',
      customerProfile: ['policy_governance', 'legacy_planning'],
      feature1: '01 运营体系全链路 SUSTAINABLE OPE',
      feature2: '前台(客户识别)，中台(结构设计)，后台(执行存续)完整团队',
      feature3: '每一单信托都有明确责任人与标准流程',
      signing: '适合已配置大额保单、希望预先安排保险金分配规则的客户；签约前需确认保单受益人和信托触发条件。',
      marketing: '围绕“保险金备用安排”和“未成年/跨代受益管理”沟通，适合保单治理与财富传承规划场景。',
      detail: '内容参考 GAIP 产品中心镜像中的信托架构条目，用于本地 mock 展示，落地需匹配保单条款和信托机构规则。'
    }),
    product({
      productCode: 'TRU-004',
      productType: 'trust',
      productNameCn: '保单信托',
      productRegion: 'HK',
      provider: 'Glory',
      customerProfile: ['policy_governance', 'legacy_planning', 'risk_isolation'],
      feature1: '01 运营体系全链路 SUSTAINABLE OPE',
      feature2: '前台(客户识别)，中台(结构设计)，后台(执行存续)完整团队',
      feature3: '每一单信托都有明确责任人与标准流程',
      signing: '适合以保单作为核心传承资产的客户；签约前需确认投保人、受保人、受益人、信托持有方式和后续管理流程。',
      marketing: '以“保单治理+财富传承+风险隔离”作为主线，帮助客户把单张保单升级成可持续传承安排。',
      detail: '内容参考 GAIP 产品中心镜像中的信托架构条目，用于本地 mock 展示，实际架构需结合保单所在地和信托法规评估。'
    })
  ];

  function parseRequestBody(request) {
    var body = request && request.body;
    if (!body) return {};
    if (typeof body === 'string') {
      try { return JSON.parse(body); } catch (_) { return {}; }
    }
    return typeof body === 'object' ? body : {};
  }

  function intersects(values, selected) {
    if (!selected || !selected.length) return true;
    values = Array.isArray(values) ? values : [values];
    return values.some(function (value) { return selected.indexOf(value) >= 0; });
  }

  function productPageData(request) {
    var filters = parseRequestBody(request);
    var list = mockProducts.filter(function (item) {
      return intersects(item.productType, filters.productTypes) &&
        intersects(item.productRegion, filters.productRegions) &&
        intersects(item.policyProductClassify, filters.policyProductClassifies) &&
        intersects(item.customerProfile || [], filters.customerProfiles);
    });
    return {
      regulatoryStatus: 'N',
      hkLicenseHolder: 'Y',
      pageData: { list: list, total: list.length },
      list: list,
      total: list.length
    };
  }

  function productInfoData(url) {
    var code = decodeURIComponent(String(url || '').split('/api/gaip/dashboard/product/info/')[1] || '').split(/[?#]/)[0];
    return mockProducts.find(function (item) { return item.productCode === code; }) || {};
  }

  function dataFor(url, request) {
    var value = String(url || '');
    var agentResult = window.__GAIP_AGENT_MOCK__ && window.__GAIP_AGENT_MOCK__.dataFor(value, request);
    if (agentResult && agentResult.handled) return agentResult.data;
    var clueResult = window.__GAIP_CLUE_MOCK__ && window.__GAIP_CLUE_MOCK__.dataFor(value, request);
    if (clueResult && clueResult.handled) return clueResult.data;
    var channelResult = window.__GAIP_CHANNEL_DATA_MOCK__ &&
      window.__GAIP_CHANNEL_DATA_MOCK__.dataFor(value, request);
    if (channelResult && channelResult.handled) return channelResult.data;
    if (value.indexOf('/api/gaip/auth/login') >= 0 || value.indexOf('/api/gaip/auth/info') >= 0) return previewUser;
    if (value.indexOf('/api/gaip/auth/captchaCheck') >= 0) return { verifyResult: true };
    if (value.indexOf('/api/gaip/dashboard/product/page') >= 0) return productPageData(request);
    if (value.indexOf('/api/gaip/dashboard/product/info/') >= 0) return productInfoData(value);
    if (value.indexOf('/api/gaip/dashboard/product/enabledCount') >= 0) return mockProducts.length;
    if (value.indexOf('/api/gaip/dashboard/promotion/list') >= 0) return [];
    if (value.indexOf('/api/gaip/dashboard/activity/page') >= 0) return { list: [], total: 0 };
    if (value.indexOf('/api/gaip/dashboard/activityOrganizer/distinctList') >= 0) return [];
    if (value.indexOf('/api/gaip/dashboard/activity/statistics') >= 0) return {
      total: 0,
      signupCount: 0,
      ongoingCount: 0,
      finishedCount: 0
    };
    if (value.indexOf('/api/gaip/dashboard/activity/myList') >= 0) return [];
    if (value.indexOf('/api/gaip/clue/page') >= 0) return { list: [], total: 0 };
    if (value.indexOf('/api/gaip/clue/overview') >= 0) return {
      totalCount: 0,
      pendingCount: 0,
      followingCount: 0,
      convertedCount: 0,
      closedCount: 0
    };
    if (value.indexOf('/api/gaip/clue/leaderboard') >= 0) return [];
    if (value.indexOf('/api/gaip/clue/ownerAndFollowers') >= 0) return [];
    if (value.indexOf('/api/gaip/clue/assignMember') >= 0) return [];
    if (value.indexOf('/api/dict/enum/all') >= 0 || value.indexOf('/api/dict/data/list') >= 0) return productDictionaries;
    if (value.indexOf('/api/gaip/workspace/overview') >= 0) {
      return {
        totalClients: 0,
        monthlyNewClients: 0,
        signingRate: 0,
        avgDeliveryDays: 0,
        clientStageList: []
      };
    }
    if (value.indexOf('/api/gaip/workspace/focus') >= 0) return [];
    if (value.indexOf('/api/gaip/policy/expiring/list') >= 0) return [];
    if (value.indexOf('/api/gaip/induction/query') >= 0) return { completeStatus: 'Y' };
    if (/\/(list|page|query|all)(\?|$)/i.test(value)) return [];
    return {};
  }

  function responseFor(url, request) {
    window.__GAIP_PREVIEW_REQUESTS__ = window.__GAIP_PREVIEW_REQUESTS__ || [];
    window.__GAIP_PREVIEW_REQUESTS__.push(String(url || ''));
    return { code: '20000', message: 'success', data: dataFor(url, request) };
  }

  var NativeEvent = window.Event;

  function LocalPreviewXHR() {
    this.readyState = 0;
    this.status = 0;
    this.statusText = '';
    this.response = null;
    this.responseText = '';
    this.responseType = '';
    this.responseURL = '';
    this.timeout = 0;
    this.withCredentials = false;
    this.upload = { addEventListener: function () {}, removeEventListener: function () {} };
    this._listeners = Object.create(null);
    this._headers = Object.create(null);
  }

  LocalPreviewXHR.prototype.addEventListener = function (type, listener) {
    (this._listeners[type] || (this._listeners[type] = [])).push(listener);
  };
  LocalPreviewXHR.prototype.removeEventListener = function (type, listener) {
    var list = this._listeners[type] || [];
    this._listeners[type] = list.filter(function (item) { return item !== listener; });
  };
  LocalPreviewXHR.prototype._emit = function (type) {
    var event = NativeEvent ? new NativeEvent(type) : { type: type };
    var handler = this['on' + type];
    if (typeof handler === 'function') handler.call(this, event);
    (this._listeners[type] || []).slice().forEach(function (listener) { listener.call(this, event); }, this);
  };
  LocalPreviewXHR.prototype.open = function (method, url) {
    this._method = method;
    this._url = String(url || '');
    this.responseURL = this._url;
    this.readyState = 1;
    this._emit('readystatechange');
  };
  LocalPreviewXHR.prototype.setRequestHeader = function (name, value) { this._headers[name] = value; };
  LocalPreviewXHR.prototype.getAllResponseHeaders = function () { return 'content-type: application/json\r\n'; };
  LocalPreviewXHR.prototype.getResponseHeader = function (name) {
    return String(name).toLowerCase() === 'content-type' ? 'application/json' : null;
  };
  LocalPreviewXHR.prototype.overrideMimeType = function () {};
  LocalPreviewXHR.prototype.abort = function () { this._emit('abort'); };
  LocalPreviewXHR.prototype.send = function (body) {
    var self = this;
    setTimeout(function () {
      var payload = responseFor(self._url, { method: self._method, body: body });
      var text = JSON.stringify(payload);
      self.status = 200;
      self.statusText = 'OK';
      self.responseText = text;
      self.response = self.responseType === 'json' ? payload : text;
      self.readyState = 4;
      self._emit('readystatechange');
      self._emit('load');
      self._emit('loadend');
    }, 0);
  };

  window.XMLHttpRequest = LocalPreviewXHR;

  if (window.fetch) {
    window.fetch = function (input, options) {
      var url = typeof input === 'string' ? input : input && input.url;
      var agentResponse = window.__GAIP_AGENT_MOCK__ && window.__GAIP_AGENT_MOCK__.fetch(url, options);
      if (agentResponse) return agentResponse;
      var payload = responseFor(url, { method: options && options.method, body: options && options.body });
      return Promise.resolve({
        ok: true,
        status: 200,
        statusText: 'OK',
        url: String(url || ''),
        headers: new Headers({ 'content-type': 'application/json' }),
        json: function () { return Promise.resolve(payload); },
        text: function () { return Promise.resolve(JSON.stringify(payload)); },
        clone: function () { return this; }
      });
    };
  }

  window.__GAIP_FILE_PREVIEW__ = true;
})();
