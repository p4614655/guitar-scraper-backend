// Version 1.8.2 – scraper/extractProduct.js
const scrapeGuitarSalon = require('../shops/scrapeGuitarSalon.selenium');

async function extractProductInfo(url) {
  if (url.includes('guitarsalon.com')) {
    return await scrapeGuitarSalon(url);
  }
  throw new Error('Unsupported shop URL.');
}

module.exports = { extractProductInfo };
