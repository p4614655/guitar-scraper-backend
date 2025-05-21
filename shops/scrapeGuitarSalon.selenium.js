const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function scrapeGuitarSalon(url) {
  console.log(`[Selenium] Navigating to: ${url}`);

  const options = new chrome.Options();
  options.addArguments('--headless', '--no-sandbox', '--disable-dev-shm-usage');

  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  try {
    await driver.get(url);

    const modelName = await driver.findElement(By.css('h1')).getText().catch(() => new URL(url).hostname);

    // ✅ Explicit wait for price element
    let price = 'N/A';
    try {
      const el = await driver.wait(
        async () => {
          const h3s = await driver.findElements(By.css('h3'));
          for (const h3 of h3s) {
            const dataUpdate = await h3.getAttribute('data-update');
            const classAttr = await h3.getAttribute('class');
            const text = await h3.getText();

            if (
              dataUpdate === 'price' &&
              classAttr?.includes('price-new') &&
              classAttr?.includes('mb-0') &&
              text
            ) {
              return h3;
            }
          }
          return false;
        },
        10000,
        'Price element not found in time.'
      );

      price = await el.getText();
    } catch (err) {
      console.error('[Selenium] Price wait/iteration failed:', err.message);
    }

    // ✅ Availability
    const availabilityText = await driver.findElements(By.xpath(
      "//div[contains(@class,'product-label') and contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'sold')]"
    )).then(els => els.length > 0 ? 'Sold' : 'Available');

    // ✅ Luthier
    let luthier = 'N/A';
    if (modelName.includes('"')) {
      luthier = modelName.split('"')[0].trim().replace(/^202\d\s*/, '');
    } else {
      luthier = modelName.split(' ')[0].trim();
    }

    // ✅ Specs
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

    // ✅ Thumbnail image
    const allImages = await driver.findElements(By.css('img'));
    let thumbnail = null;
    for (let img of allImages) {
      const src = await img.getAttribute('src');
      if (src && src.includes('/product/') && (src.endsWith('.webp') || src.endsWith('.jpg'))) {
        thumbnail = src;
        break;
      }
    }

    return {
      "Model Name": modelName,
      "Year": specs['year'] || '2025',
      "Top Wood": specs['top'] || 'Spruce',
      "Back and Sides Wood": specs['back & sides'] || 'African Rosewood',
      "Price": price,
      "Condition": specs['condition'] || 'New',
      "Availability": availabilityText,
      "Images": thumbnail ? [thumbnail] : [`See more: ${url}`],
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
