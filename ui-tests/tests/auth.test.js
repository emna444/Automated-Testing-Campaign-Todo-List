const { By, until } = require("selenium-webdriver");

const { expect } = require("chai");
const getDriver = require("../utils/driver");
const LoginPage = require("../pages/LoginPage");
const SignupPage = require("../pages/SignupPage");

describe("Authentication Tests", function () {
  this.timeout(60000);
  let driver;
  let validUser;

  before(async () => {
    // Create a test user once for TC-A004
    validUser = {
      email: `ui-${Date.now()}@example.com`,
      password: "TestPass123!",
      username: `authuser-${Date.now()}`
    };

    driver = await getDriver();
    const signupPage = new SignupPage(driver);
    await signupPage.open();
    await driver.sleep(500);
    await signupPage.signup(validUser.email, validUser.password, validUser.username);
    await driver.sleep(1000);
    await driver.wait(until.urlContains("/login"), 8000);
    await driver.quit();
  });

  beforeEach(async () => {
    driver = await getDriver();
  });

  afterEach(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  it("TC-A001: Signup with valid inputs", async () => {
    const signupPage = new SignupPage(driver);
    const uniqueEmail = `ui-${Date.now()}@example.com`;
    await signupPage.open();
    await driver.sleep(500);
    await signupPage.signup(uniqueEmail, "Passw0rd!", `user-${Date.now()}`);
    await driver.sleep(1000);

    // Expect redirect to login after successful signup
    await driver.wait(until.urlContains("/login"), 8000);
    await driver.sleep(500);
    const loginInputs = await driver.findElements(By.id("email"));
    expect(loginInputs.length).to.be.greaterThan(0);
  });

  it("TC-A002: Signup with missing fields", async () => {
    const signupPage = new SignupPage(driver);
    await signupPage.open();

    // Fill only username, leave email and password empty
    const usernameInput = await driver.findElement(By.id("username"));
    await usernameInput.sendKeys("testuser");

    // Try to submit (HTML5 validation should prevent navigation)
    const submitBtn = await driver.findElement(By.css("button[type='submit']"));
    await submitBtn.click();

    // Wait briefly and verify user stays on signup page
    await driver.sleep(1000);
    const url = await driver.getCurrentUrl();
    expect(url).to.include("/signup");
  });

  it("TC-A003: Signup with invalid email", async () => {
    const signupPage = new SignupPage(driver);
    await signupPage.open();

    await signupPage.signup("invalid-email", "Passw0rd!", `user-${Date.now()}`);

    // HTML email validation should prevent navigation
    const url = await driver.getCurrentUrl();
    expect(url).to.include("/signup");
  });

  it("TC-A004: Login with valid credentials", async () => {
    const loginPage = new LoginPage(driver);
    await loginPage.open();
    await driver.sleep(500);
    await loginPage.login(validUser.email, validUser.password);
    await driver.sleep(1500);

    // Verify successful login by checking URL redirects to home
    const url = await driver.getCurrentUrl();
    expect(url).to.equal("http://localhost:5173/");
    
    // Verify dashboard elements are present (confirms authentication worked)
    await driver.sleep(500);
    const taskInput = await driver.findElements(By.xpath("//input[@type='text']"));
    expect(taskInput.length).to.be.greaterThan(0);
  });


  it("TC-A005: Login with wrong password", async () => {
    const loginPage = new LoginPage(driver);
    await loginPage.open();
    await loginPage.login("testuser@email.com", "wrongpass");

    // Wait briefly for response
    await driver.sleep(2000);

    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).to.include("/login");
    // Error message may vary; primary check is that user stays on login page
  });

  it("TC-A006: Login with missing fields", async () => {
    const loginPage = new LoginPage(driver);
    await loginPage.open();

    // Fill only email, leave password empty
    const emailInput = await driver.findElement(By.css("input[type='email']"));
    await emailInput.sendKeys("test@example.com");

    // Try to submit (HTML5 validation should prevent navigation)
    const submitBtn = await driver.findElement(By.css("button[type='submit']"));
    await submitBtn.click();

    // Wait briefly and verify user stays on login page
    await driver.sleep(1000);
    const url = await driver.getCurrentUrl();
    expect(url).to.include("/login");
  });

});
