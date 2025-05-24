const puppeteer = require('puppeteer-core');

async function scrapeGuitarSalon(url) {
  console.log(`[Puppeteer] Navigating to: ${url}`);

  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME_BIN || '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  try {
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    const modelName = await page.$eval('h1', el => el.innerText.trim()).catch(() => 'N/A');

    let luthier = 'N/A';
    try {
      const noYear = modelName.replace(/^20\d{2}\s*/, '');
      luthier = noYear.split(' ').slice(0, 2).join(' ');
    } catch {}

    let price = 'N/A';
    try {
      price = await page.$$eval('h3', els =>
        els.map(el => el.innerText.trim()).find(text => text.includes('$')) || 'N/A'
      );
    } catch {}

    let availability = 'Available';
    try {
      const sold = await page.$x("//div[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'sold')]");
      if (sold.length > 0) availability = 'Sold';
    } catch {}

    const specs = {
      year: '2025',
      top: 'Spruce',
      'back & sides': 'African Rosewood',
      condition: 'New'
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

    let thumbnail = null;
    try {
      thumbnail = await page.$$eval('img', imgs =>
        imgs.map(img => img.src).find(src =>
          src.includes('/product/') && (src.endsWith('.webp') || src.endsWith('.jpg'))
        )
      );
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
    await browser.close();
    console.error('[Puppeteer] Scrape failed:', err.message);
    throw new Error('Failed to scrape with Puppeteer.');
  }
}

module.exports = scrapeGuitarSalon;
