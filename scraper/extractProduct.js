// Version 1.7.7
const scrapeGuitarSalon = require('../shops/scrapeGuitarSalon.selenium');

async function extractProductInfo(url) {
  if (url.includes('guitarsalon.com')) {
    return await scrapeGuitarSalon(url);
  }
  throw new Error('Unsupported URL: No scraper configured for this domain.');
}

module.exports = { extractProductInfo };
