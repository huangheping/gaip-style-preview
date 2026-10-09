(function () {
  'use strict';
  // Separate comparison cases, not a merged business uploader or upload API.
  window.__GAIP_UPLOAD_CASES__ = [
    {id:'upload-members',name:'成员 Excel 导入',type:'file',skin:'members',accept:'.xlsx,.xls',maxMB:10,source:'channels/config-center/config-center.js'},
    {id:'upload-customer',name:'客户沟通文档',type:'file',skin:'customer',accept:'.md,.doc,.docx,.txt',source:'channels/customer/page.js'},
    {id:'upload-agent',name:'AI Agent 附件',type:'file',skin:'agent',accept:'.jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md',multiple:true,source:'components/ai-agent/AI Agent本地Mock.js'},
    {id:'upload-video',name:'课节视频',type:'file',skin:'lesson',accept:'.mp4,.mov,.webm',maxMB:3072,source:'channels/learning-center/learning-app.js'},
    {id:'upload-audio',name:'课节音频',type:'file',skin:'lesson',accept:'.mp3,.m4a,.wav',maxMB:100,source:'channels/learning-center/learning-app.js'},
    {id:'upload-pdf',name:'课节 PDF',type:'file',skin:'lesson',accept:'.pdf',maxMB:100,source:'channels/learning-center/learning-app.js'},
    {id:'upload-handout',name:'课节讲义',type:'file',skin:'lesson',accept:'.pdf',maxMB:100,source:'channels/learning-center/learning-app.js'},
    {id:'upload-course-cover',name:'课程封面',type:'image',skin:'cover',accept:'.jpg,.jpeg,.png,.webp',maxMB:10,source:'channels/learning-center/learning-app.js'},
    {id:'upload-live-banner',name:'直播 Banner',type:'image',skin:'live',accept:'.jpg,.jpeg,.png,.webp',maxMB:2,source:'channels/learning-center/learning-live.js'},
    {id:'upload-clue-images',name:'线索截图凭证',type:'image',skin:'clues',accept:'.jpg,.jpeg,.png',maxMB:5,multiple:true,maxCount:4,source:'channels/clues/page.js'},
    {id:'upload-poster-avatar',name:'海报头像',type:'image',skin:'avatar',accept:'.jpg,.jpeg,.png,.webp',maxMB:5,source:'components/海报分享/index.script-3.js'},
    {id:'upload-poster-qr',name:'微信二维码',type:'image',skin:'qr',accept:'.jpg,.jpeg,.png,.webp',maxMB:5,source:'components/海报分享/index.script-3.js'}
  ];
  window.__GAIP_UPLOAD_COMPONENTS__ = [{id:'uploads',name:'上传',category:'文件 / 图片',previewKind:'uploads',updatedAt:'2026-10-09'}];
}());
