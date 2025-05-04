// shops/scrapeGuitarSalon.selenium.js
const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function scrapeGuitarSalon(url) {
  const options = new chrome.Options();
  options.addArguments('--headless', '--no-sandbox', '--disable-dev-shm-usage');

  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  try {
    await driver.get(url);
    await driver.sleep(4000);

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

    const allImages = await driver.findElements(By.css('img'));
    const images = [];
    for (let img of allImages) {
      const src = await img.getAttribute('src');
      if (src && src.includes('/product/')) {
        images.push(src);
      }
    }

    const uniqueImages = [...new Set(images)].slice(0, 5);

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

module.exports = scrapeGuitarSalon;
