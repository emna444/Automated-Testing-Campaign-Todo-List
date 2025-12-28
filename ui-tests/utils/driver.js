const { Builder } = require("selenium-webdriver");

async function getDriver() {
  return await new Builder()
    .forBrowser("MicrosoftEdge")
    .build();
}

module.exports = getDriver;
