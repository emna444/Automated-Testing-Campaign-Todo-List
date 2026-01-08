# Test Automation Framework Architecture

## Overview

This document describes the architecture and design of the test automation framework used in the Todo List application project.

---

## 1. Framework Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     CI/CD Pipeline (GitHub Actions)              │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  Unit    │  │   BDD    │  │   API    │  │   UI     │       │
│  │  Tests   │  │  Tests   │  │  Tests   │  │  Tests   │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
│       │             │             │             │              │
│       └─────────────┴─────────────┴─────────────┘              │
│                          │                                      │
│                   ┌──────▼──────┐                              │
│                   │  Test       │                              │
│                   │  Reporting  │                              │
│                   └─────────────┘                              │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Application Under Test                        │
│                                                                  │
│  ┌──────────┐       ┌──────────┐       ┌──────────┐           │
│  │ Frontend │◄─────►│ Backend  │◄─────►│ MongoDB  │           │
│  │  (React) │       │ (Express)│       │          │           │
│  └──────────┘       └──────────┘       └──────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Framework Components

### 2.1 Unit Testing Layer

**Technology**: Node.js Native Test Runner + c8

**Directory Structure**:
```
backend/tests/unit/
├── user.test.js         # User controller tests
└── todo.test.js         # Todo controller tests
```

**Key Components**:
```javascript
// Test Helper: Fake Response Object
function createRes() {
  return {
    statusCode: null,
    jsonData: null,
    status(code) { this.statusCode = code; return this; },
    json(data) { this.jsonData = data; }
  };
}

// Test Pattern
test("Description", async () => {
  // Arrange: Setup mocks
  Model.findOne = async () => mockData;
  
  // Act: Execute function
  await controller(req, res);
  
  // Assert: Verify result
  assert.equal(res.statusCode, 200);
});
```

**Coverage Configuration** (package.json):
```json
{
  "c8": {
    "include": ["controller/**/*.js", "model/**/*.js", "jwt/**/*.js"],
    "exclude": ["tests/**", "node_modules/**"],
    "all": true
  }
}
```

### 2.2 Integration Testing Layer (BDD)

**Technology**: Cucumber.js + Chai

**Directory Structure**:
```
backend/tests/bdd/
├── features/
│   ├── user.feature        # User scenarios (Gherkin)
│   └── todo.feature        # Todo scenarios (Gherkin)
└── steps/
    ├── common.steps.js     # Shared step definitions
    ├── user.steps.js       # User step implementations
    └── todo.steps.js       # Todo step implementations
```

**Feature Example**:
```gherkin
Feature: User Registration
  Scenario: Register with valid details
    Given I have valid user details
    When I send a registration request
    Then I should receive a 201 status code
    And the user should be created in the database
```

**Step Definition Pattern**:
```javascript
Given('I have valid user details', function() {
  this.userData = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123'
  };
});

When('I send a registration request', async function() {
  this.response = await register(this.userData);
});

Then('I should receive a {int} status code', function(statusCode) {
  expect(this.response.statusCode).to.equal(statusCode);
});
```

### 2.3 API Testing Layer

**Technology**: Postman + Newman

**Collection Structure**:
```
Todo API Tests.postman_collection.json
├── Authentication
│   ├── Register - Success
│   ├── Register - Email Already Exists
│   ├── Register - Invalid Input
│   ├── Login - Success
│   ├── Login - Wrong Password
│   └── Logout - Success
└── Todo CRUD
    ├── CreateTask
    ├── GetAllTasks
    ├── UpdateTask
    └── DeleteTask
```

**Key Features**:
- **Pre-request Scripts**: Generate unique test data
```javascript
const timestamp = Date.now();
pm.collectionVariables.set("uniqueEmail", `user${timestamp}@example.com`);
```

- **Test Scripts**: Assertions and variable storage
```javascript
pm.test("Status code is 201", function() {
  pm.response.to.have.status(201);
});

pm.test("Save token", function() {
  const jsonData = pm.response.json();
  pm.collectionVariables.set("authToken", jsonData.token);
});
```

- **Collection Variables**: Share data between requests
  - `uniqueEmail`, `uniqueUsername`
  - `authToken`
  - `todoId`

### 2.4 UI Testing Layer

**Technology**: Selenium WebDriver + Mocha

**Directory Structure**:
```
ui-tests/
├── pages/               # Page Object Model
│   ├── SignupPage.js
│   ├── LoginPage.js
│   └── DashboardPage.js
├── tests/               # Test specifications
│   ├── auth.test.js
│   └── tasks.test.js
└── utils/
    └── driver.js        # WebDriver configuration
```

**Page Object Model Pattern**:
```javascript
class SignupPage {
  constructor(driver) {
    this.driver = driver;
    this.emailInput = By.id("email");
    this.passwordInput = By.id("password");
    this.submitButton = By.css("button[type='submit']");
  }

  async open() {
    await this.driver.get("http://localhost:5174/signup");
    await this.driver.wait(until.elementLocated(this.emailInput), 10000);
  }

  async signup(email, password, username) {
    await this.driver.findElement(this.usernameInput).sendKeys(username);
    await this.driver.findElement(this.emailInput).sendKeys(email);
    await this.driver.findElement(this.passwordInput).sendKeys(password);
    await this.driver.findElement(this.submitButton).click();
  }
}
```

**Driver Configuration** (CI-Optimized):
```javascript
async function getDriver() {
  const options = new chrome.Options();
  
  if (process.env.CI) {
    options.addArguments(
      '--headless',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    );
  }
  
  return await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();
}
```

---

## 3. CI/CD Integration

### 3.1 Pipeline Configuration

