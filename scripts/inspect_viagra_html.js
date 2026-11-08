const fs = require('fs');
const html = fs.readFileSync('scripts/pharm_store_home.html', 'utf8');

const idx = html.indexOf('Viagra');
if (idx !== -1) {
  console.log('Viagra context:\n', html.substring(Math.max(0, idx - 400), idx + 600));
}
