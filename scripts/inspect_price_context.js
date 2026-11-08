const fs = require('fs');
const html = fs.readFileSync('scripts/pharm_store_home.html', 'utf8');

const regex = /([A-Za-z0-9\s\-\(\)]+?)(?:<[^>]+>|\s)*\$\s*([0-9]+\.[0-9]{2})/g;
let match;
let count = 0;
while ((match = regex.exec(html)) !== null && count < 50) {
  const text = match[1].replace(/<[^>]+>/g, '').trim();
  const price = match[2];
  if (text.length > 2 && text.length < 80) {
    console.log(`- "${text}": $${price}`);
    count++;
  }
}
