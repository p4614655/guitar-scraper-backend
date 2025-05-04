// scraper/extractProduct.js
const { scrapeGuitarSalon } = require('../shops/scrapeGuitarSalon');
const axios = require('axios');

async function extractProductInfo(url) {
  try {
    if (url.includes('guitarsalon.com')) {
      return await scrapeGuitarSalon(url);
    } else {
      throw new Error('Unsupported domain');
    }
  } catch (err) {
    console.error('Primary scraper failed, trying fallback (Selenium)...');

    try {
      const fallbackResponse = await axios.get(
        `https://your-railway-subdomain.up.railway.app/api/scrape-selenium?url=${encodeURIComponent(url)}`
      );
      return fallbackResponse.data;
    } catch (fallbackError) {
      throw new Error(`Both scrapers failed: ${fallbackError.message}`);
    }
  }
}

module.exports = { extractProductInfo };
