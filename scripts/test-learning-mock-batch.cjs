'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'features/learning-center/learning-data.js'), 'utf8');
const key = 'gaip-learning-v11';
const batch = 'course-management-20260909';
function load(saved) {
  const dom = new JSDOM('', { url: 'https://local.example/', runScripts: 'outside-only' });
  const w = dom.window;
  if (saved) w.localStorage.setItem(key, JSON.stringify(saved));
  Object.defineProperty(w.document, 'currentScript', { value: { src: 'https://local.example/features/learning-center/learning-data.js' } });
  w.eval(source);
  const state = JSON.parse(JSON.stringify(w.__GAIP_LEARNING_DATA__.state()));
  const stored = JSON.parse(w.localStorage.getItem(key));
  dom.window.close();
  return { state, stored };
}
const fresh = load();
assert.equal(fresh.state.courses.length, 32);
assert.deepEqual(fresh.stored, fresh.state);
const mocks = fresh.state.courses.filter(c => c.id.startsWith('mock-course-'));
assert.equal(mocks.length, 24);
assert.deepEqual(['published', 'draft', 'offline'].map(s => mocks.filter(c => c.status === s).length), [12, 6, 6]);
const lessonIds = new Set();
for (const c of mocks) {
  assert.ok(fs.existsSync(path.join(root, c.image)), c.image);
  assert.ok(c.lessons.length > 0 && c.lessons.length <= 12);
  assert.ok(c.groups.length && !c.groups.includes('all') || c.groups.length === 1);
  assert.ok(c.createdAt <= c.updatedAt);
  assert.equal(c.everPublished, c.status !== 'draft');
  assert.ok(c.lessons.filter(l => l.type === 'pdf').length <= 1);
  for (const l of c.lessons) {
    assert.ok(!lessonIds.has(l.id)); lessonIds.add(l.id);
    assert.equal(l.file.mock, true);
    assert.equal(l.status, c.status === 'published' ? 'published' : 'offline');
  }
}
const legacy = structuredClone(fresh.state);
delete legacy.mockBatches;
legacy.courses = legacy.courses.filter(c => !c.id.startsWith('mock-course-'));
for (const k of Object.keys(legacy.completions)) if (k.includes('/mock-course-')) delete legacy.completions[k];
legacy.courses[0].title = '用户已编辑的课程';
legacy.logs.push({ id: 'user-log', details: '保留既有记录' });
const migrated = load(legacy);
assert.deepEqual(migrated.state.courses.slice(0, 8), legacy.courses);
for (const field of ['records', 'logs', 'users', 'userId']) assert.deepEqual(migrated.state[field], legacy[field]);
for (const k of Object.keys(legacy.completions)) assert.deepEqual(migrated.state.completions[k], legacy.completions[k]);
assert.equal(migrated.state.courses.length, 32);
assert.equal(migrated.state.mockBatches[batch], true);
assert.deepEqual(load(migrated.stored).state, migrated.state, 'reload must not duplicate courses');
const removed = structuredClone(migrated.state);
const draft = mocks.find(c => c.status === 'draft');
removed.courses = removed.courses.filter(c => c.id !== draft.id);
assert.ok(!load(removed).state.courses.some(c => c.id === draft.id), 'deleted sample must stay deleted');
const collision = structuredClone(legacy);
collision.courses.push({ ...mocks[0], title: '同ID已有编辑内容' });
const merged = load(collision).state;
assert.equal(merged.courses.length, 32);
assert.equal(merged.courses.find(c => c.id === mocks[0].id).title, '同ID已有编辑内容');
console.log('PASS: 24 mock courses, additive migration, local edits/history, reload and deletion safety');
