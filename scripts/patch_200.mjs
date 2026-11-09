import fs from 'fs';

const path = 'D:/medtest/us-pharmacy/surge-deploy/200.html';
let html = fs.readFileSync(path, 'utf8');
const script = `<script>
(async function() {
  if (location.pathname && location.pathname !== '/' && location.pathname !== '/index.html') {
    try {
      const res = await fetch('https://us-pharmacy.pages.dev' + location.pathname + location.search);
      if (res.ok) {
        const text = await res.text();
        document.open();
        document.write(text);
        document.close();
      }
    } catch(e) {}
  }
})();
</script>`;

if (!html.includes('us-pharmacy.pages.dev')) {
  html = html.replace('<head>', '<head>' + script);
  fs.writeFileSync(path, html, 'utf8');
  console.log('Injected smart edge fallback into 200.html');
}
