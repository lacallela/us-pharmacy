const fs = require('fs');
const html = fs.readFileSync('scripts/pharm_store_home.html', 'utf8');

const regex = /<a[^>]*href="(\/categories\/([^"\/]+)\/([^"\/]+))"[^>]*><span class="name">([^<]+)<\/span><span class="price">\$([0-9\.]+)<\/span><\/a>/g;
const allPills = [];
const seenSlugs = new Set();

let match;
while ((match = regex.exec(html)) !== null) {
  const fullPath = match[1];
  const catRaw = match[2];
  const slugRaw = match[3];
  const name = match[4].trim();
  const price = parseFloat(match[5]);

  if (slugRaw.toLowerCase() === 'all') continue;

  const slug = slugRaw.toLowerCase();
  const category = catRaw.replace(/-/g, ' ');

  if (!seenSlugs.has(slug)) {
    seenSlugs.add(slug);
    allPills.push({
      name,
      slug,
      category,
      path: fullPath,
      pricePerPill: price,
      affiliateUrl: `http://pharm-store.com${fullPath}?id=924`
    });
  }
}

console.log('Total unique medications extracted:', allPills.length);
console.log('First 20 medications:');
console.log(allPills.slice(0, 20));

fs.writeFileSync('scripts/extracted_pharm_store_drugs.json', JSON.stringify(allPills, null, 2), 'utf8');
