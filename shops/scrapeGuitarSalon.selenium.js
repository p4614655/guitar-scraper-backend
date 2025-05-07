// scrapeGuitarSalon.selenium.js - Version 1.8.1
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function scrapeGuitarSalon(url) {
  console.log(`[Selenium] Navigating to: ${url}`);

  const options = new chrome.Options();
  options.addArguments('--headless', '--no-sandbox', '--disable-dev-shm-usage');

  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  try {
    await driver.get(url);
    await driver.sleep(3000);

    const modelName = await driver.findElement(By.css('h1')).getText().catch(() => new URL(url).hostname);
    const price = await driver.wait(until.elementLocated(By.css('h3.price-new')), 10000).getText().catch(() => 'N/A');

    const descContainer = await driver.findElement(By.css('div.col-sm-8.description.first-letter-big')).catch(() => null);
    let description = 'N/A';
    if (descContainer) {
      const ps = await descContainer.findElements(By.css('p'));
      const descParts = await Promise.all(ps.map(p => p.getText()));
      description = descParts.join('\n\n').trim();
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

    const allImgs = await driver.findElements(By.css('img'));
    const srcs = [];
    for (let img of allImgs) {
      const src = await img.getAttribute('src');
      if (src && src.includes('/catalog/product/') && (src.endsWith('.jpg') || src.endsWith('.webp')) && !src.includes('flag')) {
        srcs.push(src);
      }
    }

    const images = [...new Set(srcs)].slice(0, 5);

    let luthier = 'www.guitarsalon.com';
    if (modelName.includes('"')) {
      luthier = modelName.split('"')[0].trim().replace(/^202\d\s*/, '');
    }

    const result = {
      "Model Name": modelName,
      "Year": specs['year'] || '2025',
      "Top Wood": specs['top'] || 'Spruce',
      "Back and Sides Wood": specs['back & sides'] || 'African Rosewood',
      "Fingerboard": specs['fingerboard'] || 'N/A',
      "Price": price,
      "Condition": specs['condition'] || 'New',
      "Description": description,
      "Images": images.length ? images : [`See more: ${url}`],
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
