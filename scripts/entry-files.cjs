'use strict';
const fs = require('node:fs'), path = require('node:path');
// Registered entries are the coverage set; do not silently filter missing files.
module.exports = function entryFiles(root, { includeLocal = false } = {}) {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'shared/config/project-structure.json'), 'utf8'));
  return [manifest.projectEntry, ...[...manifest.channels, ...manifest.extraEntries]
    .filter(entry => !entry.localOnly || (includeLocal && fs.existsSync(path.join(root, entry.entry))))
    .map(entry => entry.entry)].filter(Boolean);
};
