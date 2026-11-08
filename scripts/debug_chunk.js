const fs = require('fs');
const html = fs.readFileSync('scripts/pharm_store_home.html', 'utf8');

const startIdx = html.indexOf('<ul id="categories">');
console.log('startIdx:', startIdx);
console.log('Sample chunk:\n', html.substring(startIdx, startIdx + 800));
