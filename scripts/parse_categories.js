const fs = require('fs');
const html = fs.readFileSync('scripts/pharm_store_home.html', 'utf8');

const catBlockRegex = /<li class="li-([a-zA-Z0-9\-_]+)[^"]*"><i><\/i><a href="\/categories\/[^"]+">([^<]+)<\/a><ul>([\s\S]*?)<\/ul><\/li>/gi;
const allPillsMap = new Map();
let catMatch;

while ((catMatch = catBlockRegex.exec(html)) !== null) {
  const catSlug = catMatch[1];
  const catName = catMatch[2].trim();
  const catInnerHtml = catMatch[3];

  const pillRegex = /<a[^>]*href="(\/categories\/([^"\/]+)\/([^"\/]+))"[^>]*><span class="name">([^<]+)<\/span><span class="price">\$([0-9\.]+)<\/span><\/a>/gi;
  let pillMatch;
  while ((pillMatch = pillRegex.exec(catInnerHtml)) !== null) {
    const fullPath = pillMatch[1];
    const itemSlug = pillMatch[3].toLowerCase();
    const name = pillMatch[4].trim();
    const price = parseFloat(pillMatch[5]);

    if (itemSlug === 'all') continue;

    if (!allPillsMap.has(itemSlug)) {
      allPillsMap.set(itemSlug, {
        name,
        slug: itemSlug,
        category: catName === 'Bestsellers' ? 'Popular Medications' : catName,
        pricePerPill: price,
        path: fullPath,
        affiliateUrl: `http://pharm-store.com${fullPath}?id=924`
      });
    } else {
      // If previously categorized under Bestsellers, update to specific category!
      const existing = allPillsMap.get(itemSlug);
      if (existing.category === 'Popular Medications' && catName !== 'Bestsellers') {
        existing.category = catName;
      }
    }
  }
}

const list = Array.from(allPillsMap.values());
console.log('Total categorized pills:', list.length);

// Count per category
const catCounts = {};
for (const p of list) {
  catCounts[p.category] = (catCounts[p.category] || 0) + 1;
}
console.log('Categories count:', catCounts);

// Take top 100 popular medications
const top100 = list.slice(0, 100);
fs.writeFileSync('scripts/top100_pharm_store.json', JSON.stringify(top100, null, 2), 'utf8');
console.log('Saved 100 medications to scripts/top100_pharm_store.json');
