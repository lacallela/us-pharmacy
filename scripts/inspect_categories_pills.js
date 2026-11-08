const fs = require('fs');
const pills = require('./extracted_pharm_store_drugs.json');

console.log('Total pills:', pills.length);

// Group by category path
const byCat = {};
for (const p of pills) {
  const parts = p.path.split('/').filter(Boolean);
  const cat = parts[1] || 'Other';
  byCat[cat] = byCat[cat] || [];
  byCat[cat].push(p);
}

for (const [cat, list] of Object.entries(byCat)) {
  console.log(`${cat} (${list.length}):`, list.slice(0, 5).map(x => x.name).join(', '));
}
