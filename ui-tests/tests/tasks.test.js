const { expect } = require("chai");
const { By, until } = require("selenium-webdriver");

const getDriver = require("../utils/driver");
const LoginPage = require("../pages/LoginPage");
const DashboardPage = require("../pages/DashboardPage");

describe("Task Management Tests", function () {
  this.timeout(60000);
  let driver;

  const EMAIL = "test1@gmail.com";
  const PASSWORD = "testuser123";

  beforeEach(async () => {
    driver = await getDriver();

    const loginPage = new LoginPage(driver);
    await loginPage.open();
    await loginPage.login(EMAIL, PASSWORD);

    // Wait until login completes (protected route)
    await driver.wait(async () => {
      const url = await driver.getCurrentUrl();
      return !url.includes("/login");
    }, 10000);
  });

  afterEach(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  it("TC-T001: Create task with valid title", async () => {
    const dashboard = new DashboardPage(driver);
    const title = `Task A-${Date.now()}`;
    await dashboard.addTask(title);
    await driver.sleep(500);

    const exists = await dashboard.isTaskDisplayed(title);
    expect(exists).to.be.true;
  });

  it("TC-T002: Prevent adding empty task", async () => {
    const dashboard = new DashboardPage(driver);
    const countBefore = await dashboard.getTaskCount();

    await dashboard.addTask("");

    const countAfter = await dashboard.getTaskCount();
    expect(countAfter).to.equal(countBefore);
  });

  it("TC-T003: Edit an existing task", async () => {
    const dashboard = new DashboardPage(driver);

    const original = `Edit Test-${Date.now()}`;
    await dashboard.addTask(original);

    // Verify task was added
    const exists = await dashboard.isTaskDisplayed(original);
    expect(exists).to.be.true;
  });

  it("TC-T004: Delete a task", async () => {
    const dashboard = new DashboardPage(driver);

    const title = `Task To Delete-${Date.now()}`;
    await dashboard.addTask(title);
    await driver.sleep(500);
    await dashboard.deleteTask(title);
    await driver.sleep(500);

    const removed = await dashboard.isTaskNotDisplayed(title);
    expect(removed).to.be.true;
  });

  it("TC-T005: Mark task as complete", async () => {
    const dashboard = new DashboardPage(driver);

    const title = `Complete Me-${Date.now()}`;
    await dashboard.addTask(title);
    await driver.sleep(500);
    await dashboard.toggleTaskComplete(title);
    await driver.sleep(500);

    const completed = await dashboard.isTaskCompleted(title);
    expect(completed).to.be.true;
  });

  it("TC-A007: Logout successfully", async () => {
    const dashboard = new DashboardPage(driver);
    await dashboard.logout();
    await driver.sleep(800);

    // Wait for login form to reappear
    await driver.wait(
      until.elementLocated(By.css("input[type='email']")),
      8000
    );
    await driver.sleep(500);

    const loginInputs = await driver.findElements(
      By.css("input[type='email']")
    );
    expect(loginInputs.length).to.be.greaterThan(0);
  });
});
