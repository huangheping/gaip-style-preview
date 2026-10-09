'use strict';
const assert = require('node:assert/strict');
const {validateProperties} = require('./check-knowledge-properties.cjs');
const validate = yaml => validateProperties('---\n' + yaml + '\n---\n# Note\n','fixture.md');
assert.deepEqual(validate('updated: 2026-09-22\ntags:\n  - project/gaip\nrelated: "[[knowledge/INDEX]]"'), []);
for (const value of ['tags: [first]\ntags: [second]', 'updated: 2026-02-30', 'related: [[knowledge/INDEX]]', 'tags: [123]', 'details:\n  nested: value', 'broken: [']) {
  assert.ok(validate(value).length, 'invalid properties must fail: ' + value);
}
assert.ok(validateProperties('---\nkey: value\n','fixture.md').length);
assert.deepEqual(validateProperties('# A note without optional properties\n','fixture.md'),[]);
assert.deepEqual(validateProperties('---\ndate: "{{date:YYYY-MM-DD}}"\n---\n','knowledge/模板/ADR模板.md'),[]);
assert.ok(validate('date: "{{date:YYYY-MM-DD}}"').length, 'an unexpanded template date is invalid in a real note');
console.log('PASS: properties checker rejects malformed YAML, duplicate keys, nested links/properties, invalid dates and invalid default lists.');
