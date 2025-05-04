// scraper/extractProduct.js
const puppeteer = require('puppeteer');
const { parseProductInfo } = require('../utils/gptParser');
const { scrapeGuitarSalon } = require('../shops/scrapeGuitarSalon');

async function extractProductInfo(url) {
  try {
    // ✅ Use Guitar Salon-specific scraper
    if (url.includes('guitarsalon.com')) {
      console.log('🔎 Using GSI scraper for:', url);
      return await scrapeGuitarSalon(url);
    }

    // 🔁 Fallback to generic GPT-based scraping
    const browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await new Promise(resolve => setTimeout(resolve, 3000));

    const htmlContent = await page.content();
    await browser.close();

    const result = await parseProductInfo(htmlContent);
    result.url = url;
    return result;
  } catch (error) {
    console.error('Error scraping page:', error.message);
    throw new Error(`Error scraping page: ${error.message}`);
  }
}

module.exports = { extractProductInfo };
