(function () {
  'use strict';

  var workbenchFiles = [
    {
      id: 'F-202608-012-001',
      name: 'Minz 台账-8月-谭劲松-上线奖.xlsx',
      type: '上线奖',
      template: 'P01',
      installment: '1/1',
      sourceRows: 4,
      details: 4,
      amount: 16293.70,
      result: '预警',
      rule: 'R-2026.08',
      issues: [
        '第3行：归属人姓名 [tjs] 与系统记录 [谭劲松] 不一致，请确认',
        '第4行：归属人姓名 [谭劲] 与系统记录 [谭劲松] 不一致，请确认'
      ]
    },
    {
      id: 'F-202608-012-002',
      name: 'Minz 台账-8月-客户保单财富值（第2期，共6期）.xlsx',
      type: '保险财富值',
      template: 'P03',
      installment: '2/6',
      sourceRows: 6,
      details: 6,
      amount: 48260.00,
      result: '通过',
      rule: 'R-2026.08',
      issues: []
    },
    {
      id: 'F-202608-012-003',
      name: '未识别类型-8月.xlsx',
      type: '-',
      template: '-',
      installment: '-',
      sourceRows: 0,
      details: 0,
      amount: 0,
      result: '失败',
      rule: '-',
      issues: ['无法从文件名识别财富值类型，请检查文件名是否包含类型关键词']
    }
  ];

  var records = [
    {
      id: 'IMP-202608-012', type: '补充导入', month: '2026年08月',
      batchStatus: '待提交', monthStatus: '待核对', importedAt: '2026-08-25 10:18:36',
      operator: '本地预览用户', fileCount: 3, success: 2, failed: 1, details: 10,
      amount: 64553.70, files: workbenchFiles
    },
    {
      id: 'IMP-202608-010', type: '补充导入', month: '2026年08月',
      batchStatus: '已提交', monthStatus: '已核对', importedAt: '2026-08-24 17:24:05',
      operator: '夏鹤彩', fileCount: 4, success: 3, failed: 1, details: 8,
      amount: 124242.50,
      files: [
        { id: 'F-202608-010-001', name: '保险财富值-AIA-第1期.xlsx', type: '保险财富值', template: 'P02', installment: '1/9', sourceRows: 3, details: 3, amount: 53974.40, result: '通过', rule: 'R-2026.08', issues: [] },
        { id: 'F-202608-010-002', name: '保险财富值-FWD-第2期.xlsx', type: '保险财富值', template: 'P02', installment: '2/9', sourceRows: 2, details: 2, amount: 42318.10, result: '预警', rule: 'R-2026.08', issues: ['第2行：结佣年月与财富值月份不一致'] },
        { id: 'F-202608-010-003', name: '移民佣金-8月.xlsx', type: '移民财富值', template: 'P06', installment: '1/1', sourceRows: 3, details: 3, amount: 27950.00, result: '通过', rule: 'R-2026.08', issues: [] },
        { id: 'F-202608-010-004', name: '001-无法识别.xlsx', type: '-', template: '-', installment: '-', sourceRows: 0, details: 0, amount: 0, result: '失败', rule: '-', issues: ['无法识别财富值类型'] }
      ]
    },
    {
      id: 'IMP-202607-006', type: '历史导入', month: '2026年07月',
      batchStatus: '已提交', monthStatus: '已核对', importedAt: '2026-08-21 14:03:18',
      operator: '本地预览用户', fileCount: 5, success: 5, failed: 0, details: 18,
      amount: 335110.98, files: []
    },
    {
      id: 'IMP-202606-003', type: '历史导入', month: '2026年06月',
      batchStatus: '已提交', monthStatus: '待核对', importedAt: '2026-08-18 09:42:06',
      operator: 'ldaptest02', fileCount: 2, success: 2, failed: 0, details: 7,
      amount: 88640.00, files: []
    },
    {
      id: 'IMP-202605-002', type: '历史导入', month: '2026年05月',
      batchStatus: '解析失败', monthStatus: '创建失败', importedAt: '2026-08-16 11:26:40',
      operator: 'ldaptest02', fileCount: 1, success: 0, failed: 1, details: 0,
      amount: 0, files: []
    },
    {
      id: 'IMP-202604-001', type: '历史导入', month: '2026年04月',
      batchStatus: '已提交', monthStatus: '已核对', importedAt: '2026-08-12 16:10:22',
      operator: '夏鹤彩', fileCount: 3, success: 3, failed: 0, details: 12,
      amount: 179860.20, files: []
    }
  ];

  var wealthDetails = [
    { date: '2026-08-22', orderNo: 'WV-202608-0018', type: '保险财富值', product: '臻享环球医疗保障计划', client: '陈思远', amount: 48260.00, status: '已发放' },
    { date: '2026-08-20', orderNo: 'WV-202608-0016', type: '上线奖', product: '荣耀顾问上线奖励', client: '谭劲松', amount: 16293.70, status: '已发放' },
    { date: '2026-08-16', orderNo: 'WV-202608-0011', type: '保险财富值', product: '亚洲菁英传承计划', client: '周雅宁', amount: 42318.10, status: '已发放' },
    { date: '2026-08-12', orderNo: 'WV-202608-0008', type: '移民财富值', product: '新加坡家族办公室服务', client: '许安然', amount: 27950.00, status: '已发放' },
    { date: '2026-08-05', orderNo: 'WV-202608-0003', type: '补发财富值', product: '2026年07月差额补发', client: '林嘉衡', amount: 8860.00, status: '已发放' },
    { date: '2026-07-28', orderNo: 'WV-202607-0026', type: '保险财富值', product: '隽富多元货币计划', client: '顾明哲', amount: 53974.40, status: '已发放' }
  ];

  window.__GAIP_WEALTH_MOCK__ = {
    workbench: {
      batchId: 'IMP-202608-012',
      month: '2026年08月',
      files: workbenchFiles
    },
    records: records,
    myWealth: {
      month: '2026年08月',
      monthAmount: 143681.80,
      totalAmount: 682436.58,
      monthCount: 5,
      totalCount: 24,
      breakdown: [
        { label: '保险财富值', amount: 90578.10, progress: 63 },
        { label: '上线奖', amount: 16293.70, progress: 11 },
        { label: '补发财富值', amount: 8860.00, progress: 6 },
        { label: '移民财富值', amount: 27950.00, progress: 20 }
      ],
      details: wealthDetails
    }
  };
})();
