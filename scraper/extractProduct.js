// scraper/extractProduct.js
const scrapeGuitarSalon = require('../shops/scrapeGuitarSalon.selenium');

async function extractProductInfo(url) {
  if (url.includes('guitarsalon.com')) {
    return await scrapeGuitarSalon(url);
  }

  throw new Error('No scraper available for this URL');
}

module.exports = { extractProductInfo };
