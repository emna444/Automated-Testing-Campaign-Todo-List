# Test Automation Framework Architecture

**Project**: Automated Testing Campaign - Todo List Application  
**Date**: January 8, 2026  
**Version**: 1.0

---

## 1. Architecture Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Actions CI/CD                     │
│                     (test-pipeline.yml)                     │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
        ┌───────▼──────┐ ┌───▼────┐ ┌─────▼──────┐
        │ Build/Setup  │ │ Tests  │ │ Reporting  │
        └──────────────┘ └────────┘ └────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │           │         │         │           │
    ┌───▼───┐  ┌───▼────┐ ┌──▼───┐ ┌──▼─────┐ ┌───▼────┐
    │ Unit  │  │  BDD   │ │ API  │ │   UI   │ │Metrics │
    │ Tests │  │ Tests  │ │Tests │ │ Tests  │ │ Report │
    └───────┘  └────────┘ └──────┘ └────────┘ └────────┘
```

---

## 2. Framework Components

### 2.1 Directory Structure

```
project-root/
├── .github/
│   └── workflows/
│       └── test-pipeline.yml          # CI/CD pipeline definition
│
├── backend/
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── todo.test.js          # Unit tests for todo controller
│   │   │   └── user.test.js          # Unit tests for user controller
│   │   ├── bdd/
│   │   │   ├── features/
│   │   │   │   ├── todo.feature      # Todo BDD scenarios
│   │   │   │   └── user.feature      # User BDD scenarios
│   │   │   └── steps/
│   │   │       ├── common.steps.js   # Shared step definitions
│   │   │       ├── todo.steps.js     # Todo step definitions
│   │   │       └── user.steps.js     # User step definitions
│   │   └── api/
│   │       └── Todo API Tests.postman_collection.json
│   │
│   ├── coverage/                      # Code coverage reports
│   └── package.json                   # Backend dependencies
│
├── ui-tests/
│   ├── tests/
│   │   ├── auth.test.js              # Authentication E2E tests
│   │   └── tasks.test.js             # Task management E2E tests
│   ├── pages/
│   │   ├── LoginPage.js              # Login page object
│   │   ├── SignupPage.js             # Signup page object
│   │   └── DashboardPage.js          # Dashboard page object
│   ├── utils/
│   │   └── driver.js                 # WebDriver configuration
│   └── package.json                   # UI test dependencies
│
├── scripts/
│   ├── run-all-tests.js              # Local test execution script
│   └── generate-metrics.js           # Metrics report generator
│
├── test-results/
│   ├── METRICS-REPORT.md             # Comprehensive metrics report
│   ├── metrics.json                  # Machine-readable metrics
│   ├── unit-tests.txt                # Unit test output
│   ├── bdd-tests.txt                 # BDD test output
│   ├── api-tests.txt                 # API test output
│   └── ui-tests.txt                  # UI test output
│
└── docs/
    ├── TESTING-STRATEGY.md           # Testing strategy document
    ├── FRAMEWORK-ARCHITECTURE.md     # This document
    ├── CICD-DEPLOYMENT-PLAN.md       # CI/CD deployment guide
    └── LESSONS-LEARNED.md            # Lessons and recommendations
```

---

## 3. Test Layers Implementation

### 3.1 Unit Tests Layer

**Technology Stack:**
- **Framework**: Node.js built-in test runner (`node:test`)
- **Assertions**: Node.js built-in assert module
- **Coverage**: c8 (Istanbul)
- **Mocking**: Manual mocks for Mongoose models

**Architecture:**
```javascript
// Unit Test Structure
import { test } from 'node:test';
import assert from 'node:assert';
import { functionToTest } from '../../controller/file.js';

// Mock setup
const createMockRequest = () => ({ body: {...}, params: {...} });
const createMockResponse = () => ({ 
  status: jest.fn().mockReturnThis(),
  json: jest.fn() 
});

