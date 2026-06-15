const http = require('http');
const url = 'http://localhost:5174/asosiy/pitaniya/pitaniya1.jpeg';
http.get(url, (res) => {
  console.log('STATUS', res.statusCode);
  console.log('URL', url);
  res.resume();
}).on('error', (e) => {
  console.error('ERR', e.message);
});
