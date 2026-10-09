/* @gaip-markup-cache:start */
// Generated from the owned templates/markup-*.html; run npm run build:templates.
var __gaipMarkup_758b12bd5a = (function () {
  var templates = {"icon-1":"<img class=\"{{gaip:0}}\" src=\"{{gaip:1}}\" alt=\"\" aria-hidden=\"true\">","renderCategories-5":"<button class=\"{{gaip:0}}{{gaip:1}}\" type=\"button\" data-news-category=\"{{gaip:2}}\">{{gaip:3}}</button>","renderCard-6":"<span class=\"{{gaip:0}}\">{{gaip:1}}</span>","renderModal-7":"<span class=\"{{gaip:0}}\">{{gaip:1}}</span>","renderModal-8":"<li>{{gaip:0}}</li>","updateNewsMenuItem-9":"<span class=\"ant-menu-title-content\" data-gaip-news-title-ready=\"true\"><a class=\"gaip-learning-menu-link\" href=\"{{gaip:0}}\"><span class=\"ant-pro-base-menu-inline-item-title gaip-learning-menu-title\"><span class=\"ant-pro-base-menu-inline-item-icon gaip-learning-menu-icon\" aria-hidden=\"true\"><span class=\"gaip-main-nav-icon\" data-gaip-nav-icon=\"news-center\"></span></span><span class=\"ant-pro-base-menu-inline-item-text ant-pro-base-menu-inline-item-text-has-icon\">资讯中心</span></span></a></span>"};
  return function (id, values) {
    if (!Object.prototype.hasOwnProperty.call(templates, id)) throw new Error("Missing HTML template: " + id);
    return templates[id].replace(/\{\{gaip:(\d+)\}\}/g, function (_, index) {
      if (!values || !Object.prototype.hasOwnProperty.call(values, index)) throw new Error("Missing HTML binding: " + id + ":" + index);
      return values[index];
    });
  };
}());
/* @gaip-markup-cache:end */
/* ===== mock-data.js ===== */
(function () {
  'use strict';

  var commonAudience = '高净值客户、跨境家庭、企业主及正在规划保险传承、税务身份和全球资产配置的客户。';
  var commonBullets = [
    '把宏观变化翻译成客户可理解的家庭现金流、币种和保障议题。',
    '优先筛选近期有美元现金、海外教育、移民或保单检视需求的客户。',
    '用一页图表说明机会、风险和下一步资料清单，降低首次沟通门槛。'
  ];

  window.__GAIP_NEWS_MOCK__ = {
    categories: ['全部', '宏观经济', '资产配置', '身份规划', '税务合规', '海外房产', '保险传承', '家族信托', '其他'],
    days: [
      { key: 'today', label: '今日', date: '2026-08-26', weekday: '星期三' },
      { key: 'yesterday', label: '昨日', date: '2026-08-25', weekday: '星期二' },
      { key: 'before', label: '前日', date: '2026-08-24', weekday: '星期一' },
      { key: 'd3', label: '08/23', date: '2026-08-23', weekday: '星期日' },
      { key: 'd4', label: '08/22', date: '2026-08-22', weekday: '星期六' }
    ],
    articles: [
      {
        id: 1001,
        dateKey: 'today',
        time: '09:12',
        slot: '晨间必读',
        category: '宏观经济',
        tags: ['AI投资', '美元趋势'],
        featured: true,
        score: 94,
        sourceLabel: '本地 Mock 原文',
        sourceUrl: '#mock-source',
        title: '全球资金重估 AI 投资周期，美元利率窗口进入观察期',
        summary: '主要市场继续围绕 AI 资本开支、美元利率路径和能源价格重新定价，短债收益与权益主题之间的轮动加快。',
        audience: commonAudience,
        bullets: commonBullets,
        nextAction: '筛选持有美元现金或短债超过 100 万美元的客户，准备“降息前后资产表现”沟通页。',
        talk: '王总早安，今天市场最值得关注的是美元利率窗口变化。我整理了一版美元现金和短债的配置检视清单，下午方便给您过一遍吗？'
      },
      {
        id: 1002,
        dateKey: 'today',
        time: '10:35',
        slot: '上午快讯',
        category: '资产配置',
        tags: ['港股红利', '债券久期'],
        featured: false,
        score: 88,
        sourceLabel: '本地 Mock 原文',
        sourceUrl: '#mock-source',
        title: '港股高股息资产企稳，中等久期债券关注度回升',
        summary: '市场对稳定现金流资产的偏好提升，高股息板块与中等久期债券成为顾问配置讨论中的高频组合。',
        audience: commonAudience,
        bullets: ['先确认客户未来 12 个月流动性需求。', '把派息资产和债券久期放在同一张风险收益表里。', '提示汇率波动可能影响真实回报。'],
        nextAction: '为稳健型客户准备港股红利与投资级债券的组合回测。',
        talk: '李总，近期高股息和中等久期债券都在回到配置视野，我想帮您把现金流需求和风险承受度重新对齐一下。'
      },
      {
        id: 1003,
        dateKey: 'today',
        time: '12:20',
        slot: '午间谈资',
        category: '身份规划',
        tags: ['教育规划', '跨境家庭'],
        featured: false,
        score: 86,
        sourceLabel: '本地 Mock 原文',
        sourceUrl: '#mock-source',
        title: '海外教育家庭重新评估学费币种与保障安排',
        summary: '随着主要币种波动加大，海外教育家庭开始把学费储备、医疗保障和身份规划放进同一套预算框架。',
        audience: commonAudience,
        bullets: ['从学费缴付年份倒推币种储备。', '同步检视孩子和陪读家长医疗保障。', '用家庭年度预算替代单点产品推荐。'],
        nextAction: '整理有海外教育标签的客户，邀约做一次学费币种压力测试。',
        talk: '张总，孩子未来几年学费和家庭保障其实可以一起规划。我做了一个币种储备测算，想给您看看。'
      },
      {
        id: 1004,
        dateKey: 'today',
        time: '15:08',
        slot: '下午茶',
        category: '税务合规',
        tags: ['CRS', '家族资产'],
        featured: true,
        score: 91,
        sourceLabel: '本地 Mock 原文',
        sourceUrl: '#mock-source',
        title: '跨境账户信息透明度提升，家族资产文件管理成重点',
        summary: '监管环境下，客户更需要清晰记录资产权属、收益来源和受益人安排，减少未来申报与传承的不确定性。',
        audience: commonAudience,
        bullets: ['提示客户区分资产所有权和受益权。', '补齐账户、保单、信托和公司文件目录。', '需要专业税务意见时提前引入顾问。'],
        nextAction: '为企业主客户建立“跨境资产文件夹”资料清单。',
        talk: '陈总，我建议近期把境内外资产文件做一次梳理，重点不是报税细节，而是先把权属和受益安排讲清楚。'
      },
      {
        id: 1005,
        dateKey: 'today',
        time: '21:00',
        slot: '夜间深度',
        category: '家族信托',
        tags: ['受益人安排', '企业传承'],
        featured: false,
        score: 89,
        sourceLabel: '本地 Mock 原文',
        sourceUrl: '#mock-source',
        title: '企业主传承讨论前置，信托架构更强调治理规则',
        summary: '越来越多企业主把家族治理、企业股权和现金流安排同时纳入传承设计，单一资产隔离已不能满足复杂需求。',
        audience: commonAudience,
        bullets: ['先画出家庭成员和企业股权关系。', '明确受益人分配、教育金和应急金规则。', '区分保险金信托和综合家族信托适用场景。'],
        nextAction: '邀约有二代接班议题的客户做一次家族治理访谈。',
        talk: '周总，传承方案不是只看工具，我更想先帮您把家庭规则和企业股权关系画清楚。'
      },
      {
        id: 1006,
        dateKey: 'yesterday',
        time: '08:58',
        slot: '晨间必读',
        category: '宏观经济',
        tags: ['能源价格', '通胀'],
        featured: false,
        score: 85,
        sourceLabel: '本地 Mock 原文',
        sourceUrl: '#mock-source',
        title: '油价波动再度牵动通胀预期，防御资产需求升温',
        summary: '能源价格短期波动增加央行政策判断难度，客户组合需要兼顾收益弹性和防御稳定性。',
        audience: commonAudience,
        bullets: commonBullets,
        nextAction: '向稳健客户解释通胀、利率和保单预期收益的关系。',
        talk: '刘总，油价波动会影响利率判断，我建议我们一起看一下您组合里的防御资产比例。'
      },
      {
        id: 1007,
        dateKey: 'yesterday',
        time: '10:18',
        slot: '上午快讯',
        category: '保险传承',
        tags: ['大额保单', '流动性'],
        featured: true,
        score: 93,
        sourceLabel: '本地 Mock 原文',
        sourceUrl: '#mock-source',
        title: '大额保单配置回归家庭流动性管理视角',
        summary: '顾问沟通从单一杠杆收益转向家庭资产负债、税务文件和受益人安排的综合设计。',
        audience: commonAudience,
        bullets: ['先核对家庭责任和现金流。', '把保费缴付能力放在压力情景中测算。', '同步确认受益人和备用受益人。'],
        nextAction: '为近期咨询大额保单的客户补做现金流压力测试。',
        talk: '赵总，大额保单更像家庭资产负债表的一部分，我想先帮您测一下不同缴费方案下的现金流压力。'
      },
      {
        id: 1008,
        dateKey: 'yesterday',
        time: '12:02',
        slot: '午间谈资',
        category: '海外房产',
        tags: ['租金收益', '利率成本'],
        featured: false,
        score: 82,
        sourceLabel: '本地 Mock 原文',
        sourceUrl: '#mock-source',
        title: '海外房产持有成本分化，租金收益测算需更新',
        summary: '利率、税费和维修成本变化使海外房产净收益差异扩大，客户需要重新评估持有目的和退出节奏。',
        audience: commonAudience,
        bullets: ['把总收益拆成租金、汇率和资本增值。', '提示空置率、物业费和税费假设。', '与教育或身份需求联动判断持有必要性。'],
        nextAction: '为持有海外房产客户准备净收益测算模板。',
        talk: '黄总，海外房产现在最关键的是净收益而不是挂牌价。我可以帮您重新测一下真实持有成本。'
      },
      {
        id: 1009,
        dateKey: 'yesterday',
        time: '15:26',
        slot: '下午茶',
        category: '资产配置',
        tags: ['再平衡', '组合回撤'],
        featured: false,
        score: 87,
        sourceLabel: '本地 Mock 原文',
        sourceUrl: '#mock-source',
        title: '组合再平衡窗口出现，风险预算成为顾问沟通重点',
        summary: '市场轮动加快时，定期再平衡比追逐单一热点更适合长期客户关系经营。',
        audience: commonAudience,
        bullets: ['复盘客户组合最大回撤。', '确认不同账户的风险预算。', '用分批而不是一次性调仓降低心理压力。'],
        nextAction: '给活跃交易客户发送组合再平衡邀约。',
        talk: '吴总，最近市场热点切换很快，我建议我们不追单点行情，先把组合风险预算校准一下。'
      },
      {
        id: 1010,
        dateKey: 'yesterday',
        time: '20:45',
        slot: '夜间深度',
        category: '其他',
        tags: ['客户经营', '内容触达'],
        featured: false,
        score: 80,
        sourceLabel: '本地 Mock 原文',
        sourceUrl: '#mock-source',
        title: '资讯触达从转发文章走向场景化跟进',
        summary: '单纯转发资讯难以形成转化，顾问需要把资讯拆成客户场景、问题清单和后续服务动作。',
        audience: commonAudience,
        bullets: ['每条资讯匹配一个客户标签。', '给客户一个明确的问题而不是大段摘要。', '记录客户反馈作为下一次拜访线索。'],
        nextAction: '用今日精选资讯生成 10 位客户的跟进话术。',
        talk: '孙总，今天这条资讯和您之前提到的美元现金安排有关，我挑重点给您整理成两分钟版本。'
      },
      {
        id: 1011,
        dateKey: 'before',
        time: '09:05',
        slot: '晨间必读',
        category: '宏观经济',
        tags: ['美联储', '降息预期'],
        featured: true,
        score: 92,
        sourceLabel: '本地 Mock 原文',
        sourceUrl: '#mock-source',
        title: '降息预期反复，美元资产配置进入情景推演阶段',
        summary: '市场对降息节奏的分歧扩大，顾问需要用不同利率路径帮助客户理解现金、债券和权益资产的取舍。',
        audience: commonAudience,
        bullets: commonBullets,
        nextAction: '制作三种利率路径下的美元组合建议。',
        talk: '何总，降息不一定一帆风顺，我给您做了三种情景，方便我们讨论现金和债券怎么安排。'
      },
      {
        id: 1012,
        dateKey: 'before',
        time: '10:44',
        slot: '上午快讯',
        category: '税务合规',
        tags: ['身份转换', '申报材料'],
        featured: false,
        score: 84,
        sourceLabel: '本地 Mock 原文',
        sourceUrl: '#mock-source',
        title: '身份转换客户关注申报材料连续性',
        summary: '客户身份和税务居民身份变化时，账户资料、收入来源证明和保单文件的连续管理更关键。',
        audience: commonAudience,
        bullets: ['先确认客户税务居民状态变化时间线。', '整理账户与保单持有人信息。', '提醒专业税务意见不可省略。'],
        nextAction: '对近期身份规划客户发送资料清单。',
        talk: '林总，身份转换过程中，资料连续性很重要。我先帮您列一张账户和保单资料清单。'
      },
      {
        id: 1013,
        dateKey: 'before',
        time: '12:16',
        slot: '午间谈资',
        category: '身份规划',
        tags: ['新加坡', '家庭办公室'],
        featured: false,
        score: 86,
        sourceLabel: '本地 Mock 原文',
        sourceUrl: '#mock-source',
        title: '新加坡家办讨论升温，客户更关注实质运营要求',
        summary: '家办设立不再只是身份和税务话题，客户开始关注团队、投资管理和合规运营成本。',
        audience: commonAudience,
        bullets: ['先问客户设立家办的真实目的。', '拆分一次性成本与年度运营成本。', '把保险、信托和投资授权放在同一框架讨论。'],
        nextAction: '为企业主客户准备家办设立问题清单。',
        talk: '郑总，如果考虑家办，我们要先看目标、成本和实际运营要求，我整理了一份问题清单。'
      },
      {
        id: 1014,
        dateKey: 'before',
        time: '15:33',
        slot: '下午茶',
        category: '保险传承',
        tags: ['保单检视', '受益人'],
        featured: false,
        score: 83,
        sourceLabel: '本地 Mock 原文',
        sourceUrl: '#mock-source',
        title: '存量保单检视成为家庭年度资产盘点入口',
        summary: '客户对既有保单的保障责任、现金价值和受益人安排并不总是清晰，年度检视可带出更多服务机会。',
        audience: commonAudience,
        bullets: ['核对保单状态和缴费节点。', '确认受益人是否符合当前家庭结构。', '把保障缺口与资产传承同时呈现。'],
        nextAction: '邀请三年以上未检视保单客户做年度盘点。',
        talk: '马总，您的家庭结构和资产都在变化，建议我们把已有保单做一次年度体检。'
      },
      {
        id: 1015,
        dateKey: 'before',
        time: '21:10',
        slot: '夜间深度',
        category: '家族信托',
        tags: ['慈善安排', '家族治理'],
        featured: true,
        score: 90,
        sourceLabel: '本地 Mock 原文',
        sourceUrl: '#mock-source',
        title: '慈善安排进入家族治理讨论，价值传承需求更明确',
        summary: '企业主客户开始把慈善、教育和家族价值观纳入信托规则，传承方案从财富分配走向治理设计。',
        audience: commonAudience,
        bullets: ['厘清慈善目标与受益对象。', '建立年度拨付和监督规则。', '与子女教育金安排区分账户目的。'],
        nextAction: '为关注公益的企业主准备慈善信托案例卡片。',
        talk: '钱总，慈善安排可以不只是捐赠，也可以成为家族治理的一部分。我想给您看两个结构案例。'
      },
      {
        id: 1016,
        dateKey: 'd3',
        time: '09:18',
        slot: '晨间必读',
        category: '资产配置',
        tags: ['现金管理', '货币基金'],
        featured: false,
        score: 82,
        sourceLabel: '本地 Mock 原文',
        sourceUrl: '#mock-source',
        title: '现金管理收益边际变化，客户短期资金需分层安排',
        summary: '现金类工具收益可能逐步回落，短期资金、备用金和长期资金需要重新分层。',
        audience: commonAudience,
        bullets: commonBullets,
        nextAction: '对大额现金客户发送资金分层表。',
        talk: '沈总，现金收益可能慢慢变化，我们先把短期备用和长期资金分层，会更稳。'
      },
      {
        id: 1017,
        dateKey: 'd3',
        time: '11:24',
        slot: '上午快讯',
        category: '海外房产',
        tags: ['英国房产', '税费'],
        featured: false,
        score: 81,
        sourceLabel: '本地 Mock 原文',
        sourceUrl: '#mock-source',
        title: '英国房产税费讨论增多，净现金流成为买入前提',
        summary: '海外置业客户对税费、贷款和出租管理的综合成本敏感度提高。',
        audience: commonAudience,
        bullets: ['提醒客户不要只看总价和租金。', '把税费和贷款成本放入净现金流模型。', '确认房产与教育或身份需求是否相关。'],
        nextAction: '为英国置业客户更新买前成本表。',
        talk: '冯总，英国房产要先算净现金流，我帮您把税费和贷款成本放进模型里看看。'
      },
      {
        id: 1018,
        dateKey: 'd3',
        time: '12:30',
        slot: '午间谈资',
        category: '税务合规',
        tags: ['保险税务', '资料留存'],
        featured: true,
        score: 89,
        sourceLabel: '本地 Mock 原文',
        sourceUrl: '#mock-source',
        title: '保险相关资料留存被更多家庭纳入合规清单',
        summary: '客户购买和持有跨境保险时，资金来源、投保目的和受益安排的资料留存变得更重要。',
        audience: commonAudience,
        bullets: ['记录投保资金来源和家庭目的。', '留存保单、缴费和受益人变更文件。', '复杂家庭建议同步法税顾问审阅。'],
        nextAction: '为跨境保单客户建立资料留存模板。',
        talk: '魏总，跨境保单后续最怕资料散落。我建议我们把缴费、受益人和资金来源文件统一归档。'
      },
      {
        id: 1019,
        dateKey: 'd3',
        time: '16:02',
        slot: '下午茶',
        category: '身份规划',
        tags: ['香港身份', '子女教育'],
        featured: false,
        score: 84,
        sourceLabel: '本地 Mock 原文',
        sourceUrl: '#mock-source',
        title: '香港身份咨询回到家庭教育和资产便利性两条主线',
        summary: '客户不只询问身份获取路径，也更关注教育、医疗、账户和保险服务便利性。',
        audience: commonAudience,
        bullets: ['先确认客户主要诉求是教育还是资产便利。', '把身份路径和家庭保障同步规划。', '提醒政策节奏和材料准备周期。'],
        nextAction: '按教育年龄段筛选身份咨询客户。',
        talk: '高总，香港身份要和孩子教育、账户和保障一起看。我先帮您按时间线排一下关键节点。'
      },
      {
        id: 1020,
        dateKey: 'd3',
        time: '20:38',
        slot: '夜间深度',
        category: '其他',
        tags: ['AI助手', '展业效率'],
        featured: false,
        score: 79,
        sourceLabel: '本地 Mock 原文',
        sourceUrl: '#mock-source',
        title: 'AI 辅助资讯摘要成为顾问日常展业工具',
        summary: '顾问借助 AI 将长资讯拆解为客户画像、可用要点和跟进话术，提升触达效率。',
        audience: commonAudience,
        bullets: ['摘要要服务客户问题，不是复述新闻。', '每条资讯匹配客户标签。', '话术需保留专业审慎表述。'],
        nextAction: '用本地资讯 mock 生成每日客户跟进清单。',
        talk: '许总，我把这条长资讯压缩成几个和您有关的点，方便您快速判断是否需要调整。'
      },
      {
        id: 1021,
        dateKey: 'd4',
        time: '09:22',
        slot: '晨间必读',
        category: '宏观经济',
        tags: ['亚洲市场', '资本流向'],
        featured: false,
        score: 83,
        sourceLabel: '本地 Mock 原文',
        sourceUrl: '#mock-source',
        title: '亚洲资金流向分化，客户组合需要降低单一区域暴露',
        summary: '区域市场表现差异扩大，客户资产配置应避免过度依赖单一市场或单一币种。',
        audience: commonAudience,
        bullets: commonBullets,
        nextAction: '给区域集中度较高客户做组合分散度检视。',
        talk: '曹总，亚洲市场近期分化比较明显，我建议我们看一下组合区域集中度。'
      },
      {
        id: 1022,
        dateKey: 'd4',
        time: '10:41',
        slot: '上午快讯',
        category: '资产配置',
        tags: ['私募信贷', '收益稳定'],
        featured: true,
        score: 90,
        sourceLabel: '本地 Mock 原文',
        sourceUrl: '#mock-source',
        title: '私募信贷讨论升温，流动性约束仍是核心前提',
        summary: '在收益稳定诉求提升的背景下，私募信贷被更多客户关注，但期限、透明度和流动性需要充分说明。',
        audience: commonAudience,
        bullets: ['先确认客户可接受锁定期。', '比较公开债券和私募信贷的风险差异。', '明确底层资产和退出机制。'],
        nextAction: '为合格客户准备私募信贷适配性提问卡。',
        talk: '杜总，私募信贷不是简单追求高收益，核心是锁定期和底层透明度。我可以先帮您做适配性判断。'
      },
      {
        id: 1023,
        dateKey: 'd4',
        time: '12:14',
        slot: '午间谈资',
        category: '保险传承',
        tags: ['家族保障', '现金价值'],
        featured: false,
        score: 85,
        sourceLabel: '本地 Mock 原文',
        sourceUrl: '#mock-source',
        title: '终身寿险沟通更强调家庭责任和现金价值平衡',
        summary: '客户希望在保障、传承和现金价值之间取得平衡，方案表达需避免单一收益叙事。',
        audience: commonAudience,
        bullets: ['先确认家庭责任排序。', '用不同退保时点说明现金价值变化。', '把受益安排与遗嘱、信托一起讨论。'],
        nextAction: '为家庭责任重的客户准备终身寿险对比说明。',
        talk: '罗总，终身寿险要同时看保障责任和现金价值，我帮您做一张不同年份的变化表。'
      },
      {
        id: 1024,
        dateKey: 'd4',
        time: '15:17',
        slot: '下午茶',
        category: '家族信托',
        tags: ['保险金信托', '二代教育'],
        featured: false,
        score: 86,
        sourceLabel: '本地 Mock 原文',
        sourceUrl: '#mock-source',
        title: '保险金信托与子女教育金安排结合度提升',
        summary: '家庭开始关注保险金进入信托后的分配规则，将教育、创业和婚姻风险纳入设计。',
        audience: commonAudience,
        bullets: ['明确教育金释放条件。', '设置创业支持与风险隔离边界。', '与保单受益人安排保持一致。'],
        nextAction: '给有未成年子女客户准备保险金信托说明页。',
        talk: '梁总，保险金信托可以把孩子教育和未来风险隔离一起设计，我想给您看一个简单结构图。'
      },
      {
        id: 1025,
        dateKey: 'd4',
        time: '21:05',
        slot: '夜间深度',
        category: '税务合规',
        tags: ['企业出海', '股权架构'],
        featured: false,
        score: 88,
        sourceLabel: '本地 Mock 原文',
        sourceUrl: '#mock-source',
        title: '企业出海客户重新审视股权、分红和家庭资产边界',
        summary: '出海企业主在业务扩张之外，更需要厘清企业股权、个人资产和家族保障之间的边界。',
        audience: commonAudience,
        bullets: ['梳理企业股权和家庭资产边界。', '明确分红、薪酬和投资账户路径。', '必要时引入法税和信托专业意见。'],
        nextAction: '为出海企业主准备资产边界访谈提纲。',
        talk: '宋总，企业出海后，家庭资产和企业股权的边界会更重要。我建议我们先做一次结构梳理。'
      }
    ]
  };
})();

