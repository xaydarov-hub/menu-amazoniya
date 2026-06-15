const fs = require('fs');
const path = require('path');
const dataPath = path.join(__dirname, 'src', 'data', 'menuData.js');
try {
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
  fs.writeFileSync(path.join(__dirname, 'missing_images.json'), JSON.stringify(missing, null, 2));
  console.log('WROTE', missing.length);
} catch (e) {
  fs.writeFileSync(path.join(__dirname, 'missing_images.json'), JSON.stringify({ error: e.message }, null, 2));
  console.error('ERR', e.message);
}
