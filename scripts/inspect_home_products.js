const fs = require('fs');
const html = fs.readFileSync('scripts/pharm_store_home.html', 'utf8');

// Search for product titles or price patterns
const lines = html.split('\n');
console.log('Total HTML lines:', lines.length);

// Let's find links inside the main content
const productRegex = /<a[^>]+href="([^"]+)"[^>]*>[\s\S]*?<\/a>/gi;
const items = [];
let match;

// Look for patterns like pill name, dosage, price ($...)
const priceRegex = /\$\s*([0-9]+\.[0-9]{2})/g;
const prices = [...html.matchAll(priceRegex)].map(m => m[1]);
console.log('Sample prices found:', prices.slice(0, 20));

// Find all distinct hrefs that look like products (e.g. /Viagra, /Cialis, /Levitra, /Amoxicillin, etc.)
const hrefRegex = /href="\/([a-zA-Z0-9\-_]+)"/g;
const slugs = new Set();
while ((match = hrefRegex.exec(html)) !== null) {
  const slug = match[1];
  if (!['categories', 'templates', 'css', 'js', 'images', 'contact', 'about', 'faq', 'policy', 'cart', 'checkout', 'orders'].includes(slug.toLowerCase())) {
    slugs.add(slug);
  }
}

console.log('Product slugs found on home page:', Array.from(slugs));
