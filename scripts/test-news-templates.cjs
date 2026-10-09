'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname,'..');
const dom = new JSDOM('<div id="root"></div>', {url:'https://preview.invalid/#/workspace',runScripts:'outside-only',pretendToBeVisual:true});
try {
dom.window.eval(fs.readFileSync(path.join(root,'shared/assets/icons/local-icons.generated.js'),'utf8'));
  for (const file of ['templates.generated.js','news-center.js']) dom.window.eval(fs.readFileSync(path.join(root,'channels/news-center',file),'utf8'));
  const source = dom.window.__GAIP_NEWS_MOCK__.articles[0];
  const title = '<img src=x onerror=alert(1)> {{title}}';
  const modal = dom.window.__GAIP_NEWS_CENTER__.createArticleModal({...source,title,summary:'<script>alert(1)</script>',tags:['<iframe>'],bullets:['$& {{talk}}']});
  assert.equal(modal.querySelector('#gaipNewsModalTitle').textContent,title);
  assert.equal(modal.querySelector('script, iframe, [onerror]'),null,'data must stay escaped when inserted into HTML templates');
  assert.ok(modal.textContent.includes('$& {{talk}}'),'replacement-looking data must remain literal');
  assert.equal(modal.querySelectorAll('[data-news-close-modal]').length,1);
  assert.equal(modal.querySelectorAll('[data-gaip-ai-notice-trigger]').length,1);
  assert.equal(modal.querySelector('[data-news-source]').dataset.newsSource,String(source.id));
  delete dom.window.__GAIP_HTML_TEMPLATES__['news-article-detail'];
  assert.throws(()=>dom.window.__GAIP_NEWS_CENTER__.createArticleModal(source),/Missing news HTML template/);
  console.log('PASS: the real article modal consumes the HTML template, preserves escaped data and business controls, and rejects a missing template.');
} finally {dom.window.close();}
