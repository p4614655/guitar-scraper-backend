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
    await driver.sleep(4000);

    // Model Name from <h1>
    const modelName = await driver.findElement(By.css('h1')).getText().catch(() => 'www.guitarsalon.com');

    // Price from .price-new (inside h3)
    let price = 'N/A';
    try {
      const priceEl = await driver.wait(until.elementLocated(By.css('h3.price-new')), 10000);
      price = await priceEl.getText();
    } catch (err) {
      console.log('[Selenium] Failed to extract price:', err.message);
    }

    // Description from full container
    let description = 'N/A';
    try {
      const descBlock = await driver.findElement(By.css('div.col-sm-8.description.first-letter-big'));
      description = await descBlock.getText();
    } catch (err) {
      console.log('[Selenium] Failed to extract description:', err.message);
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

    // Luthier link extraction fallback
    let luthier = specs['luthier'] || 'N/A';
    try {
      const luthierLink = await driver.findElement(By.css('a[href*="/luthier/"]')).getText();
      luthier = luthierLink;
    } catch {}

    // Images - filtering thumbnails only from /product/<productId>/ folder
    const allImgs = await driver.findElements(By.css('img'));
    const imgUrls = [];
    for (let img of allImgs) {
      const src = await img.getAttribute('src');
      if (src && src.includes('/image/catalog/product/')) {
        imgUrls.push(src);
      }
    }
    const uniqueImages = [...new Set(imgUrls)].filter(img => img.includes('/product/')).slice(0, 5);

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
    console.error('[Selenium] Error during scraping:', err.message);
    throw new Error('Failed to scrape with Selenium.');
  } finally {
    await driver.quit();
  }
}

module.exports = scrapeGuitarSalon;
