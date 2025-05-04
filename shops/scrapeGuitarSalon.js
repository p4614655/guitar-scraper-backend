// shops/scrapeGuitarSalon.js (Selenium Version 1.0.0-S)
const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function scrapeGuitarSalon(url) {
  const options = new chrome.Options();
  options.addArguments('--headless');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');

  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  try {
    await driver.get(url);
    await driver.sleep(3000);

    const modelName = await driver.findElement(By.css('h1')).getText().catch(() => 'N/A');
    const price = await driver.findElement(By.css('.price')).getText().catch(() => 'N/A');
    const description = await driver.findElement(By.css('.product-summary-container')).getText().catch(() => 'N/A');

    let luthier = 'N/A';
    if (modelName.includes('"')) {
      luthier = modelName.split('"')[0].trim().replace(/^202\d\s*/, '');
    } else {
      luthier = modelName.split(' ')[0].trim();
    }

    const specRows = await driver.findElements(By.css('table tr'));
    const specs = {};
    for (let row of specRows) {
      const cells = await row.findElements(By.css('td'));
      if (cells.length === 2) {
        const label = (await cells[0].getText()).trim().toLowerCase();
        const value = (await cells[1].getText()).trim();
        specs[label] = value;
      }
    }

    const productFolder = url.match(/\/product\/([^/]+)/)?.[1];
    const allImages = await driver.findElements(By.css('img'));
    const imageUrls = [];
    for (let img of allImages) {
      const src = await img.getAttribute('src');
      if (src && src.includes(`/product/${productFolder}/`) && src.endsWith('.webp')) {
        imageUrls.push(src);
      }
    }

    const uniqueImages = [...new Set(imageUrls)].slice(0, 5);

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

    return result;
  } catch (err) {
    throw new Error(`Selenium scraper failed: ${err.message}`);
  } finally {
    await driver.quit();
  }
}

module.exports = { scrapeGuitarSalon };