test('Feature → Scenario', async () => {
  // Arrange
  const req = createMockRequest();
  const res = createMockResponse();
  
  // Act
  await functionToTest(req, res);
  
  // Assert
  assert.strictEqual(res.statusCode, 200);
});
```

**Coverage Configuration:**
```json
{
  "scripts": {
    "test:unit": "node --test --experimental-test-coverage tests/unit/"
  }
}
```

---

### 3.2 BDD Integration Tests Layer

**Technology Stack:**
- **Framework**: Cucumber.js
- **Language**: Gherkin
- **Step Definitions**: JavaScript/ES6

**Architecture:**
```gherkin
# Feature File (todo.feature)
Feature: Todo Management
  As a user
  I want to manage my todos
  So that I can track my tasks

  Scenario: Create a new todo
    Given I am logged in as a user
    When I create a todo with text "Buy groceries"
    Then the todo should be created successfully
    And I should see the todo in my list
```

```javascript
// Step Definition (todo.steps.js)
import { Given, When, Then } from '@cucumber/cucumber';

Given('I am logged in as a user', async function() {
  this.user = await createUser();
  this.token = await loginUser(this.user);
});

When('I create a todo with text {string}', async function(text) {
  this.response = await createTodo(text, this.token);
});

Then('the todo should be created successfully', function() {
  assert.strictEqual(this.response.status, 201);
});
```

**Cucumber Configuration:**
```json
{
  "default": {
    "requireModule": ["@babel/register"],
    "require": ["tests/bdd/steps/**/*.js"],
    "format": ["progress", "json:cucumber-report.json"]
  }
}
```

---

### 3.3 API Tests Layer

**Technology Stack:**
- **Collection**: Postman
- **CLI Runner**: Newman
- **Reporter**: CLI + JSON

**Architecture:**
```json
{
  "info": {
    "name": "Todo API Tests",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/"
  },
  "item": [
    {
      "name": "Create Todo",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/todo/create",
        "header": [{"key": "Authorization", "value": "Bearer {{token}}"}],
        "body": {"text": "Test todo"}
      },
      "event": [{
        "listen": "test",
        "script": {
          "exec": [
            "pm.test('Status code is 201', function() {",
            "  pm.response.to.have.status(201);",
            "});"
          ]
        }
      }]
    }
  ]
}
```

**Newman Execution:**
```bash
newman run collection.json \
  --reporters cli,json \
  --reporter-json-export api-test-results.json
```

---

### 3.4 UI Tests Layer

**Technology Stack:**
- **WebDriver**: Selenium WebDriver
- **Browser**: Chrome (headless in CI)
- **Framework**: Mocha
- **Assertions**: Chai
- **Pattern**: Page Object Model (POM)

**Page Object Model:**
```javascript
// LoginPage.js
class LoginPage {
  constructor(driver) {
    this.driver = driver;
    this.url = 'http://localhost:5174/login';
    this.emailInput = By.id('email');
    this.passwordInput = By.id('password');
    this.loginButton = By.css('button[type="submit"]');
  }

  async open() {
    await this.driver.get(this.url);
  }

  async login(email, password) {
    await this.driver.findElement(this.emailInput).sendKeys(email);
    await this.driver.findElement(this.passwordInput).sendKeys(password);
    await this.driver.findElement(this.loginButton).click();
  }
}
```

**Test Implementation:**
```javascript
// auth.test.js
describe('Authentication Tests', function() {
  this.timeout(60000);
  let driver;

  beforeEach(async () => {
    driver = await getDriver();
  });

  afterEach(async () => {
    await driver.quit();
  });

  it('TC-A001: Login with valid credentials', async () => {
    const loginPage = new LoginPage(driver);
    await loginPage.open();
    await loginPage.login('user@example.com', 'password123');
    
    await driver.wait(until.urlContains('/dashboard'), 5000);
    expect(await driver.getCurrentUrl()).to.include('/dashboard');
  });
});
```

**WebDriver Configuration:**
```javascript
// driver.js
const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

