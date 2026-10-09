'use strict';
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..');
const dom = new JSDOM('<body></body>', {url:'https://preview.test/channels/learning-center/index.html',runScripts:'outside-only'});
const w = dom.window;
Object.defineProperty(w.document, 'currentScript', {value:{src:'https://preview.test/channels/learning-center/learning-data.js'}});
w.eval(fs.readFileSync(path.join(root,'channels/learning-center/learning-data.js'),'utf8'));
const D = w.__GAIP_LEARNING_DATA__;
D.course('c1').image = 'assets/learning/course-01-arkos.jpg';
D.persist();
const before = w.localStorage.getItem('gaip-learning-v11');
for (const image of fs.readdirSync(path.join(root,'channels/learning-center/assets/images'))) {
  if (!/\.(jpg|jpeg|png|webp)$/.test(image)) continue;
  const expected = 'https://preview.test/channels/learning-center/assets/images/' + image;
  assert.equal(D.assetURL('assets/learning/' + image), expected);
  assert.equal(D.assetURL('./assets/learning/' + image), expected);
  assert.equal(D.assetURL('channels/learning-center/assets/images/' + image), expected);
}
for (const value of ['data:image/png;base64,AA==', 'blob:https://preview.test/upload', 'https://other.test/assets/learning/cover.jpg']) assert.equal(D.assetURL(value), value);
assert.equal(w.localStorage.getItem('gaip-learning-v11'), before, 'resolving old images must not mutate saved data');
assert.equal(D.course('c1').image, 'assets/learning/course-01-arkos.jpg');
for (const file of ['learning-app.js', 'learning-live.js']) assert.match(fs.readFileSync(path.join(root,'channels/learning-center',file),'utf8'), /return D\.assetURL\(path\)/);
dom.window.close();
console.log('PASS: saved legacy covers resolve to owned assets; uploads, remote URLs and stored data remain unchanged.');
