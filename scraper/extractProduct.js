const { scrapeGuitarSalon } = require('../shops/scrapeGuitarSalon');

async function extractProductInfo(url) {
  try {
    if (url.includes('guitarsalon.com')) {
      return await scrapeGuitarSalon(url);
    }

    throw new Error('Unsupported URL');
  } catch (err) {
    throw new Error(`Error extracting product info: ${err.message}`);
  }
}

module.exports = { extractProductInfo };
