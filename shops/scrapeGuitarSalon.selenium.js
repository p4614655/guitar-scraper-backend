// shops/scrapeGuitarSalon.selenium.js
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function scrapeGuitarSalon(url) {
  const options = new chrome.Options();
  options.addArguments('--headless', '--no-sandbox', '--disable-dev-shm-usage');

  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  try {
    console.log(`[Selenium] Navigating to: ${url}`);
    await driver.get(url);

    // Wait for main title
    const modelElement = await driver.wait(until.elementLocated(By.css('h1')), 10000);
    const modelName = await modelElement.getText().catch(() => 'N/A');

    // Wait and get price
    let price = 'N/A';
    try {
      const priceElement = await driver.wait(until.elementLocated(By.css('.price')), 5000);
      price = await priceElement.getText();
    } catch (err) {
      console.log('[Selenium] Failed to extract price:', err.message);
    }

    // Wait and get description
    let description = 'N/A';
    try {
      const descElement = await driver.wait(until.elementLocated(By.css('.product-summary-container')), 5000);
      description = await descElement.getText();
    } catch (err) {
      console.log('[Selenium] Failed to extract description:', err.message);
    }

    let luthier = 'N/A';
    if (modelName.includes('"')) {
      luthier = modelName.split('"')[0].trim().replace(/^202\d\s*/, '');
    } else {
      luthier = modelName.split(' ')[0].trim();
    }

    // Specs
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

    // Collect up to 5 product-specific image URLs
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
    console.error('[Selenium] Scraper error:', err.message);
    throw new Error('Failed to scrape with Selenium.');
  } finally {
    await driver.quit();
  }
}

module.exports = scrapeGuitarSalon;
