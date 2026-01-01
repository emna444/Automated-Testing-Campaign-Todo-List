const { By, until } = require("selenium-webdriver");

class LoginPage {
  constructor(driver) {
    this.driver = driver;

    // Locators
    this.emailInput = By.css("input[type='email']");
    this.passwordInput = By.css("input[type='password']");
    this.loginButton = By.css("button[type='submit']");

    // Robust error locator (text-based, framework-independent)
    this.errorMessage = By.xpath(
      "//*[contains(text(),'Invalid') or contains(text(),'error') or contains(text(),'incorrect')]"
    );
  }

  async open() {
    await this.driver.get("http://localhost:5174/login");

    // Wait until login form is visible
    await this.driver.wait(
      until.elementLocated(this.emailInput),
      10000
    );
  }

  async login(email, password) {
    const emailEl = await this.driver.findElement(this.emailInput);
    await emailEl.clear();
    await emailEl.sendKeys(email);
    await this.driver.sleep(300);

    const passwordEl = await this.driver.findElement(this.passwordInput);
    await passwordEl.clear();
    await passwordEl.sendKeys(password);
    await this.driver.sleep(300);

    const loginBtn = await this.driver.findElement(this.loginButton);
    await loginBtn.click();
    await this.driver.sleep(500);
  }

  async getErrorMessage() {
    const errorElement = await this.driver.wait(
      until.elementLocated(this.errorMessage),
      8000
    );
    return await errorElement.getText();
  }
}

module.exports = LoginPage;
