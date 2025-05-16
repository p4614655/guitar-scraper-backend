// scraper/extractProduct.js — v1.8.3
const scrapeGuitarSalonSelenium = require('../shops/scrapeGuitarSalon.selenium');

async function extractProductInfo(url, method = 'selenium') {
  const hostname = new URL(url).hostname;

  if (hostname.includes('guitarsalon.com')) {
    if (method === 'selenium') {
      return await scrapeGuitarSalonSelenium(url);
    }
  }

  throw new Error('Unsupported website or scraping method.');
}

module.exports = { extractProductInfo };
