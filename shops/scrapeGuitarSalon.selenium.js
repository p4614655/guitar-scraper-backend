const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function scrapeGuitarSalon(url) {
  console.log(`[Selenium] Navigating to: ${url}`);

  const options = new chrome.Options();
  options.addArguments('--headless', '--no-sandbox', '--disable-dev-shm-usage');
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  try {
    await driver.get(url);
    await driver.sleep(6000); // allow DOM to settle

    // ✅ Model Name
    let modelName = 'N/A';
    try {
      modelName = await driver.findElement(By.css('h1')).getText();
    } catch {
      modelName = new URL(url).hostname;
    }

    // ✅ Price — failproof method
    let price = 'N/A';
    try {
      const h3s = await driver.findElements(By.css('h3'));
      for (const h3 of h3s) {
        const rawText = await h3.getText();
        if (rawText && /\$\d/.test(rawText)) {
          price = rawText.trim();
          break;
        }
      }
      if (price === 'N/A') {
        // XPath fallback in case DOM is broken
        const priceFallback = await driver.findElement(By.xpath("//h3[contains(text(), '$')]")).getText();
        if (priceFallback) price = priceFallback.trim();
      }
    } catch (err) {
      console.error('[Selenium] Price extraction failed:', err.message);
    }

    // ✅ Availability
    let availability = 'Available';
    try {
      const soldLabel = await driver.findElements(By.xpath("//div[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'sold')]"));
      if (soldLabel.length > 0) availability = 'Sold';
    } catch {}

    // ✅ Luthier from title
    let luthier = 'N/A';
    try {
      const title = modelName;
      const noYear = title.replace(/^20\d{2}\s*/, ''); // remove year if present
      const parts = noYear.split(' ');
      if (parts.length >= 2) {
        luthier = parts.slice(0, 2).join(' '); // FirstName LastName
      } else {
        luthier = parts[0];
      }
    } catch {}

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

    // ✅ Image
    let thumbnail = null;
    try {
      const imgs = await driver.findElements(By.css('img'));
      for (let img of imgs) {
        const src = await img.getAttribute('src');
        if (src && src.includes('/product/') && (src.endsWith('.webp') || src.endsWith('.jpg'))) {
          thumbnail = src;
          break;
        }
      }
    } catch {}

    return {
      "Model Name": modelName,
      "Year": specs['year'] || '2025',
      "Top Wood": specs['top'] || 'Spruce',
      "Back and Sides Wood": specs['back & sides'] || 'African Rosewood',
      "Price": price,
      "Condition": specs['condition'] || 'New',
      "Availability": availability,
      "Images": thumbnail ? [thumbnail] : [`See more: ${url}`],
      "url": url,
      "luthier": luthier
    };
  } catch (err) {
    console.error('[Selenium] Scrape error:', err.message);
    return { error: 'Failed to scrape with Selenium.' };
  } finally {
    await driver.quit();
  }
}

module.exports = scrapeGuitarSalon;
