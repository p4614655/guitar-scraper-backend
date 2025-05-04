// shops/scrapeGuitarSalon.selenium.js v1.7.6
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function scrapeGuitarSalon(url) {
  console.log(`[Selenium] Navigating to: ${url}`);

  const options = new chrome.Options();
  options.addArguments('--headless', '--no-sandbox', '--disable-dev-shm-usage');

  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  try {
    await driver.get(url);
    await driver.sleep(2000);

    const modelName = await driver.findElement(By.css('h1')).getText().catch(() => 'www.guitarsalon.com');

    let price = 'N/A';
    try {
      const priceElement = await driver.wait(until.elementLocated(By.css('h3.price-new')), 10000);
      price = await priceElement.getText();
    } catch (err) {
      console.warn('[Selenium] Failed to extract price:', err.message);
    }

    let description = 'N/A';
    try {
      const descContainer = await driver.wait(until.elementLocated(By.css('div.col-sm-8.description')), 10000);
      description = await descContainer.getText();
    } catch (err) {
      console.warn('[Selenium] Failed to extract description:', err.message);
    }

    let luthier = 'www.guitarsalon.com';
    try {
      const luthierLink = await driver.findElement(By.css('a[href*="/luthier/"]')).getText();
      luthier = luthierLink;
    } catch (_) {}

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
    console.error('[Selenium] Scrape error:', err.message);
    throw new Error('Failed to scrape with Selenium.');
  } finally {
    await driver.quit();
  }
}

module.exports = scrapeGuitarSalon;