;

/* ===== news-center.js ===== */
(function () {
  'use strict';

  var mock = window.__GAIP_NEWS_MOCK__;
  var syncFrame = 0;
  var boundsFrame = 0;
  var navFrame = 0;
  var originalTitle = '';
  var toastTimer = 0;
  var state = {
    category: '全部',
    featuredOnly: false,
    keyword: '',
    activeArticleId: null,
    shareOpen: false,
    shareArticleId: null
  };

  var cls = {
    pageContainer: 'pageContainer___n3P38',
    pageHeader: 'pageHeader___SFDaB',
    pageTitle: 'pageTitle___nxEXS',
    searchIcon: 'searchIcon___GmGN9',
    pageSubtitle: 'pageSubtitle___aYKdj',
    categoryTabs: 'categoryTabs___RG5Za',
    categoryTab: 'categoryTab___rc9wg',
    categoryTabActive: 'categoryTabActive___LmRA1',
    filterRow: 'filterRow___Ka9qV',
    filterLeft: 'filterLeft___uAdJr',
    featuredLabel: 'featuredLabel___WUEE5',
    filterRight: 'filterRight___y3m_t',
    searchInput: 'searchInput___q6sEI',
    manageBtn: 'manageBtn___q71lL',
    manageBtnIcon: 'manageBtnIcon___Wmu7E',
    dateGroup: 'dateGroup___SX8fi',
    timelineLeft: 'timelineLeft___hbyr8',
    timelineRow: 'timelineRow___qvIaS',
    dateLabelWrap: 'dateLabelWrap____MBPL',
    dateLabel: 'dateLabel___OM5A1',
    weekLabel: 'weekLabel___bn2P1',
    timelineDot: 'timelineDot___Zn5mT',
    articles: 'articles___H5GX6',
    articleCard: 'articleCard___x4eww',
    titleRow: 'titleRow___q7CZe',
    featuredBadge: 'featuredBadge___WLi8B',
    articleTitle: 'articleTitle___aK0_o',
    info: 'info___eWyGA',
    metaRow: 'metaRow____mb7R',
    aiScoreIcon: 'aiScoreIcon___S0eKA',
    aiScore: 'aiScore___DGCxO',
    tagIcon: 'tagIcon___hlLSp',
    tag: 'tag___hx6FF',
    actionBtns: 'actionBtns____L0Qf',
    viewOriginal: 'viewOriginal___PiGcQ',
    shareBtn: 'shareBtn___gthi6',
    btnIcon: 'btnIcon___VmYho',
    summary: 'summary___qgrZn',
    emptyState: 'emptyState___yWDxH',
    noMore: 'noMore___RXyZW',
    disclaimer: 'disclaimer___Xy94R'
  };

  var assets = {
    pageTitle: 'shared/assets/icons/business/news-center/page-title.svg',
    featured: 'shared/assets/icons/status/news-center/featured-ai.svg',
    aiScore: 'shared/assets/icons/business/news-center/ai-score.svg',
    tag: 'shared/assets/icons/business/news-center/tag.svg',
    source: 'shared/assets/icons/business/news-center/source.svg',
    search: 'shared/assets/icons/forms/shared/modal-search.svg',
    manage: 'shared/assets/icons/business/news-center/manage.svg',
    share: 'shared/assets/icons/operations/news-center/share.svg?v=20260826-1'
  };

  if (!mock) return;

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function icon(name, className) {
    return __gaipMarkup_758b12bd5a("icon-1", [('' + (escapeHtml(className || ''))), ('' + (assets[name]))]);
  }

  function lineIcon(name, className) {
    return window.__GAIP_LOCAL_ICONS__.markup("news/" + (["close", "copy"].includes(name) ? name : "empty"), className || "");
  }

  function dayByKey(key) {
    return mock.days.find(function (day) { return day.key === key; }) || mock.days[0];
  }

  function newsHash() {
    return '#/workspace?gaip-channel=news';
  }

  function filteredArticles() {
    var keyword = state.keyword.trim().toLowerCase();
    return mock.articles
      .filter(function (article) {
        return state.category === '全部' || article.category === state.category;
      })
      .filter(function (article) {
        return !state.featuredOnly || article.featured;
      })
      .filter(function (article) {
        var haystack;
        if (!keyword) return true;
        haystack = [
          article.title,
          article.summary,
          article.category,
          article.slot,
          article.tags.join(' ')
        ].join(' ').toLowerCase();
        return haystack.indexOf(keyword) >= 0;
      })
      .sort(function (a, b) {
        var dayDiff = mock.days.findIndex(function (day) { return day.key === a.dateKey; }) -
          mock.days.findIndex(function (day) { return day.key === b.dateKey; });
        if (dayDiff) return dayDiff;
        return a.time > b.time ? -1 : (a.time < b.time ? 1 : 0);
      });
  }

  function groupByDay(list) {
    return list.reduce(function (groups, article) {
      if (!groups[article.dateKey]) groups[article.dateKey] = [];
      groups[article.dateKey].push(article);
      return groups;
    }, {});
  }

  // HTML lives in templates/*.html; callers retain their existing escaping and data logic.
  function newsTemplate(name, values) {
    var html = window.__GAIP_HTML_TEMPLATES__ && window.__GAIP_HTML_TEMPLATES__['news-' + name];
    if (typeof html !== 'string') throw new Error('Missing news HTML template: ' + name);
    return html.replace(/\{\{([a-zA-Z][a-zA-Z0-9]*)\}\}/g, function (_, key) {
      if (!Object.prototype.hasOwnProperty.call(values, key)) throw new Error('Missing news template value: ' + key);
      return String(values[key]);
    });
  }

  function createPage() {
    var page = document.createElement('section');
    page.className = cls.pageContainer + ' gaip-news-page';
    page.setAttribute('data-gaip-page-root', 'news');
    page.setAttribute('data-gaip-news-overlay', 'true');
    page.innerHTML =
      newsTemplate("page", {
      search: icon('search', cls.searchIcon),
      manage: icon('manage', cls.manageBtnIcon)
    });
    page.addEventListener('click', handleClick);
    page.addEventListener('input', handleInput);
    page.addEventListener('keydown', handleKeydown);
    return page;
  }

  function renderCategories(page) {
    var root = page.querySelector('[data-news-categories]');
    root.innerHTML = mock.categories.map(function (category) {
      return __gaipMarkup_758b12bd5a("renderCategories-5", [('' + (cls.categoryTab)), ('' + (state.category === category ? ' ' + cls.categoryTabActive : '')), ('' + (escapeHtml(category))), ('' + (escapeHtml(category)))]);
    }).join('');
  }

  function renderCard(article) {
    return newsTemplate("article-card", {
      id: article.id,
      featured: article.featured ? icon('featured', cls.featuredBadge) : '',
      id2: article.id,
      title: escapeHtml(article.title),
      summary: escapeHtml(article.summary),
      aiScore: icon('aiScore', cls.aiScoreIcon),
      score: escapeHtml(article.score),
      tag: icon('tag', cls.tagIcon),
      category: escapeHtml(article.category),
      tags: article.tags.map(function (tag) { return __gaipMarkup_758b12bd5a("renderCard-6", [('' + (cls.tag)), ('' + (escapeHtml(tag)))]); }).join(''),
      id3: article.id,
      source: icon('source', cls.btnIcon),
      id4: article.id,
      share: icon('share', 'gaip-news-bridge-share-icon')
    });
  }

  function renderList(page) {
    var list = filteredArticles();
    var groups = groupByDay(list);
    var listRoot = page.querySelector('[data-news-list]');
    var empty = page.querySelector('[data-news-empty]');
    var more = page.querySelector('[data-news-more]');
    empty.hidden = list.length !== 0;
    more.hidden = list.length === 0;
    listRoot.innerHTML = mock.days
      .filter(function (day) { return groups[day.key]; })
      .map(function (day) {
        return newsTemplate("day-group", {
      label: escapeHtml(day.label),
      weekday: escapeHtml(day.weekday),
      cards: groups[day.key].map(renderCard).join('')
    });
      }).join('');
  }

  function renderModal(article) {
    return newsTemplate("article-detail", {
      close: lineIcon('close'),
      slot: escapeHtml(article.slot),
      featured: article.featured ? icon('featured', cls.featuredBadge) : '',
      title: escapeHtml(article.title),
      aiScore: icon('aiScore', cls.aiScoreIcon),
      score: escapeHtml(article.score),
      tag: icon('tag', cls.tagIcon),
      category: escapeHtml(article.category),
      tags: article.tags.map(function (tag) { return __gaipMarkup_758b12bd5a("renderModal-7", [('' + (cls.tag)), ('' + (escapeHtml(tag)))]); }).join(''),
      id: article.id,
      source: icon('source', cls.btnIcon),
      id2: article.id,
      share: icon('share', 'gaip-news-bridge-share-icon'),
      summary: escapeHtml(article.summary),
      audience: escapeHtml(article.audience),
      bullets: article.bullets.map(function (item) { return __gaipMarkup_758b12bd5a("renderModal-8", [('' + (escapeHtml(item)))]); }).join(''),
      nextAction: escapeHtml(article.nextAction),
      copy: lineIcon('copy'),
      talk: escapeHtml(article.talk)
    });
  }

  function currentPage() {
    return document.querySelector('.gaip-news-page[data-gaip-news-overlay="true"]');
  }

  function detailRoot() {
    var root = document.querySelector('[data-news-global-detail-root]');
    if (root) return root;
    root = document.createElement('div');
    root.className = 'gaip-news-global-detail-root';
    root.setAttribute('data-news-global-detail-root', 'true');
    root.addEventListener('click', function (event) {
      var closeModal = event.target.closest('[data-news-close-modal]');
      var source = event.target.closest('[data-news-source]');
      var share = event.target.closest('[data-news-share]');
      var copy = event.target.closest('[data-news-copy]');
      if (source) {
        openSource(source.getAttribute('data-news-source'));
        return;
      }
      if (share) {
        state.shareArticleId = Number(share.getAttribute('data-news-share'));
        state.shareOpen = true;
        renderShareLayer();
        return;
      }
      if (closeModal && (!event.target.closest('[data-news-modal-panel]') || closeModal.matches('button'))) {
        closeDetailModal();
        return;
      }
      if (copy) copyTalk(root, copy);
    });
    root.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      closeDetailModal();
    });
    document.body.appendChild(root);
    return root;
  }

  function renderDetailLayer() {
    var root = detailRoot();
    var article = activeArticle();
    if (article) {
      var opened = !root.querySelector('[data-news-modal-panel]');
      var hadFocus = root.contains(document.activeElement);
      root.innerHTML = renderModal(article);
      if (opened || hadFocus) root.querySelector('button[data-news-close-modal]').focus();
      return;
    }
    if (root.innerHTML) root.innerHTML = '';
  }

  function removeDetailLayer() {
    var root = document.querySelector('[data-news-global-detail-root]');
    if (root) root.remove();
  }

  function closeDetailModal() {
    var page;
    if (!state.activeArticleId) return;
    var articleId = state.activeArticleId;
    state.activeArticleId = null;
    renderDetailLayer();
    page = currentPage();
    if (page) {
      renderPage(page);
      var trigger = page.querySelector('[data-news-open="' + articleId + '"]');
      if (trigger) trigger.focus();
    }
  }

  function shareArticle() {
    return mock.articles.find(function (article) {
      return article.id === Number(state.shareArticleId);
    }) || activeArticle() || filteredArticles()[0] || mock.articles[0];
  }

  function posterSharePayload(article) {
    var day = dayByKey(article.dateKey);
    return {
      id: article.id,
      title: article.title,
      summary: article.summary,
      category: article.category,
      tags: article.tags,
      date: day.date + ' ' + article.time,
      score: article.score,
      slot: article.slot,
      featured: article.featured
    };
  }

  function renderShareLayer() {
    var api = window.__GAIP_POSTER_SHARE__;
    if (!api) return;
    if (state.shareOpen) {
      api.open(posterSharePayload(shareArticle()));
      return;
    }
    api.close({ notify: false });
  }

  function removeShareLayer() {
    if (window.__GAIP_POSTER_SHARE__) {
      window.__GAIP_POSTER_SHARE__.close({ notify: false });
    }
  }

  function closeShareModal() {
    var page;
    if (!state.shareOpen) return;
    state.shareOpen = false;
    state.shareArticleId = null;
    page = currentPage();
    if (window.__GAIP_POSTER_SHARE__) {
      window.__GAIP_POSTER_SHARE__.close({ notify: false });
    }
    if (page) renderPage(page);
  }

  function activeArticle() {
    return mock.articles.find(function (article) {
      return article.id === Number(state.activeArticleId);
    }) || null;
  }

  function renderLayers(page) {
    var article = activeArticle();
    page.querySelector('[data-news-layer]').innerHTML = '';
    renderDetailLayer();
    renderShareLayer();
    if (window.__GAIP_BREADCRUMB__) {
      if (article) {
        window.__GAIP_BREADCRUMB__.setDetail('news', article.title, function () {
          closeDetailModal();
        });
      } else {
        window.__GAIP_BREADCRUMB__.clearDetail('news');
      }
      window.__GAIP_BREADCRUMB__.refresh();
    }
  }

  function renderPage(page) {
    var featured = page.querySelector('[data-news-featured]');
    renderCategories(page);
    renderList(page);
    renderLayers(page);
    page.querySelector('[data-news-search]').value = state.keyword;
    featured.classList.toggle('ant-switch-checked', state.featuredOnly);
    featured.setAttribute('aria-pressed', String(state.featuredOnly));
    featured.setAttribute('aria-checked', String(state.featuredOnly));
    document.title = '资讯中心 - GAIP';
  }

  function showToast(message) {
    var toast = document.querySelector('.gaip-news-bridge-toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-visible'); }, 1800);
  }

  function openSource(id) {
    var article = mock.articles.find(function (item) { return item.id === Number(id); });
    if (!article) return;
    showToast(article.sourceLabel + '：真实原文链接待接入接口');
  }

  function handleClick(event) {
    var page = event.currentTarget;
    var category = event.target.closest('[data-news-category]');
    var featured = event.target.closest('[data-news-featured]');
    var open = event.target.closest('[data-news-open]');
    var card = event.target.closest('[data-news-card]');
    var source = event.target.closest('[data-news-source]');
    var share = event.target.closest('[data-news-share]');
    var manage = event.target.closest('[data-news-manage]');
    var closeModal = event.target.closest('[data-news-close-modal]');
    var closeShare = event.target.closest('[data-news-close-share]');
    var copy = event.target.closest('[data-news-copy]');

    if (category) {
      state.category = category.getAttribute('data-news-category');
      renderPage(page);
      return;
    }
    if (featured) {
      state.featuredOnly = !state.featuredOnly;
      renderPage(page);
      return;
    }
    if (source) {
      openSource(source.getAttribute('data-news-source'));
      return;
    }
    if (share) {
      state.shareArticleId = Number(share.getAttribute('data-news-share'));
      state.shareOpen = true;
      renderPage(page);
      return;
    }
    if (manage) {
      showToast('本地 Mock 暂不接入内容管理接口');
      return;
    }
    if (open) {
      state.activeArticleId = Number(open.getAttribute('data-news-open'));
      renderPage(page);
      return;
    }
    if (card) {
      state.activeArticleId = Number(card.getAttribute('data-news-card'));
      renderPage(page);
      return;
    }
    if (closeModal && !event.target.closest('[data-news-modal-panel]')) {
      closeDetailModal();
      return;
    }
    if (closeModal && closeModal.matches('button')) {
      closeDetailModal();
      return;
    }
    if (closeShare && !event.target.closest('[data-news-share-panel]')) {
      closeShareModal();
      return;
    }
    if (copy) copyTalk(page, copy);
  }

  function handleInput(event) {
    var page = event.currentTarget;
    if (!event.target.matches('[data-news-search]')) return;
    state.keyword = event.target.value;
    renderPage(page);
  }

  function handleKeydown(event) {
    if (event.key !== 'Escape') return;
    if (state.shareOpen) {
      closeShareModal();
      return;
    }
    if (state.activeArticleId) {
      closeDetailModal();
    }
  }

  function copyTalk(page, button) {
    var textNode = page.querySelector('[data-news-talk]');
    var text = textNode ? textNode.textContent : '';
    var label = button.firstChild;
    function done(message) {
      if (label) label.textContent = message + ' ';
      setTimeout(function () {
        if (label) label.textContent = '复制话术 ';
      }, 1400);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        done('已复制');
      }).catch(function () {
        fallbackCopy(text, done);
      });
      return;
    }
    fallbackCopy(text, done);
  }

  function fallbackCopy(text, done) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', 'readonly');
    textarea.className = 'gaip-news-copy-fallback';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      done('已复制');
    } catch (error) {
      done('复制失败');
    }
    textarea.remove();
  }

  function updateBounds() {
    var page = document.querySelector('.gaip-news-page[data-gaip-news-overlay="true"]');
    var header = document.querySelector('[class*="header___tcVAl"]');
    var sidebar = document.querySelector('.ant-layout-sider');
    var headerRect;
    var sidebarRect;
    boundsFrame = 0;
    if (!page || !header || !sidebar) return;
    headerRect = header.getBoundingClientRect();
    sidebarRect = sidebar.getBoundingClientRect();
    page.style.top = Math.max(0, Math.round(headerRect.height)) + 'px';
    page.style.left = Math.max(0, Math.round(sidebarRect.width)) + 'px';
    page.style.width = Math.max(0, window.innerWidth - Math.round(sidebarRect.width)) + 'px';
    page.style.height = Math.max(0, window.innerHeight - Math.round(headerRect.height)) + 'px';
  }

  function scheduleBounds() {
    if (boundsFrame) return;
    boundsFrame = requestAnimationFrame(updateBounds);
  }

  function newsRequested() {
    var query = (location.hash || '').split('?')[1] || '';
    return window.__GAIP_PAGE_OVERRIDE__ === 'news' ||
      new URLSearchParams(query).get('gaip-channel') === 'news';
  }

  function notify(open) {
    window.dispatchEvent(new CustomEvent('gaip:news-change', { detail: { open: open } }));
    if (typeof window.__GAIP_APPLY_STRUCTURE_NAMES__ === 'function') {
      window.__GAIP_APPLY_STRUCTURE_NAMES__();
    }
  }

  function mount() {
    var header = document.querySelector('[class*="header___tcVAl"]');
    var sidebar = document.querySelector('.ant-layout-sider');
    var page = document.querySelector('.gaip-news-page[data-gaip-news-overlay="true"]');
    if (!header || !sidebar) return false;
    if (!page) {
      page = createPage();
      document.body.appendChild(page);
    }
    if (!originalTitle) originalTitle = document.title;
    document.documentElement.classList.add('gaip-news-scroll-lock');
    document.body.setAttribute('data-gaip-page', 'news');
    document.body.setAttribute('data-gaip-page-label', '资讯中心');
    renderPage(page);
    scheduleBounds();
    notify(true);
    return true;
  }

  function unmount() {
    var page = document.querySelector('.gaip-news-page[data-gaip-news-overlay="true"]');
    if (page) page.remove();
    state.activeArticleId = null;
    state.shareOpen = false;
    state.shareArticleId = null;
    removeDetailLayer();
    removeShareLayer();
    document.documentElement.classList.remove('gaip-news-scroll-lock');
    if (originalTitle) {
      document.title = originalTitle;
      originalTitle = '';
    }
    if (document.body.getAttribute('data-gaip-page') === 'news') {
      document.body.removeAttribute('data-gaip-page');
      document.body.removeAttribute('data-gaip-page-label');
    }
    if (window.__GAIP_BREADCRUMB__) window.__GAIP_BREADCRUMB__.clearDetail('news');
    notify(false);
  }

  function openFromNavigation() {
    if (window.__GAIP_LEARNING_CENTER__ && window.__GAIP_LEARNING_CENTER__.isOpen()) {
      window.__GAIP_LEARNING_CENTER__.closeForNavigation('/workspace');
    }
    if (window.__GAIP_WEALTH_CENTER__ && window.__GAIP_WEALTH_CENTER__.isOpen()) {
      window.__GAIP_WEALTH_CENTER__.closeForNavigation('/workspace');
    }
    if (location.hash !== newsHash()) {
      history.pushState({ gaipChannel: 'news' }, '', location.pathname + location.search + newsHash());
    }
    mount();
  }

  function closeForNavigation() {
    if (window.__GAIP_PAGE_OVERRIDE__ === 'news') window.__GAIP_PAGE_OVERRIDE__ = '';
    unmount();
  }

  function sync() {
    syncFrame = 0;
    if (newsRequested()) mount();
    else unmount();
  }

  function scheduleSync() {
    if (syncFrame) return;
    syncFrame = requestAnimationFrame(sync);
  }

  function createNewsMenuItem(menu) {
    var sourceItems = menu.querySelectorAll('li.ant-menu-item');
    var sourceItem = sourceItems.length ? sourceItems[sourceItems.length - 1] : null;
    var item = sourceItem ? sourceItem.cloneNode(true) : document.createElement('li');
    var activity = Array.prototype.slice.call(sourceItems).find(function (candidate) {
      var title = candidate.querySelector('.ant-menu-title-content');
      return title && title.textContent.trim() === '活动中心';
    });
    var learning = menu.querySelector('.gaip-learning-menu-item');

    if (!sourceItem) item.className = 'ant-menu-item ant-menu-item-only-child';
    item.classList.remove('ant-menu-item-selected', 'ant-menu-item-active', 'gaip-learning-menu-item');
    item.classList.add('gaip-news-menu-item');
    item.removeAttribute('data-menu-id');
    item.setAttribute('data-gaip-channel', 'news');
    item.setAttribute('role', 'menuitem');
    item.setAttribute('tabindex', '-1');
    item.setAttribute('aria-selected', 'false');

    if (activity && activity.nextSibling) menu.insertBefore(item, activity.nextSibling);
    else if (learning) menu.insertBefore(item, learning);
    else menu.appendChild(item);
    return item;
  }

  function updateNewsMenuItem(item) {
    if (item.getAttribute('data-gaip-news-structure-ready') !== 'true') {
      item.innerHTML =
        __gaipMarkup_758b12bd5a("updateNewsMenuItem-9", [('' + (newsHash()))]);
      item.setAttribute('data-gaip-news-structure-ready', 'true');
    }
    item.querySelector('a').setAttribute('href', newsHash());
    if (item.getAttribute('data-gaip-news-bound') !== 'true') {
      item.setAttribute('data-gaip-news-bound', 'true');
      item.addEventListener('click', function (event) {
        event.preventDefault();
        openFromNavigation();
        scheduleNav();
      });
    }
  }

  function updateNewsMenuSelected(menu, item) {
    var selected = newsRequested() || !!document.querySelector('.gaip-news-page[data-gaip-news-overlay="true"]');
    if (selected) {
      Array.prototype.forEach.call(menu.querySelectorAll('.ant-menu-item-selected'), function (selectedItem) {
        if (selectedItem !== item) {
          selectedItem.classList.remove('ant-menu-item-selected');
          selectedItem.setAttribute('aria-selected', 'false');
        }
      });
    }
    item.classList.toggle('ant-menu-item-selected', selected);
    item.setAttribute('aria-selected', selected ? 'true' : 'false');
  }

  function bindNewsMenuSwitching(menu) {
    if (menu.getAttribute('data-gaip-news-nav-bound') === 'true') return;
    menu.setAttribute('data-gaip-news-nav-bound', 'true');
    menu.addEventListener('click', function (event) {
      var item;
      if (!newsRequested()) return;
      item = event.target.closest('li.ant-menu-item');
      if (!item || item.classList.contains('gaip-news-menu-item')) return;
      closeForNavigation();
    }, true);
  }

  function ensureNewsMenu() {
    var menu = document.querySelector('.ant-pro-sider-menu .ant-menu, .ant-layout-sider .ant-menu');
    var item;
    navFrame = 0;
    if (!menu) return;
    item = menu.querySelector('.gaip-news-menu-item') || createNewsMenuItem(menu);
    updateNewsMenuItem(item);
    updateNewsMenuSelected(menu, item);
    bindNewsMenuSwitching(menu);
  }

  function scheduleNav() {
    if (navFrame) return;
    navFrame = requestAnimationFrame(ensureNewsMenu);
  }

  function handlePosterShareClose() {
    closeShareModal();
  }

  function createArticleModal(article) {
    var template = document.createElement('template');
    template.innerHTML = renderModal(article || mock.articles[0]).trim();
    return template.content.firstElementChild;
  }

  var api = {
    open: openFromNavigation,
    closeForNavigation: closeForNavigation,
    isOpen: function () { return !!document.querySelector('.gaip-news-page[data-gaip-news-overlay="true"]'); },
    sync: scheduleSync,
    createArticleModal: createArticleModal
  };

  window.__GAIP_NEWS_CENTER__ = api;
  window.__GAIP_VIRTUAL_CHANNELS__ = window.__GAIP_VIRTUAL_CHANNELS__ || {};
  window.__GAIP_VIRTUAL_CHANNELS__.news = api;

  function start() {
    var root = document.getElementById('root');
    if (root) {
      new MutationObserver(function () {
        if (newsRequested()) scheduleSync();
        if (api.isOpen()) scheduleBounds();
        scheduleNav();
      }).observe(root, { childList: true, subtree: true });
    }
    window.addEventListener('resize', scheduleBounds);
    window.addEventListener('gaip:poster-share-close', handlePosterShareClose);
    window.addEventListener('hashchange', function () {
      scheduleSync();
      scheduleNav();
    });
    window.addEventListener('popstate', function () {
      scheduleSync();
      scheduleNav();
    });
    scheduleNav();
    scheduleSync();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
