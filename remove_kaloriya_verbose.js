const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'data', 'menuData.js');
let txt = fs.readFileSync(file, 'utf8');
const lines = txt.split('\n');
let startIdx = -1, endIdx = lines.length;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('ПРАВИЛЬНОЕ ПИТАНИЕ') || lines[i].includes('ПРАВИЛНОЕ ПИТАНИЕ')) { startIdx = i; break; }
}
console.log('startIdx', startIdx);
for (let i = startIdx + 1; i < lines.length; i++) {
  if (/^\/\/ ──/.test(lines[i])) { endIdx = i; break; }
}
console.log('endIdx', endIdx);
let totalKal = 0;
for (let i=0;i<lines.length;i++) if (/\bkaloriya\s*:/.test(lines[i])) totalKal++;
console.log('total kaloriya before', totalKal);
let removed = 0;
const out = lines.filter((ln, idx) => {
  if (/\bkaloriya\s*:\s*[^,]+,?\s*$/.test(ln)) {
    if (idx < startIdx || idx >= endIdx) { removed++; return false; }
  }
  return true;
});
let afterKal = 0; for (let i=0;i<out.length;i++) if (/\bkaloriya\s*:/.test(out[i])) afterKal++;
console.log('removed', removed, 'remaining', afterKal);
fs.writeFileSync(file + '.test', out.join('\n'), 'utf8');
console.log('wrote test file', file + '.test');
