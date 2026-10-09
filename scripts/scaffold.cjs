#!/usr/bin/env node
'use strict';
const fs = require('node:fs'), path = require('node:path');
const root = path.resolve(__dirname, '..');
const [mode, ...args] = process.argv.slice(2);
function option(key) { const i=args.indexOf('--'+key); return i<0?null:args[i+1]; }
function write(file, content) { fs.mkdirSync(path.dirname(file),{recursive:true}); fs.writeFileSync(file,content,{flag:'wx'}); }
function escape(s) { return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
const id=option('id') || (mode==='project'?'home':null);
if(!['page','project'].includes(mode)||!id||!/^[a-z][a-z0-9-]*$/.test(id))throw Error('用法：scaffold.cjs page --id page-id --title 标题，或 project --target 路径 --title 标题');
const title=option('title')||id;
const target=mode==='project'?path.resolve(option('target')||''):path.join(root,'channels',id);
if(mode==='project'&&!option('target'))throw Error('新项目必须明确 --target；不会覆盖当前项目');
if(fs.existsSync(target))throw Error('目标已存在，拒绝覆盖：'+target);
const pageDir=mode==='project'?path.join(target,'channels',id):target;
for(const file of ['index.html','styles.css','script.js']){
  let text=fs.readFileSync(path.join(root,'templates/page',file+'.tpl'),'utf8').replaceAll('{{ID}}',id).replaceAll('{{TITLE}}',escape(title));
  write(path.join(pageDir,file),text);
}
for(const d of ['images','icons'])write(path.join(pageDir,'assets',d,'.gitkeep'),'');
write(path.join(pageDir,'README.md'),`# ${title}\n\n独立静态页面。双击 index.html 预览；结构、样式、交互分别维护。此骨架未实现业务内容。\n\n素材只放 assets/images 和 assets/icons。接入现有 GAIP 主导航须按频道维护流程登记并实现挂载/卸载，生成器不会伪造可用导航。\n`);
if(mode==='project'){
  write(path.join(target,'AGENTS.md'),fs.readFileSync(path.join(root,'templates/project-AGENTS.md'),'utf8'));
  write(path.join(target,'PROJECT_STATE.md'),`# 当前状态\n\n项目：${title}\n模板规范：1.0\n页面骨架已生成；业务内容与 AOCI 尚未实现；未建立 Git 仓库或远端。\n\n[[knowledge/INDEX|知识索引]]\n`);
  write(path.join(target,'knowledge/INDEX.md'),`# 项目知识索引\n\n- [[PROJECT_STATE|当前状态]]\n- [[knowledge/页面/${id}|${title}]]\n- [[docs/project-standardization-spec|规范]]\n`);
  write(path.join(target,`knowledge/页面/${id}.md`),`---\ntype: page\n---\n\n# ${title}\n\n源码：channels/${id}/。状态：基础骨架。\n\n[[knowledge/INDEX|返回索引]]\n`);
  write(path.join(target,'components/README.md'),'# 组件库\n\n组件私有资产放在对应目录；预览与业务调用同一份实现。\n');
  write(path.join(target,'.obsidian/app.json'),JSON.stringify({alwaysUpdateLinks:true,newLinkFormat:'absolute',useMarkdownLinks:false,attachmentFolderPath:'knowledge/附件'},null,2)+'\n');
  write(path.join(target,'knowledge/附件/README.md'),'# 知识附件\n\n长期笔记附件放本目录，临时截图和导出放 outputs。\n');
  write(path.join(target,'.gitignore'),'/outputs/\n/node_modules/\n.DS_Store\n/.obsidian/workspace*.json\n/.codex/config.toml\n');
  write(path.join(target,'package.json'),JSON.stringify({name:id,version:'0.0.0',private:true,scripts:{test:'node scripts/check.cjs'},devDependencies:{acorn:'8.15.0'}},null,2)+'\n');
  write(path.join(target,'scripts/js-style-audit.cjs'),fs.readFileSync(path.join(root,'scripts/js-style-audit.cjs'),'utf8'));
  write(path.join(target,'scripts/check.cjs'),fs.readFileSync(path.join(root,'templates/project-check.cjs'),'utf8'));
  write(path.join(target,'docs/project-standardization-spec.md'),'# 项目标准化规范 1.0\n\n每个频道在 channels 内独立维护 index.html、styles.css、script.js 和 assets；语义化 HTML，禁止内联 CSS/JS。components 保存共享组件唯一源码。knowledge 保存 Obsidian 双链与索引；所有文件与产物留在本项目，outputs 保存临时输出。\n\n使用 npm test 检查静态结构；业务交互仍需浏览器验收。官方依据：\n\n- [HTML](https://html.spec.whatwg.org/)\n- [Obsidian links](https://help.obsidian.md/links)\n- [OpenAI AGENTS](https://learn.chatgpt.com/docs/agent-configuration/agents-md)\n- [AOCI-CODE](https://github.com/aoci-spec/aoci-code)\n\nAOCI 在本项目单独安装、校验、初始化、连接 MCP 并建立真实索引；不得把空骨架称为已完成认知。\n');
  write(path.join(target,'docs/github-sync-rules.md'),'# 本地 GitHub 同步规则\n\n按实际授权操作，不自动提交、推送或部署。先核对仓库、分支、任务范围与既有改动，验证后仅提交本次文件，确认远端实际提交再记为已同步。当前排除清单见 knowledge/当前未发布变更.md；本地提交不等于线上发布。\n');
  write(path.join(target,'knowledge/当前未发布变更.md'),'# 当前未发布变更\n\n初始页面骨架仅在本地；尚无发布记录。\n');
  write(path.join(target,'index.html'),`<!doctype html>\n<html lang="zh-CN"><head><meta charset="utf-8"><title>${escape(title)}</title></head><body><main><h1>${escape(title)}</h1><a href="channels/${id}/index.html">打开页面</a></main></body></html>\n`);
  write(path.join(target,'README.md'),`# ${title}\n\n双击 index.html 预览；首次运行 npm install --ignore-scripts 安装检查依赖，再运行 npm test 检查（含 JS 样式审计）；用 Obsidian 打开本目录。业务实现、Git 远端和 AOCI 接入独立进行，未自动配置。\n`);
}
console.log('已生成（未提交、未推送）：'+target);
