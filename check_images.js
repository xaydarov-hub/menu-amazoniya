const fs = require('fs');
const path = require('path');
const dataPath = path.join(__dirname, 'src', 'data', 'menuData.js');
const txt = fs.readFileSync(dataPath, 'utf8');
const re = /rasm\s*:\s*"([^"]+)"/g;
let m;
const seen = new Set();
const missing = [];
while ((m = re.exec(txt)) !== null) {
  const p = m[1];
  if (seen.has(p)) continue;
  seen.add(p);
  const rel = p.replace(/^\//, '');
  const full = path.join(__dirname, rel);
  if (!fs.existsSync(full)) missing.push({ rasm: p, expected: full });
}
if (missing.length === 0) {
  console.log('ALL_EXIST');
} else {
  console.log('MISSING_COUNT:' + missing.length);
  missing.forEach((x) => console.log(x.rasm + ' -> ' + x.expected));
}
process.exit(0);
