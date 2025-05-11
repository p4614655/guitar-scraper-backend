// version 1.8.0
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function scrapeGuitarSalon(url) {
  console.log('[Selenium] Navigating to:', url);

  const options = new chrome.Options();
  options.addArguments('--headless', '--no-sandbox', '--disable-dev-shm-usage');

  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  try {
    await driver.get(url);
    await driver.sleep(5000);

    const modelName = await driver.findElement(By.css('h1')).getText().catch(() => new URL(url).hostname);
    const price = await driver.findElement(By.css('h3.price-new')).getText().catch(() => 'N/A');

    let description = 'N/A';
    try {
      const descElement = await driver.findElement(By.css('.product-summary-container, .entry-widget'));
      description = await descElement.getText();
    } catch (e) {
      console.error('[Selenium] Description fallback failed:', e.message);
    }

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
    const imageUrls = [];
    for (let img of allImages) {
      const src = await img.getAttribute('src');
      if (src && src.includes('/product/')) {
        imageUrls.push(src);
      }
    }

    const uniqueImages = [...new Set(imageUrls)].slice(0, 5);

    return {
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
  } catch (err) {
    console.error('[Selenium] Scrape error:', err.message);
    throw new Error('Failed to scrape with Selenium.');
  } finally {
    await driver.quit();
  }
}

module.exports = scrapeGuitarSalon;
