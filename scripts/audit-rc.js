/**
 * RC v1.0 — Auditoria de assets, links e referências
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const missing = [];
const checked = new Set();

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel.replace(/^\//, '')));
}

function scanText(file, text) {
  const patterns = [
    /assets\/[a-zA-Z0-9_\-./]+/g,
    /content\/[a-zA-Z0-9_\-./]+\.json/g
  ];
  patterns.forEach(re => {
    let m;
    while ((m = re.exec(text))) {
      const p = m[0].replace(/['")\s]+$/, '');
      const key = `${file}|${p}`;
      if (checked.has(key)) continue;
      checked.add(key);
      if (!exists(p)) missing.push({ file, path: p });
    }
  });
}

function walk(dir, skip = new Set(['node_modules', '.git', '.vscode'])) {
  const full = path.join(ROOT, dir);
  if (!fs.existsSync(full)) return;
  for (const e of fs.readdirSync(full, { withFileTypes: true })) {
    if (skip.has(e.name)) continue;
    const rel = dir ? `${dir}/${e.name}` : e.name;
    if (e.isDirectory()) walk(rel, skip);
    else if (/\.(json|html|js|css|xml)$/.test(e.name)) {
      scanText(rel, fs.readFileSync(path.join(ROOT, rel), 'utf8'));
    }
  }
}

walk('content');
walk('.', new Set(['node_modules', '.git', '.vscode', 'scripts']));

const byPath = {};
missing.forEach(m => {
  if (!byPath[m.path]) byPath[m.path] = [];
  byPath[m.path].push(m.file);
});

console.log(JSON.stringify({ missingCount: Object.keys(byPath).length, missing: byPath }, null, 2));
