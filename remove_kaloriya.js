const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'data', 'menuData.js');
const bak = file + '.bak';
let txt = fs.readFileSync(file, 'utf8');
fs.writeFileSync(bak, txt, 'utf8');
const lines = txt.split('\n');
let startIdx = -1, endIdx = lines.length;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('ПРАВИЛЬНОЕ ПИТАНИЕ') || lines[i].includes('ПРАВИЛНОЕ ПИТАНИЕ')) { startIdx = i; break; }
}
if (startIdx === -1) {
  console.error('Start section not found'); process.exit(1);
}
for (let i = startIdx + 1; i < lines.length; i++) {
  if (/^\/\/ ──/.test(lines[i])) { endIdx = i; break; }
}
let removed = 0;
const out = lines.filter((ln, idx) => {
  if (/\bkaloriya\s*:\s*[^,]+,?\s*$/.test(ln)) {
    if (idx < startIdx || idx >= endIdx) { removed++; return false; }
  }
  return true;
});
fs.writeFileSync(file, out.join('\n'), 'utf8');
// count remaining
const remain = out.join('\n').match(/\bkaloriya\s*:/g) || [];
console.log('REMOVED', removed, 'REMAINING', remain.length);
process.exit(0);
