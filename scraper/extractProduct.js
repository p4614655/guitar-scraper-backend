// scraper/extractProduct.js — v1.9.0
const scrapeGuitarSalonSelenium = require('../shops/scrapeGuitarSalon.selenium');

async function extractProductInfo(url, method = 'selenium') {
  const hostname = new URL(url).hostname;

  if (hostname.includes('guitarsalon.com')) {
    if (method === 'selenium') {
      return await scrapeGuitarSalonSelenium(url);
    }
  }

  throw new Error('Unsupported website or method.');
}

module.exports = { extractProductInfo };
