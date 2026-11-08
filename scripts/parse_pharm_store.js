const http = require('http');
const fs = require('fs');

const options = {
  hostname: 'pharm-store.com',
  port: 80,
  path: '/?id=924',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cookie': 'lang=en; currency=USD; country_code=US; country_name=United States; id=924;',
    'Referer': 'https://www.google.com/'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    fs.writeFileSync('scripts/pharm_store_home.html', data, 'utf8');
    console.log('Saved pharm_store_home.html. Total length:', data.length);

    // Find links to categories and products
    const links = [];
    const linkRegex = /href="([^"#\s]+)"[^>]*>([^<]+)<\/a>/gi;
    let match;
    while ((match = linkRegex.exec(data)) !== null) {
      links.push({ url: match[1], text: match[2].trim() });
    }
    console.log('Total links found:', links.length);

    // Filter potential product links
    const productLinks = links.filter(l => 
      !l.url.startsWith('javascript') && 
      !l.url.includes('contact') && 
      !l.url.includes('about') && 
      !l.url.includes('faq') && 
      !l.url.includes('policy') &&
      !l.url.includes('testimonials') &&
      !l.url.includes('cart') &&
      !l.url.includes('checkout') &&
      l.text.length > 2
    );

    console.log('Sample product/category links:');
    console.log(productLinks.slice(0, 30));
  });
});

req.on('error', console.error);
req.end();
