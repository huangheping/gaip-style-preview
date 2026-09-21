/* DOM regression: file rows arriving after mount and React reusing filename/icon nodes. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<section class="agentModal___Nxp06"><div class="modalRenderWrapper___qz3XP"><button class="historyBtn___ElWTU"></button><button class="attachmentToggle___m40lT"><span class="anticon"><svg></svg></span></button><div class="historyWrapper___KBX5W"></div><div class="footerBox___QzN5g"><div class="container___jv7uB"></div></div></div></section>', { url: 'http://localhost', runScripts: 'outside-only', pretendToBeVisual: true });
const w = dom.window, d = w.document;
const tick = () => new Promise(resolve => setTimeout(resolve, 60));
function add(name, sent = false, skill = false) {
  const row = d.createElement(sent ? 'li' : 'div');
  row.className = sent ? 'attachmentItem___yTpxC' : 'tag___PKl7Z' + (skill ? ' skillTag___g4XXW' : '');
  row.innerHTML = `<span class="${sent ? 'clipIcon___AJeBx' : 'icon___uCSIV'}"><svg></svg></span><span class="${sent ? 'fileName___a9zJG' : 'text___u9Ggi'}"></span><button>×</button>`;
  row.children[1].textContent = name;
  d.querySelector('.container___jv7uB').appendChild(row);
  return row;
}
(async () => {
  try {
    const nativeClip = d.querySelector('.attachmentToggle___m40lT .anticon');
    w.eval(fs.readFileSync(require('node:path').join(__dirname, '../AI Agent/AI Agent本地Mock.js'), 'utf8'));
    await tick();
    assert.equal(nativeClip.parentElement, d.querySelector('.attachmentToggle___m40lT'));
    nativeClip.parentElement.removeChild(nativeClip); // React's upload-to-spinner transition must still own this node.
    const rows = [['照片.HEIC','image'],['方案....最终版.PDF','pdf'],['说明.doc','word'],['说明.DOCX','word'],['费率.xls','excel'],['费率.XLSX','excel'],['归档.zip',null]];
    const fixtures = rows.flatMap(([name,kind]) => [false,true].map(sent => ({row:add(name,sent),kind})));
    const skill = add('方案.pdf',false,true);
    await tick();
    for (const {row,kind} of fixtures) assert.equal(row.firstChild.getAttribute('data-gaip-file-icon'),kind);
    assert.equal(skill.firstChild.getAttribute('data-gaip-file-icon'),null);
    const row = fixtures[0].row, originalIcon = row.firstChild, remove = row.lastChild;
    row.children[1].firstChild.data = '更新.pdf';
    await tick();
    assert.equal(originalIcon.getAttribute('data-gaip-file-icon'),'pdf');
    row.children[1].textContent = '未知.zip';
    await tick();
    assert.equal(originalIcon.hasAttribute('data-gaip-file-icon'),false);
    assert.equal(row.firstChild,originalIcon);
    assert.equal(row.lastChild,remove);
    assert.equal(row.querySelectorAll('svg').length,1);
    console.log('PASS: pending/sent types, uppercase/legacy suffixes, live updates, fallback and React-owned nodes');
  } finally { w.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
