const axios = require('axios');
const cheerio = require('cheerio');

async function extractProductInfo(url) {
  const { data: html } = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0'
    }
  });
  const $ = cheerio.load(html);

  const modelName = $('h1').first().text().trim() || 'www.guitarsalon.com';
  const price = $('h3.price-new').first().text().trim() || 'N/A';
  const description = $('div.col-sm-8.description.first-letter-big').text().trim() || 'N/A';

  let luthier = $('a[href*="/luthier/"]').first().text().trim();
  if (!luthier) {
    luthier = modelName.includes('"')
      ? modelName.split('"')[0].trim().replace(/^202\d\s*/, '')
      : modelName.split(' ')[0].trim();
  }

  const specs = {};
  $('table tr').each((_, row) => {
    const tds = $(row).find('td');
    if (tds.length === 2) {
      const key = $(tds[0]).text().trim().toLowerCase();
      const val = $(tds[1]).text().trim();
      specs[key] = val;
    }
  });

  const allImages = [];
  $('img').each((_, img) => {
    const src = $(img).attr('src');
    if (src && src.includes('/product/')) {
      allImages.push('https://www.guitarsalon.com' + src);
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
    "luthier": luthier
  };
}

module.exports = { extractProductInfo };
