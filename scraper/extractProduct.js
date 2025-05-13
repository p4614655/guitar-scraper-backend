// scraper/extractProduct.js — v1.8.0
const scrapeGuitarSalonSelenium = require('../shops/scrapeGuitarSalon.selenium');
// const scrapeGuitarSalonPuppeteer = require('../shops/scrapeGuitarSalon'); // Optional: fallback if needed

async function extractProductInfo(url, method = 'selenium') {
  const hostname = new URL(url).hostname;

  if (hostname.includes('guitarsalon.com')) {
    if (method === 'selenium') {
      return await scrapeGuitarSalonSelenium(url);
    }
    // else if (method === 'puppeteer') {
    //   return await scrapeGuitarSalonPuppeteer(url);
    // }
  }

  throw new Error('Unsupported website or method.');
}

module.exports = { extractProductInfo };
