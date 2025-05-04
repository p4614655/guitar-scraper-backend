// shops/scrapeGuitarSalon.js
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function scrapeGuitarSalon(url) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ]
  });

  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 90000 });

    await autoScroll(page);
    await delay(3000);

    const modelName = await page.$eval('h1', el => el.textContent.trim()).catch(() => 'N/A');
    const price = await page.$eval('.price', el => el.textContent.trim()).catch(() => 'N/A');
    const description = await page.$eval('.product-summary-container', el => el.textContent.trim()).catch(() => 'N/A');

    let luthier = 'N/A';
    if (modelName.includes('"')) {
      luthier = modelName.split('"')[0].trim().replace(/^202\d\s*/, '');
    } else {
      luthier = modelName.split(' ')[0].trim();
    }

    const specs = await page.$$eval('table tr', rows => {
      const out = {};
      rows.forEach(row => {
        const tds = row.querySelectorAll('td');
        if (tds.length === 2) {
          const label = tds[0].textContent.trim().toLowerCase();
          const value = tds[1].textContent.trim();
          out[label] = value;
        }
      });
      return out;
    });

    // Get first valid image from product folder
    const allImages = await page.$$eval('img', imgs =>
      imgs.map(img => img.getAttribute('src')).filter(Boolean)
    );
    const productFolder = url.match(/\/product\/([^/]+)/)?.[1];
    const filtered = allImages.filter(src => src.includes(`/product/${productFolder}/`));
    const uniqueImages = [...new Set(filtered)].slice(0, 1); // Keep only 1 for now

    const result = {
      "Model Name": modelName,
      "Year": specs['year'] || '2025',
      "Top Wood": specs['top'] || 'Spruce',
      "Back and Sides Wood": specs['back & sides'] || 'African Rosewood',
      "Fingerboard": specs['fingerboard'] || 'N/A',
      "Price": price,
      "Condition": specs['condition'] || 'New',
      "Description": description,
      "Images": uniqueImages.length > 0 ? uniqueImages : [`See more: ${url}`],
      "url": url,
      "luthier": luthier
    };

    await browser.close();
    return result;
  } catch (err) {
    await browser.close();
    throw new Error(`GSI scraper failed: ${err.message}`);
  }
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise(resolve => {
      let totalHeight = 0;
      const distance = 200;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 200);
    });
  });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { scrapeGuitarSalon };
