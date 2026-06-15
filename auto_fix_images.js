const fs = require('fs');
const path = require('path');
const root = __dirname;
const dataFile = path.join(root, 'src', 'data', 'menuData.js');
let txt = fs.readFileSync(dataFile, 'utf8');
const re = /rasm\s*:\s*"([^"]+)"/g;
let m;
const changes = [];
const tried = new Set();
while ((m = re.exec(txt)) !== null) {
  const orig = m[1];
  if (tried.has(orig)) continue;
  tried.add(orig);
  const rel = orig.replace(/^\//, '');
  const full = path.join(root, rel);
  if (fs.existsSync(full)) continue;
  const dir = path.dirname(full);
  const base = path.basename(full, path.extname(full)).toLowerCase();
  if (!fs.existsSync(dir)) {
    // try searching entire public for a matching basename
    const publicDir = path.join(root, 'public');
    if (!fs.existsSync(publicDir)) continue;
    const all = getAllFiles(publicDir);
    const found = all.find(f => path.basename(f, path.extname(f)).toLowerCase() === base);
    if (found) {
      const newRel = '/' + path.relative(root, found).replace(/\\/g, '/');
      txt = txt.split(orig).join(newRel);
      changes.push({ from: orig, to: newRel, reason: 'found elsewhere in public' });
    }
    continue;
  }
  const files = fs.readdirSync(dir);
  const candidate = files.find(fn => path.basename(fn, path.extname(fn)).toLowerCase() === base);
  if (candidate) {
    const newRel = '/' + path.relative(root, path.join(dir, candidate)).replace(/\\/g, '/');
    txt = txt.split(orig).join(newRel);
    changes.push({ from: orig, to: newRel, reason: 'matched different extension' });
    continue;
  }
  // try common extensions
  const exts = ['.jpg', '.jpeg', '.png', '.webp'];
  const foundExt = exts.find(ext => fs.existsSync(path.join(dir, base + ext)));
  if (foundExt) {
    const candidate = base + foundExt;
    const newRel = '/' + path.relative(root, path.join(dir, candidate)).replace(/\\/g, '/');
    txt = txt.split(orig).join(newRel);
    changes.push({ from: orig, to: newRel, reason: 'found with common ext' });
    continue;
  }
}
if (changes.length > 0) {
  fs.copyFileSync(dataFile, dataFile + '.bak');
  fs.writeFileSync(dataFile, txt, 'utf8');
}
fs.writeFileSync(path.join(root, 'auto_fix_report.json'), JSON.stringify({ changes }, null, 2));
console.log('DONE', changes.length);
function getAllFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const p = path.join(dir, file);
    const stat = fs.statSync(p);
    if (stat && stat.isDirectory()) results = results.concat(getAllFiles(p));
    else results.push(p);
  });
  return results;
}
