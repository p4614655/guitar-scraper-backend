// shops/scrapeGuitarSalon.selenium.js — v1.8.5
const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function scrapeGuitarSalon(url) {
  console.log(`[Selenium] Navigating to: ${url}`);

  const options = new chrome.Options();
  options.addArguments('--headless', '--no-sandbox', '--disable-dev-shm-usage');

  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  try {
    await driver.get(url);
    await driver.sleep(6000); // wait for DOM content

    const modelName = await driver.findElement(By.css('h1')).getText().catch(() => new URL(url).hostname);
    const price = await driver.findElement(By.css('h3.price-new')).getText().catch((e) => {
      console.error('[Selenium] Price not found:', e.message);
      return 'N/A';
    });

    const description = await driver.findElement(By.css('#tab-description')).getText().catch((e) => {
      console.error('[Selenium] Description not found:', e.message);
      return 'N/A';
    });

    // Availability check
    const isSold = await driver.findElements(By.css('.product-label')).then(els =>
      Promise.all(els.map(el => el.getText())).then(texts =>
        texts.some(text => text.toLowerCase().includes('sold'))
      )
    );
    const availability = isSold ? 'Sold' : 'Available';

    // Parse luthier name from link or model
    const luthier = await driver.findElement(By.css('a[href*="/luthier/"]')).getText().catch(() => {
      if (modelName.includes('"')) return modelName.split('"')[0].trim().replace(/^202\d\s*/, '');
      return modelName.split(' ')[0].trim();
    });

    // Get specs
    const specs = {};
    const rows = await driver.findElements(By.css('table tr'));
    for (let row of rows) {
      const cells = await row.findElements(By.css('td'));
      if (cells.length === 2) {
        const key = (await cells[0].getText()).trim().toLowerCase();
        const value = (await cells[1].getText()).trim();
        specs[key] = value;
      }
    }

    // Get first thumbnail image
    const image = await driver.findElement(By.css('.thumbnail img')).getAttribute('src').catch(() => null);

    const result = {
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

    return result;
  } catch (err) {
    console.error('[Selenium] Scrape error:', err.message);
    throw new Error('Failed to scrape with Selenium.');
  } finally {
    await driver.quit();
  }
}

module.exports = scrapeGuitarSalon;
