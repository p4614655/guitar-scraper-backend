const puppeteer = require('puppeteer-core');

async function scrapeGuitarSalon(url) {
  console.log(`[Puppeteer] Navigating to: ${url}`);

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  try {
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    const modelName = await page.$eval('h1', el => el.innerText.trim()).catch(() => 'N/A');

    const luthier = modelName.replace(/^20\d{2}\s*/, '').split(' ').slice(0, 2).join(' ');

    const price = await page.$$eval('h3', els =>
      els.map(el => el.innerText.trim()).find(text => text.includes('$')) || 'N/A'
    );

    const availability = await page.$x("//div[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'sold')]")
      .then(sold => sold.length > 0 ? 'Sold' : 'Available')
      .catch(() => 'Available');

    await browser.close();

    return {
      "Model Name": modelName,
      "Price": price,
      "Availability": availability,
      "url": url,
      "luthier": luthier
    };
  } catch (err) {
    await browser.close();
    console.error('[Puppeteer Error]', err.message);
    throw new Error('Failed to scrape with Puppeteer.');
  }
}

module.exports = scrapeGuitarSalon;
