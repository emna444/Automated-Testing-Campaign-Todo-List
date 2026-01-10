const { By, until } = require("selenium-webdriver");

class SignupPage {
  constructor(driver) {
    this.driver = driver;
    this.usernameInput = By.id("username");
    this.emailInput = By.id("email");
    this.passwordInput = By.id("password");
    this.signupButton = By.css("button[type='submit']");
    this.errorMessage = By.css("p.text-red-500");
  }

  async open() {
    await this.driver.get("http://localhost:5173/signup");
    await this.driver.wait(until.elementLocated(this.emailInput), 10000);
  }

  async signup(email, password, username = `user-${Date.now()}`) {
    const usernameEl = await this.driver.findElement(this.usernameInput);
    await usernameEl.clear();
    await usernameEl.sendKeys(username);
    await this.driver.sleep(300);

    const emailEl = await this.driver.findElement(this.emailInput);
    await emailEl.clear();
    await emailEl.sendKeys(email);
    await this.driver.sleep(300);

    const passwordEl = await this.driver.findElement(this.passwordInput);
    await passwordEl.clear();
    await passwordEl.sendKeys(password);
    await this.driver.sleep(300);

    const signupBtn = await this.driver.findElement(this.signupButton);
    await signupBtn.click();
    await this.driver.sleep(500);
  }

  async getErrorMessage() {
    const el = await this.driver.wait(until.elementLocated(this.errorMessage), 8000);
    return await el.getText();
  }
}

module.exports = SignupPage;
