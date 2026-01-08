const { Builder } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

async function getDriver() {
  const options = new chrome.Options();
  
  // Check if running in CI environment
  if (process.env.CI) {
    options.addArguments(
      '--headless',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--window-size=1920,1080'
    );
  }
  
  return await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();
}

module.exports = getDriver;
