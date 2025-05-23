// scraper/extractProduct.js — v1.9.1
const scrapeGuitarSalonSelenium = require('../shops/scrapeGuitarSalon.selenium');

async function extractProductInfo(url, method = 'selenium') {
  const hostname = new URL(url).hostname;

  if (hostname.includes('guitarsalon.com')) {
    return await scrapeGuitarSalonSelenium(url);
  }

  throw new Error('Unsupported website or method.');
}

module.exports = { extractProductInfo };
