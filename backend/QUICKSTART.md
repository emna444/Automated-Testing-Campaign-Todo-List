# Quick Start - Running Tests

## Setup Complete! ✅

All test dependencies have been installed and configured.

## Quick Test Commands

```bash
# Run unit tests
npm run test:unit

# Run BDD tests
npm run test:bdd

# Run API tests (backend must be running first!)
npm run test:api

# Run unit + BDD tests
npm run test:all

# Generate coverage report
npm run test:coverage
```

## Interactive Test Runner

For an interactive menu to run tests:

```bash
node run-tests.js
```

## Running API Tests

**Important:** API tests require the backend server to be running.

### Option 1: Two Terminal Windows

**Terminal 1 - Start Server:**
```bash
npm start
```

**Terminal 2 - Run API Tests:**
```bash
npm run test:api
```

### Option 2: Background Process (PowerShell)

```powershell
# Start server in background
Start-Process powershell -ArgumentList "npm start" -WindowStyle Minimized

# Wait for server to start
Start-Sleep -Seconds 5

# Run API tests
npm run test:api
```

## Test Reports

After running tests, check:

- **Unit Tests**: Console output
- **BDD Tests**: `tests/bdd/reports/cucumber-report.html`
- **API Tests**: `tests/api/results.json`
- **Coverage**: `coverage/index.html`

## Next Steps

1. Ensure your `.env` file is configured
2. Make sure MongoDB is running
3. Run tests individually or use the test runner

For detailed documentation, see [TEST_SETUP.md](TEST_SETUP.md)
