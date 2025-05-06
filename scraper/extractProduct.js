// Version 1.8.1
const scrapeGuitarSalon = require('../shops/scrapeGuitarSalon.selenium');

async function extractProductInfo(url) {
  if (url.includes('guitarsalon.com')) {
    return await scrapeGuitarSalon(url);
  } else {
    throw new Error('Unsupported domain.');
  }
}

module.exports = { extractProductInfo };
