// scrapeGuitarSalon.selenium.js — v1.8.3
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function scrapeGuitarSalon(url) {
  console.log(`[Selenium] Navigating to: ${url}`);

  const options = new chrome.Options();
  options.addArguments('--headless', '--no-sandbox', '--disable-dev-shm-usage');
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  try {
    await driver.get(url);

    // Explicit wait for title as page load confirmation
    await driver.wait(until.elementLocated(By.css('h1')), 10000);

    const modelName = await driver.findElement(By.css('h1')).getText().catch(() => new URL(url).hostname);
    const price = await driver.wait(until.elementLocated(By.css('h3.price-new')), 8000)
      .then(el => el.getText()).catch((e) => {
        console.error('[Selenium] Price not found:', e.message);
        return 'N/A';
      });

    const description = await driver.wait(until.elementLocated(By.css('.product-summary-container')), 8000)
      .then(el => el.getText()).catch((e) => {
        console.error('[Selenium] Description not found:', e.message);
        return 'N/A';
      });

    const availability = await driver.findElements(By.xpath("//div[contains(@class,'product-label') and contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'sold')]")).then(el => el.length > 0 ? 'Sold' : 'Available');

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
    let image = null;
    for (let img of allImages) {
      const src = await img.getAttribute('src');
      if (src && src.includes('/product/')) {
        image = src;
        break;
      }
    }

    return {
      "Model Name": modelName,
      "Year": specs['year'] || '2025',
      "Top Wood": specs['top'] || 'Spruce',
      "Back and Sides Wood": specs['back & sides'] || 'African Rosewood',
      "Fingerboard": specs['fingerboard'] || 'N/A',
      "Price": price,
      "Condition": specs['condition'] || 'New',
      "Availability": availability,
      "Description": description,
      "Images": image ? [image] : [`See more: ${url}`],
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
