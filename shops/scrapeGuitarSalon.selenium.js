const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function scrapeGuitarSalon(url) {
  console.log(`[Selenium] Navigating to: ${url}`);

  const options = new chrome.Options();
  options.addArguments('--headless', '--no-sandbox', '--disable-dev-shm-usage');
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  try {
    await driver.get(url);
    await driver.sleep(6000); // Wait for page to render

    // ✅ Model Name
    let modelName = 'N/A';
    try {
      modelName = await driver.findElement(By.css('h1')).getText();
    } catch {
      modelName = new URL(url).hostname;
    }

    // ✅ Price (brute-force search)
    let price = 'N/A';
    try {
      const h3s = await driver.findElements(By.css('h3'));
      for (const h3 of h3s) {
        const text = await h3.getText();
        if (text && text.includes('$')) {
          price = text.trim();
          break;
        }
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

    // ✅ Luthier from URL
    let luthier = 'N/A';
    try {
      const path = url.split('/product/')[1] || '';
      const parts = path.split('-');
      luthier = parts.length > 1 ? parts[1] : 'N/A';
    } catch {}

    // ✅ Specs (year, top, back & sides, condition)
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
