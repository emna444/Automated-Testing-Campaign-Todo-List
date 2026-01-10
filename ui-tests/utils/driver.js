const { Builder } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

async function getDriver() {
  const options = new chrome.Options()
    .addArguments(
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--disable-dev-shm-usage"
    )
    .setChromeBinaryPath(process.env.CHROME_BIN || "/usr/bin/google-chrome");

  return await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();
}

module.exports = getDriver;
