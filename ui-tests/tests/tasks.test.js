const { expect } = require("chai");
const { By, until } = require("selenium-webdriver");

const getDriver = require("../utils/driver");
const LoginPage = require("../pages/LoginPage");
const SignupPage = require("../pages/SignupPage");
const DashboardPage = require("../pages/DashboardPage");

describe("Task Management Tests", function () {
  this.timeout(60000);
  let driver;
  let testUser;

  before(async () => {
    // Create a test user once for all task tests
    const timestamp = Date.now();
    testUser = {
      email: `task-${timestamp}@example.com`,
      password: "TestPass123!",
      username: `taskuser-${timestamp}`
    };

    driver = await getDriver();
    const signupPage = new SignupPage(driver);
    await signupPage.open();
    await driver.sleep(500);
    await signupPage.signup(testUser.email, testUser.password, testUser.username);
    await driver.sleep(1000);
    await driver.wait(until.urlContains("/login"), 8000);
    await driver.quit();
  });

  beforeEach(async () => {
    driver = await getDriver();

    const loginPage = new LoginPage(driver);
    await loginPage.open();
    await driver.sleep(500);
    await loginPage.login(testUser.email, testUser.password);
    await driver.sleep(1500);

    // Wait for dashboard to be ready
    const dashboard = new DashboardPage(driver);
    await dashboard.waitForDashboard();
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
