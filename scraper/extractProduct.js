// scraper/extractProduct.js
const scrapeGuitarSalon = require('../shops/scrapeGuitarSalon.selenium');

async function extractProductInfo(url) {
  if (url.includes('guitarsalon.com')) {
    return await scrapeGuitarSalon(url);
  } else {
    throw new Error('Website not supported.');
  }
}

module.exports = { extractProductInfo };
