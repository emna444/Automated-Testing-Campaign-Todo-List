# Test Setup Guide

This guide explains how to run all tests in the backend project.

## Prerequisites

1. **Node.js and npm** installed (v18 or higher recommended)
2. **MongoDB** running (local or remote)
3. **Backend server** configured with `.env` file

## Installation

Install all dependencies including dev dependencies:

```bash
cd backend
npm install
```

This will install:
- `@cucumber/cucumber` - For BDD tests
- `newman` - For Postman API tests
- `c8` - For code coverage
- Other required dependencies

## Environment Setup

Ensure your `.env` file is configured with:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

## Running Tests

### 1. Unit Tests

Run unit tests using Node's built-in test runner:

```bash
npm run test:unit
```

Or simply:

```bash
npm test
```

### 2. BDD Tests (Cucumber)

Run BDD tests with Cucumber:

```bash
npm run test:bdd
```

This will:
- Execute feature files in `tests/bdd/features/`
- Use step definitions from `tests/bdd/steps/`
- Generate HTML reports in `tests/bdd/reports/`

### 3. API Tests (Postman/Newman)

**Important:** The backend server must be running before executing API tests.

#### Step 1: Start the backend server

In one terminal:

```bash
npm start
```

#### Step 2: Run API tests

In another terminal:

```bash
npm run test:api
```

This will:
- Run Postman collection using Newman
- Use environment variables from `tests/api/environment.json`
- Generate JSON report in `tests/api/results.json`

### 4. Run All Tests

To run all tests sequentially:

```bash
npm run test:all
```

**Note:** For `test:all`, ensure the backend server is running before executing.

### 5. Code Coverage

Generate code coverage reports for unit tests:

```bash
npm run test:coverage
```

Coverage reports will be generated in:
- HTML: `coverage/index.html`
- LCOV: `coverage/lcov.info`
- Text output in terminal

## Test Structure

```
tests/
├── api/
│   ├── Todo API Tests.postman_collection.json  # Postman collection
│   ├── environment.json                         # Environment variables
│   └── results.json                             # Test results (generated)
├── bdd/
│   ├── features/                                # Gherkin feature files
│   │   ├── todo.feature
│   │   └── user.feature
│   ├── steps/                                   # Step definitions
│   │   ├── common.steps.js
│   │   ├── todo.steps.js
│   │   └── user.steps.js
│   └── reports/                                 # BDD reports (generated)
└── unit/
    ├── todo.test.js                             # Todo unit tests
    └── user.test.js                             # User unit tests
```

## Troubleshooting

### BDD Tests

If you encounter module resolution issues with Cucumber:

1. Ensure `@cucumber/cucumber` is installed
2. Check that step files are properly exported
3. Verify the `cucumber.js` configuration

### API Tests

If Newman can't find the collection:

1. Ensure the backend server is running on port 5000 (or configured port)
2. Check the `environment.json` has correct `baseUrl`
3. Verify authentication tokens if required

### Unit Tests

If unit tests fail:

1. Check MongoDB connection
2. Ensure all model files are accessible
3. Verify controller functions are exported correctly

## CI/CD Integration

For continuous integration, you can use:

```bash
# Run tests without starting server (for CI)
npm run test:unit && npm run test:bdd
```

For API tests in CI, you'll need to:
1. Start the server in background
2. Wait for server to be ready
3. Run API tests
4. Stop the server

Example CI script:

```bash
npm start & 
SERVER_PID=$!
sleep 5
npm run test:api
kill $SERVER_PID
```

## Additional Notes

- Unit tests mock database operations and don't require a running database
- BDD tests also use mocked data and don't require a running database
- API tests require both the database and backend server to be running
- Coverage reports are only generated for unit tests
