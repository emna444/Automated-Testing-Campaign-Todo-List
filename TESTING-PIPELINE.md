# Test Automation Pipeline - Quality Metrics

This project includes a comprehensive automated testing pipeline that measures and tracks quality metrics.

## Pipeline Stages

### 1. Build/Setup ✅
- Install dependencies for backend, frontend, and UI tests
- Setup test environment
- Cache dependencies for faster runs

### 2. Unit Tests ✅
- Run backend unit tests
- Generate code coverage reports
- Track: Pass/fail rate, execution time

### 3. Integration Tests (BDD) ✅
- Run Cucumber/BDD scenarios
- Test feature workflows
- Track: Scenario pass/fail rate

### 4. API Tests ✅
- Run Postman/Newman API tests
- Test REST endpoints
- Track: Assertion pass/fail rate, response times

### 5. UI Tests ✅
- Run Selenium UI tests
- Test user interface workflows
- Track: Test execution results

### 6. Test Reporting ✅
- Consolidate all test results
- Generate metrics dashboard
- Track quality indicators

## Quality Metrics Tracked

### 1. Code Coverage
- **Metric**: Percentage of code tested
- **Location**: `backend/coverage/lcov-report/index.html`
- **Target**: > 80%

### 2. Test Execution Time
- **Metric**: Duration of each stage and complete suite
- **Tracked**: Per stage and total pipeline
- **Target**: < 5 minutes total

### 3. Pass/Fail Rate
- **Metric**: Percentage of successful tests
- **Breakdown**: By test type (Unit, BDD, API, UI)
- **Target**: > 95% pass rate

### 4. Defects Found
- **Metric**: Number and severity of bugs discovered
- **Tracking**: Failed test count, error logs
- **Target**: 0 critical defects

## Running Tests Locally

### Prerequisites
1. MongoDB running (for integration/API tests)
2. Backend server running on port 4001 (for API/UI tests)

### Quick Start

```bash
# Start backend server (in one terminal)
cd backend
npm start

# Run all tests with metrics (in another terminal)
npm run test:metrics
```

### Individual Test Suites

```bash
# Unit tests only
cd backend
npm run test:unit

# BDD tests only
cd backend
npm run test:bdd

# API tests only (requires server running)
cd backend
npm run test:api

# UI tests only (requires backend + frontend running)
cd ui-tests
npm test
```

## CI/CD Pipeline (GitHub Actions)

The pipeline runs automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Manual trigger via GitHub Actions UI

### Pipeline Flow
```
Build/Setup → Unit Tests → Integration Tests → API Tests → UI Tests → Reporting
```

### Artifacts Generated
- `unit-test-results`: Unit test output and coverage
- `bdd-test-results`: BDD test scenarios output
- `api-test-results`: API test assertions output
- `ui-test-results`: UI test execution output
- `test-metrics-report`: Consolidated metrics report

## Viewing Reports

### Local Development
After running `npm run test:metrics`:
1. **Metrics Summary**: `test-results/METRICS-REPORT.md`
2. **Coverage Report**: `backend/coverage/lcov-report/index.html` (open in browser)
3. **Detailed Logs**: `test-results/*.txt`

### CI/CD (GitHub Actions)
1. Go to your repository → Actions tab
2. Click on a workflow run
3. Download artifacts from the summary page
4. View test metrics in the PR comments (for PRs)

## Metrics Dashboard Example

```
╔════════════════════════════════════════════════════════════════╗
║                    PIPELINE SUMMARY                            ║
╚════════════════════════════════════════════════════════════════╝

  Total Duration:    45.23s
  Total Tests:       42
  Passed:            42 (100.00%)
  Failed:            0 (0.00%)
  Coverage:          85.4%
  Status:            ✅ PASSED

  📊 Full report: test-results/METRICS-REPORT.md
  📈 Coverage HTML: backend/coverage/lcov-report/index.html
```

## Project Structure

```
.
├── .github/workflows/
│   └── test-pipeline.yml          # CI/CD pipeline configuration
├── backend/
│   ├── tests/
│   │   ├── unit/                  # Unit tests
│   │   ├── bdd/                   # Integration/BDD tests
│   │   └── api/                   # API tests (Postman)
│   └── coverage/                  # Coverage reports
├── ui-tests/                      # UI tests (Selenium)
├── scripts/
│   └── run-all-tests.js           # Local metrics runner
└── test-results/                  # Generated test outputs
```

## Best Practices

1. **Run tests locally** before pushing
2. **Check coverage** - aim for >80%
3. **Review metrics** - monitor pass/fail trends
4. **Fix failures** - don't ignore failing tests
5. **Update tests** - keep tests in sync with code changes

## Troubleshooting

### API/UI tests failing
- Ensure backend server is running on port 4001
- Check MongoDB is accessible

### Coverage not generating
- Ensure unit tests run successfully
- Check Node.js version (requires Node 20+)

### Pipeline timeout
- Check for infinite loops in tests
- Optimize slow test cases
- Review MongoDB connection

## Contact

For issues or questions, please open an issue in the repository.
