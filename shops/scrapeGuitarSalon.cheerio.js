// shops/scrapeGuitarSalon.cheerio.js
const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeGuitarSalon(url) {
  try {
    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    const $ = cheerio.load(html);

    const modelName = $('h1').first().text().trim() || 'N/A';
    const price = $('h3.price-new').first().text().trim() || 'N/A';
    const description = $('.col-sm-8.description').text().trim() || 'N/A';

    let luthier = 'N/A';
    const luthierLink = $('a[href*="/luthier/"]').first().text().trim();
    if (luthierLink) luthier = luthierLink;

    const specs = {};
    $('table tr').each((_, row) => {
      const cells = $(row).find('td');
      if (cells.length === 2) {
        const label = $(cells[0]).text().trim().toLowerCase();
        const value = $(cells[1]).text().trim();
        specs[label] = value;
      }
    });

    const allImages = [];
    $('img').each((_, img) => {
      const src = $(img).attr('src');
      if (src && src.includes('/product/')) {
        const fullUrl = src.startsWith('http') ? src : `https://www.guitarsalon.com${src}`;
        allImages.push(fullUrl);
      }
    });

    const uniqueImages = [...new Set(allImages)].slice(0, 5);

    return {
      "Model Name": modelName,
      "Year": specs['year'] || '2025',
      "Top Wood": specs['top'] || 'Spruce',
      "Back and Sides Wood": specs['back & sides'] || 'African Rosewood',
      "Fingerboard": specs['fingerboard'] || 'N/A',
      "Price": price,
      "Condition": specs['condition'] || 'New',
      "Description": description,
      "Images": uniqueImages.length ? uniqueImages : [`See more: ${url}`],
      "url": url,
      "luthier": luthier || 'N/A'
    };
  } catch (err) {
    console.error('[Cheerio] Scraper failed:', err.message);
    throw new Error('Cheerio scraper failed');
  }
}

module.exports = scrapeGuitarSalon;