**File**: `.github/workflows/test-pipeline.yml`

**Job Structure**:
```yaml
jobs:
  unit-tests:          # Parallel execution
  integration-tests:   # Parallel execution
  api-tests:           # Parallel execution
  ui-tests:            # Parallel execution
  test-reporting:      # Sequential (after all tests)
```

### 3.2 Environment Configuration

**Backend**:
```yaml
env:
  MONGODB_URI: mongodb://localhost:27017/todo_test
  PORT: 4001
  JWT_SECRET: test-secret-key
```

**Frontend**:
```yaml
env:
  VITE_API_URL: http://localhost:4001
```

**Services**:
```yaml
services:
  mongodb:
    image: mongo:latest
    ports:
      - 27017:27017
```

---

## 4. Test Data Management

### 4.1 Unit Tests
- **Strategy**: Mocked data, no external dependencies
- **Isolation**: Each test is independent
- **Cleanup**: Not required (no persistent state)

### 4.2 Integration/API Tests
- **Strategy**: Temporary test database
- **Database**: `mongodb://localhost:27017/todo_test`
- **Cleanup**: Database reset per pipeline run
- **Unique Data**: Timestamp-based identifiers

### 4.3 UI Tests
- **Strategy**: Fresh user registration per test
- **Isolation**: Unique email addresses (timestamp-based)
- **Cleanup**: Database cleanup after test suite

---

## 5. Reporting & Metrics

### 5.1 Coverage Reports

**Format**: HTML, LCOV, JSON

**Generated Files**:
```
backend/coverage/
├── lcov-report/index.html   # Interactive HTML report
├── lcov.info                 # LCOV format
└── coverage-final.json       # Raw coverage data
```

**Metrics Tracked**:
- Statement coverage
- Branch coverage
- Function coverage
- Line coverage
- Uncovered lines

### 5.2 Test Results

**Artifacts**:
- `unit-test-results.txt`: Unit test output
- `bdd-test-results.txt`: BDD scenario results
- `api-test-results.txt`: API test output
- `api-test-results.json`: Structured API results
- `ui-test-results.txt`: UI test execution log

### 5.3 Consolidated Metrics Report

**Generated**: `test-results/test-metrics.md`

**Contents**:
- Pipeline execution summary
- Code coverage statistics
- Test execution results (all layers)
- Pass/fail rates
- Execution times
- Defect list

---

## 6. Framework Design Principles

### 6.1 Modularity
- Each test layer is independent
- Clear separation of concerns
- Reusable components (Page Objects, helpers)

### 6.2 Maintainability
- Page Object Model for UI tests
- Step definitions for BDD
- Clear test naming conventions
- Minimal code duplication

### 6.3 Scalability
- Parallel test execution
- Independent test jobs
- Can easily add new test suites
- Supports multiple environments

### 6.4 Reliability
- Explicit waits (no hardcoded sleeps where avoidable)
- Retry logic for flaky operations
- CI-optimized configurations
- Proper error handling

### 6.5 Speed
- Parallel execution saves ~40 seconds
- Optimized test data creation
- Minimal setup/teardown
- Fast feedback (<2 minutes)

---

## 7. Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Unit | Node.js Test | Native | Fast, built-in |
| Coverage | c8 | 10.1.3 | Istanbul-based coverage |
| BDD | Cucumber.js | 12.5.0 | Gherkin scenarios |
| Assertions | Chai | 6.2.2 | BDD assertions |
| API | Newman | 6.2.1 | CLI Postman runner |
| UI | Selenium | 4.x | Browser automation |
| Test Runner | Mocha | Latest | UI test runner |
| CI/CD | GitHub Actions | - | Cloud CI pipeline |
| Database | MongoDB | Latest | Test database |

---

## 8. Configuration Files

### package.json (Backend)
```json
{
  "scripts": {
    "test:unit": "c8 --reporter=text --reporter=lcov node --test",
    "test:bdd": "cucumber-js tests/bdd/features/**/*.feature",
    "test:api": "newman run tests/api/*.json"
  },
  "c8": {
    "include": ["controller/**", "model/**", "jwt/**"],
    "exclude": ["tests/**", "coverage/**"]
  }
}
```

### vite.config.js (Frontend)
```javascript
export default defineConfig({
  server: { port: 5174, host: true },
  preview: { port: 5174, host: true },  // CI-compatible
  test: {
    globals: true,
    environment: 'jsdom'
  }
})
```

---

## 9. Best Practices Implemented

✅ **Page Object Model**: UI tests use reusable page classes  
✅ **Test Isolation**: Each test is independent  
✅ **Parallel Execution**: Tests run simultaneously  
✅ **Unique Test Data**: Timestamp-based identifiers  
✅ **CI Optimization**: Headless browsers, proper waits  
✅ **Coverage Gates**: Enforce minimum coverage  
✅ **Fast Feedback**: Complete pipeline in ~2 minutes  
✅ **Clear Reporting**: Consolidated metrics dashboard  

---

## 10. Extension Points

### Adding New Test Types
1. Create new job in `test-pipeline.yml`
2. Add test scripts to respective folders
3. Configure artifacts upload
4. Update reporting section

### Adding New Environments
1. Duplicate job with environment-specific config
2. Update service configurations
3. Add environment variables
4. Configure deployment triggers

### Scaling Test Suite
1. Use test sharding for large suites
2. Implement test prioritization
3. Add performance testing layer
4. Introduce visual regression testing

---

## Conclusion

This framework architecture provides a robust, scalable, and maintainable testing solution. The multi-layered approach ensures comprehensive coverage while maintaining fast execution times and clear reporting.
