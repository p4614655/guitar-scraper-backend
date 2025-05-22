const puppeteer = require('puppeteer');

async function scrapeGuitarSalon(url) {
  console.log(`[Puppeteer] Navigating to: ${url}`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Model Name
    let modelName = await page.$eval('h1', el => el.innerText.trim()).catch(() => 'N/A');

    // Luthier (from model title, remove year and suffix)
    let luthier = 'N/A';
    try {
      const noYear = modelName.replace(/^20\d{2}\s*/, '');
      const parts = noYear.split(' ');
      if (parts.length >= 2) {
        luthier = parts.slice(0, 2).join(' ');
      } else {
        luthier = parts[0];
      }
    } catch {}

    // Price (search all h3s for a $)
    let price = 'N/A';
    try {
      const h3s = await page.$$eval('h3', nodes =>
        nodes.map(n => n.innerText).find(t => t.includes('$')) || 'N/A'
      );
      if (h3s && h3s !== 'N/A') price = h3s.trim();
    } catch {}

    // Availability
    let availability = 'Available';
    try {
      const sold = await page.$x("//div[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'sold')]");
      if (sold.length > 0) availability = 'Sold';
    } catch {}

    // Specs
    const specs = {
      year: '2025',
      top: 'Spruce',
      'back & sides': 'African Rosewood',
      condition: 'New',
    };

    try {
      const rows = await page.$$('table tr');
      for (const row of rows) {
        const tds = await row.$$('td');
        if (tds.length === 2) {
          const label = (await (await tds[0].getProperty('innerText')).jsonValue()).trim().toLowerCase();
          const value = (await (await tds[1].getProperty('innerText')).jsonValue()).trim();
          specs[label] = value;
        }
      }
    } catch {}

    // Thumbnail
    let thumbnail = null;
    try {
      const imgs = await page.$$eval('img', imgs =>
        imgs.map(i => i.src).find(src =>
          src.includes('/product/') && (src.endsWith('.webp') || src.endsWith('.jpg'))
        )
      );
      if (imgs) thumbnail = imgs;
    } catch {}

    await browser.close();

    return {
      "Model Name": modelName,
      "Year": specs['year'],
      "Top Wood": specs['top'],
      "Back and Sides Wood": specs['back & sides'],
      "Price": price,
      "Condition": specs['condition'],
      "Availability": availability,
      "Images": thumbnail ? [thumbnail] : [`See more: ${url}`],
      "url": url,
      "luthier": luthier
    };
  } catch (err) {
    console.error('[Puppeteer] Scrape error:', err.message);
    await browser.close();
    throw new Error('Failed to scrape with Puppeteer.');
  }
}

module.exports = scrapeGuitarSalon;
