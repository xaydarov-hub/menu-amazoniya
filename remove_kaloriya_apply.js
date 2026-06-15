const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'data', 'menuData.js');
let txt = fs.readFileSync(file, 'utf8');
const startMarker = '// ── 1. ПРАВИЛЬНОЕ ПИТАНИЕ';
const endMarker = '// ── 2.';
const startIdx = txt.indexOf(startMarker);
if (startIdx === -1) { console.error('Start marker not found'); process.exit(1); }
const endIdx = txt.indexOf(endMarker, startIdx);
const pre = txt.slice(0, startIdx);
const mid = txt.slice(startIdx, endIdx === -1 ? txt.length : endIdx);
const post = endIdx === -1 ? '' : txt.slice(endIdx);
const kalRe = /\r?\n\s*kaloriya\s*:\s*[^,\r\n]+,?/g;
const pre2 = pre.replace(kalRe, '');
const post2 = post.replace(kalRe, '');
fs.copyFileSync(file, file + '.bak');
fs.writeFileSync(file, pre2 + mid + post2, 'utf8');
console.log('Backup created at', file + '.bak');
console.log('Applied removal and saved', file);
