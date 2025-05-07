// Version 1.8.1

// extractProduct.js
const scrapeGuitarSalon = require('../shops/scrapeGuitarSalon.selenium');

async function extractProductInfo(url) {
  if (url.includes('guitarsalon.com')) {
    return await scrapeGuitarSalon(url);
  }
  throw new Error('No matching scraper found for the given URL.');
}

module.exports = { extractProductInfo };
