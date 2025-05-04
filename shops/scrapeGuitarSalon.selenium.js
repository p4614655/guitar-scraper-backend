// shops/scrapeGuitarSalon.selenium.js
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

    const modelName = await driver.findElement(By.css('h1')).getText().catch(() => 'www.guitarsalon.com');
    const price = await driver.findElement(By.css('h3.price-new')).getText().catch(err => {
      console.warn('[Selenium] Failed to extract price:', err.message);
      return 'N/A';
    });

    const description = await driver.findElement(By.css('div.col-sm-8.description.first-letter-big')).getText().catch(err => {
      console.warn('[Selenium] Failed to extract description:', err.message);
      return 'N/A';
    });

    let luthier = 'N/A';
    const luthierCell = await driver.findElements(By.xpath("//td[contains(text(),'Luthier')]/following-sibling::td/a"));
    if (luthierCell.length > 0) {
      luthier = await luthierCell[0].getText();
    } else {
      console.warn('[Selenium] Luthier not found');
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
    const productFolder = url.split('/product/')[1]?.split('/')[0];
    const imageUrls = [];

    for (const img of allImgs) {
      const src = await img.getAttribute('src');
      if (src && src.includes(`/product/${productFolder}/`) && src.endsWith('.jpg')) {
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
    console.error('[Selenium] Scrape failed:', err.message);
    throw new Error('Failed to scrape with Selenium.');
  } finally {
    await driver.quit();
  }
}

module.exports = scrapeGuitarSalon;
