import fs from 'fs';

const file = 'D:/medtest/us-pharmacy/links.txt';
const content = fs.readFileSync(file, 'utf-8');
const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

console.log('Total non-empty lines:', lines.length);

const domainCounts = {};
let validUrls = 0;
let invalidLines = 0;
const uniqueSet = new Set();

for (const line of lines) {
  if (line.startsWith('http://') || line.startsWith('https://')) {
    validUrls++;
    uniqueSet.add(line);
    try {
      const u = new URL(line);
      domainCounts[u.hostname] = (domainCounts[u.hostname] || 0) + 1;
    } catch {}
  } else {
    invalidLines++;
    console.log('INVALID LINE:', line);
  }
}

console.log('Valid URLs:', validUrls);
console.log('Unique URLs:', uniqueSet.size);
console.log('Invalid Lines:', invalidLines);
console.log('\nBreakdown by domain:');
for (const [dom, count] of Object.entries(domainCounts).sort((a,b) => b[1] - a[1])) {
  console.log(`- ${dom}: ${count}`);
}
