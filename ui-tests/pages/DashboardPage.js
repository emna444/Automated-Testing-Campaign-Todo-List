const { By, until } = require("selenium-webdriver");

class DashboardPage {
  constructor(driver) {
    this.driver = driver;
    this.taskInput = By.xpath("//input[@type='text']");
    this.addButton = By.xpath("//button[contains(.,'Add')]");
    this.tasksList = By.xpath("//ul[contains(@class,'space-y-2')]/li");
    this.remainingLabel = By.xpath("//p[contains(text(),'Todos remaining')]");
    this.header = By.xpath("//h1[contains(text(),'Todo App')]");
  }

  async waitForDashboard() {
    await this.driver.wait(
      until.elementLocated(this.taskInput),
      10000
    );
    await this.driver.wait(
      until.elementLocated(this.header),
      10000
    );
  }

  async addTask(title) {
    await this.waitForDashboard();
    await this.driver.sleep(300);
    const input = await this.driver.findElement(this.taskInput);
    await input.clear();
    await input.sendKeys(title);
    await this.driver.sleep(300);

    const addBtn = await this.driver.findElement(this.addButton);
    await addBtn.click();
    await this.driver.sleep(500);
  }

  // 🔎 Find task row by visible text
  async getTaskRow(title) {
    const row = By.xpath(`//li[.//*[contains(normalize-space(),"${title}")]]`);
    return await this.driver.wait(until.elementLocated(row), 10000);
  }

  /* ---------- EDIT ---------- */
  async editTask(oldTitle, newTitle) {
    const row = await this.getTaskRow(oldTitle);

    const editBtn = await row.findElement(By.xpath(".//button[contains(.,'Edit')]"));
    await editBtn.click();

    // Wait for input to be active in edit mode
    await this.driver.wait(until.elementLocated(this.taskInput), 5000);
    await this.driver.sleep(300);

    const input = await this.driver.findElement(this.taskInput);
    await input.clear();
    await input.sendKeys(newTitle);
    await this.driver.sleep(200);

    // Find and click Save button - look within the input's parent or globally
    const saveBtn = await this.driver.findElement(By.xpath("//button[contains(text(),'Save')]"));
    await saveBtn.click();

    // Wait for row to update by checking old title disappears and new appears
    await this.driver.wait(async () => {
      const oldExists = (await this.driver.findElements(By.xpath(`//*[contains(normalize-space(),"${oldTitle}")]`))).length > 0;
      const newExists = (await this.driver.findElements(By.xpath(`//*[contains(normalize-space(),"${newTitle}")]`))).length > 0;
      return !oldExists && newExists;
    }, 12000);
  }

  /* ---------- DELETE ---------- */
  async deleteTask(title) {
    const row = await this.getTaskRow(title);
    await this.driver.sleep(300);

    const deleteBtn = await row.findElement(By.xpath(".//button[contains(.,'Delete')]"));
    await deleteBtn.click();
    await this.driver.sleep(500);

    await this.driver.wait(until.stalenessOf(row), 10000);
  }

  /* ---------- TOGGLE COMPLETE ---------- */
  async toggleTaskComplete(title) {
    const row = await this.getTaskRow(title);
    await this.driver.sleep(300);
    const checkbox = await row.findElement(By.xpath(".//input[@type='checkbox']"));
    await checkbox.click();
    await this.driver.sleep(300);
    await this.driver.wait(async () => (await checkbox.isSelected()) === true, 5000);
  }

  /* ---------- ASSERTIONS ---------- */
  async isTaskDisplayed(title) {
    await this.getTaskRow(title);
    return true;
  }

  async isTaskNotDisplayed(title) {
    const locator = By.xpath(`//*[contains(normalize-space(),"${title}")]`);
    try {
      await this.driver.wait(async () => (await this.driver.findElements(locator)).length === 0, 8000);
      return true;
    } catch (e) {
      return false;
    }
  }

  async isTaskCompleted(title) {
    const row = await this.getTaskRow(title);
    const checkbox = await row.findElement(By.xpath(".//input[@type='checkbox']"));
    return await checkbox.isSelected();
  }

  async getTaskCount() {
    const rows = await this.driver.findElements(this.tasksList);
    return rows.length;
  }

  async getRemainingCount() {
    await this.waitForDashboard();
    const labels = await this.driver.findElements(this.remainingLabel);
    if (labels.length === 0) return 0;
    const text = await labels[0].getText();
    const match = text.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /* ---------- LOGOUT ---------- */
  async logout() {
    // logout clears token, does NOT redirect
    const buttons = await this.driver.findElements(By.xpath("//button"));
    await buttons[buttons.length - 1].click();
  }
}

module.exports = DashboardPage;
