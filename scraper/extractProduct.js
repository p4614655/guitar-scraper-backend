const scrapeGuitarSalon = require('../shops/scrapeGuitarSalon');

async function extractProductInfo(url) {
  if (url.includes('guitarsalon.com')) {
    return await scrapeGuitarSalon(url);
  }
  throw new Error('Unsupported shop URL.');
}

module.exports = { extractProductInfo };