function getDriver() {
  const options = new chrome.Options();
  options.addArguments('--headless');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  
  return new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
}
```

---

## 4. Metrics and Reporting System

### 4.1 Metrics Generator Architecture

**Flow:**
```
Test Results Files → Parser → Aggregator → Report Generator → Artifacts
```

**Implementation:**
```javascript
// generate-metrics.js
const parseUnitTests = (content) => {
  // Extract pass/fail counts, coverage, defects
  const passMatch = content.match(/ℹ pass (\d+)/);
  const failMatch = content.match(/ℹ fail (\d+)/);
  const coverageMatch = content.match(/All files\s+\|\s+([\d.]+)/);
  
  return {
    passed: parseInt(passMatch[1]),
    failed: parseInt(failMatch[1]),
    coverage: parseFloat(coverageMatch[1]),
    defects: extractDefects(content)
  };
};

const generateReport = (metrics) => {
  return `
# Test Automation Metrics Report

## Executive Summary
- Pass Rate: ${metrics.passRate}%
- Coverage: ${metrics.coverage}%
- Defects: ${metrics.defects.total}
  `;
};
```

### 4.2 Quality Gates Evaluation

```javascript
const evaluateQualityGates = (metrics) => {
  const gates = {
    coverage: metrics.coverage >= CONFIG.thresholds.coverage,
    passRate: metrics.passRate >= CONFIG.thresholds.passRate,
    duration: metrics.totalDuration <= CONFIG.thresholds.maxDuration,
    criticalDefects: metrics.defects.critical === 0
  };
  
  return gates.coverage && gates.passRate && 
         gates.duration && gates.criticalDefects;
};
```

---

## 5. CI/CD Integration

### 5.1 Pipeline Architecture

**Jobs:**
1. **build-and-setup**: Dependencies installation
2. **unit-tests**: Unit tests with coverage
3. **integration-tests**: BDD scenarios
4. **api-tests**: Newman API tests
5. **ui-tests**: Selenium E2E tests
6. **test-reporting**: Metrics aggregation

**Job Dependencies:**
```yaml
build-and-setup
  ├── unit-tests
  ├── integration-tests
  ├── api-tests
  └── ui-tests
        └── test-reporting (if: always())
```

### 5.2 Artifact Management

**Temporary Artifacts** (inter-job communication):
- unit-test-results
- bdd-test-results
- api-test-results
- ui-test-results

**Final Artifacts** (downloadable):
- coverage-report (756 KB)
- metrics-report (15 KB, includes all test results)

---

## 6. Key Design Patterns

### 6.1 Page Object Model (POM)
- Encapsulates UI interactions
- Improves maintainability
- Reduces code duplication

### 6.2 Factory Pattern
- Mock object creation
- Test data generation
- WebDriver instantiation

### 6.3 Strategy Pattern
- Multiple test parsers
- Defect classification
- Report formatting

---

## 7. Scalability Considerations

### 7.1 Parallel Execution
- Jobs run in parallel (Unit, BDD, API, UI)
- Reduces total pipeline time from ~4min to ~3min

### 7.2 Test Isolation
- Each test creates its own data
- No shared state between tests
- Database cleanup between suites

### 7.3 Resource Optimization
- Artifact size minimization
- Coverage report consolidation
- Selective test execution (future)

---

## 8. Error Handling & Recovery

### 8.1 Test Failures
- `set -o pipefail` preserves exit codes
- `if: always()` ensures artifact upload
- Graceful degradation for optional steps

### 8.2 Infrastructure Failures
- Retry mechanisms for flaky tests
- Health checks for services (MongoDB)
- Timeout configurations

---

**Document Owner**: DevOps Team  
**Last Updated**: January 8, 2026  
**Review Cycle**: Quarterly
