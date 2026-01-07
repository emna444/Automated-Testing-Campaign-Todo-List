const { execSync } = require('child_process');
const fs = require('fs');

const RESULTS_DIR = './test-results';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Create results directory
if (!fs.existsSync(RESULTS_DIR)) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

const metrics = {
  startTime: Date.now(),
  stages: {},
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
  coverage: null
};

console.log(`${colors.cyan}╔════════════════════════════════════════════════════════════════╗${colors.reset}`);
console.log(`${colors.cyan}║       AUTOMATED TESTING PIPELINE - QUALITY METRICS            ║${colors.reset}`);
console.log(`${colors.cyan}╚════════════════════════════════════════════════════════════════╝${colors.reset}\n`);

// Stage 1: Build/Setup
console.log(`${colors.blue}[1/6] Build & Setup Stage${colors.reset}`);
try {
  const setupStart = Date.now();
  console.log('  Installing dependencies...');
  execSync('cd backend && npm install', { stdio: 'inherit' });
  metrics.stages.setup = {
    duration: Date.now() - setupStart,
    status: 'passed'
  };
  console.log(`${colors.green}  ✓ Setup completed${colors.reset}\n`);
} catch (error) {
  metrics.stages.setup = { duration: Date.now() - metrics.startTime, status: 'failed' };
  console.log(`${colors.red}  ✗ Setup failed${colors.reset}\n`);
}

// Stage 2: Unit Tests
console.log(`${colors.blue}[2/6] Unit Tests Stage${colors.reset}`);
try {
  const unitStart = Date.now();
  const unitOutput = execSync('cd backend && npm run test:unit', { encoding: 'utf8' });
  fs.writeFileSync(`${RESULTS_DIR}/unit-tests.txt`, unitOutput);
  
  // Parse results - Node.js test runner format
  const passMatch = unitOutput.match(/ℹ pass (\d+)/);
  const failMatch = unitOutput.match(/ℹ fail (\d+)/);
  const testsMatch = unitOutput.match(/ℹ tests (\d+)/);
  const passed = passMatch ? parseInt(passMatch[1]) : 0;
  const failed = failMatch ? parseInt(failMatch[1]) : 0;
  const total = testsMatch ? parseInt(testsMatch[1]) : passed + failed;
  
  metrics.stages.unit = {
    duration: Date.now() - unitStart,
    status: failed === 0 ? 'passed' : 'failed',
    passed,
    failed,
    total
  };
  metrics.totalTests += total;
  metrics.passedTests += passed;
  metrics.failedTests += failed;
  
  console.log(`${colors.green}  ✓ Unit tests: ${passed} passed, ${failed} failed${colors.reset}\n`);
} catch (error) {
  metrics.stages.unit = { duration: 0, status: 'failed', passed: 0, failed: 0, total: 0 };
  console.log(`${colors.red}  ✗ Unit tests failed${colors.reset}\n`);
}

// Stage 3: Integration Tests (BDD)
console.log(`${colors.blue}[3/6] Integration Tests (BDD) Stage${colors.reset}`);
try {
  const bddStart = Date.now();
  const bddOutput = execSync('cd backend && npm run test:bdd', { encoding: 'utf8' });
  fs.writeFileSync(`${RESULTS_DIR}/bdd-tests.txt`, bddOutput);
  
  // Parse Cucumber results
  const scenariosMatch = bddOutput.match(/(\d+) scenario[s]? \((\d+) passed/);
  const passed = scenariosMatch ? parseInt(scenariosMatch[2]) : 0;
  const total = scenariosMatch ? parseInt(scenariosMatch[1]) : 0;
  const failed = total - passed;
  
  metrics.stages.bdd = {
    duration: Date.now() - bddStart,
    status: failed === 0 ? 'passed' : 'failed',
    passed,
    failed,
    total
  };
  metrics.totalTests += total;
  metrics.passedTests += passed;
  metrics.failedTests += failed;
  
  console.log(`${colors.green}  ✓ BDD tests: ${passed} passed, ${failed} failed${colors.reset}\n`);
} catch (error) {
  metrics.stages.bdd = { duration: 0, status: 'failed', passed: 0, failed: 0, total: 0 };
  console.log(`${colors.red}  ✗ BDD tests failed${colors.reset}\n`);
}

// Stage 4: API Tests
console.log(`${colors.blue}[4/6] API Tests Stage${colors.reset}`);
console.log('  Ensure backend server is running on port 4001...');
try {
  const apiStart = Date.now();
  const apiOutput = execSync('cd backend && npm run test:api', { encoding: 'utf8' });
  fs.writeFileSync(`${RESULTS_DIR}/api-tests.txt`, apiOutput);
  
  // Parse Newman results
  const assertionsMatch = apiOutput.match(/assertions\s+│\s+(\d+)\s+│\s+(\d+)/);
  const passed = assertionsMatch ? parseInt(assertionsMatch[1]) - parseInt(assertionsMatch[2]) : 0;
  const failed = assertionsMatch ? parseInt(assertionsMatch[2]) : 0;
  const total = assertionsMatch ? parseInt(assertionsMatch[1]) : 0;
  
  metrics.stages.api = {
    duration: Date.now() - apiStart,
    status: failed === 0 ? 'passed' : 'failed',
    passed,
    failed,
    total
  };
  metrics.totalTests += total;
  metrics.passedTests += passed;
  metrics.failedTests += failed;
  
  console.log(`${colors.green}  ✓ API tests: ${passed} passed, ${failed} failed${colors.reset}\n`);
} catch (error) {
  metrics.stages.api = { duration: 0, status: 'failed', passed: 0, failed: 0, total: 0 };
  console.log(`${colors.red}  ✗ API tests failed (Is backend server running?)${colors.reset}\n`);
}

// Stage 5: UI Tests (Selenium)
console.log(`${colors.blue}[5/6] UI Tests (Selenium) Stage${colors.reset}`);
console.log('  Ensure backend and frontend servers are running...');
try {
  const uiStart = Date.now();
  const uiOutput = execSync('cd ui-tests && npm test', { encoding: 'utf8' });
  fs.writeFileSync(`${RESULTS_DIR}/ui-tests.txt`, uiOutput);
  
  // Parse Mocha results
  const passMatch = uiOutput.match(/(\d+) passing/);
  const failMatch = uiOutput.match(/(\d+) failing/);
  const passed = passMatch ? parseInt(passMatch[1]) : 0;
  const failed = failMatch ? parseInt(failMatch[1]) : 0;
  const total = passed + failed;
  
  metrics.stages.ui = {
    duration: Date.now() - uiStart,
    status: failed === 0 ? 'passed' : 'failed',
    passed,
    failed,
    total
  };
  metrics.totalTests += total;
  metrics.passedTests += passed;
  metrics.failedTests += failed;
  
  console.log(`${colors.green}  ✓ UI tests: ${passed} passed, ${failed} failed${colors.reset}\n`);
} catch (error) {
  metrics.stages.ui = { duration: 0, status: 'failed', passed: 0, failed: 0, total: 0 };
  console.log(`${colors.red}  ✗ UI tests failed (Are backend and frontend running?)${colors.reset}\n`);
}

// Stage 6: Generate Report
console.log(`${colors.blue}[6/6] Generating Test Report${colors.reset}`);

const totalDuration = Date.now() - metrics.startTime;
const passRate = metrics.totalTests > 0 ? ((metrics.passedTests / metrics.totalTests) * 100).toFixed(2) : 0;

// Check for coverage report
let coveragePercent = 'N/A';

// Try c8 coverage format
if (fs.existsSync('./backend/coverage/coverage-summary.json')) {
  try {
    const coverage = JSON.parse(fs.readFileSync('./backend/coverage/coverage-summary.json', 'utf8'));
    if (coverage.total) {
      coveragePercent = coverage.total.lines.pct.toFixed(2) + '%';
    }
  } catch (e) {}
}

// Fallback: extract from unit test output
if (coveragePercent === 'N/A' && fs.existsSync(`${RESULTS_DIR}/unit-tests.txt`)) {
  try {
    const unitOutput = fs.readFileSync(`${RESULTS_DIR}/unit-tests.txt`, 'utf8');
    const coverageMatch = unitOutput.match(/All files\s+\|\s+([\d.]+)/);
    if (coverageMatch) {
      coveragePercent = coverageMatch[1] + '%';
    }
  } catch (e) {}
}

// Generate Markdown report
const report = `# Test Automation Metrics Report

## Execution Summary
- **Date**: ${new Date().toLocaleString()}
- **Total Duration**: ${(totalDuration / 1000).toFixed(2)}s
- **Status**: ${metrics.failedTests === 0 ? '✅ PASSED' : '❌ FAILED'}

## Quality Metrics

### 1. Code Coverage
- **Coverage**: ${coveragePercent}
- **Report Location**: \`backend/coverage/lcov-report/index.html\`

### 2. Test Execution Time
| Stage | Duration | Status |
|-------|----------|--------|
| Setup | ${(metrics.stages.setup?.duration / 1000 || 0).toFixed(2)}s | ${metrics.stages.setup?.status === 'passed' ? '✅' : '❌'} |
| Unit Tests | ${(metrics.stages.unit?.duration / 1000 || 0).toFixed(2)}s | ${metrics.stages.unit?.status === 'passed' ? '✅' : '❌'} |
| BDD Tests | ${(metrics.stages.bdd?.duration / 1000 || 0).toFixed(2)}s | ${metrics.stages.bdd?.status === 'passed' ? '✅' : '❌'} |
| API Tests | ${(metrics.stages.api?.duration / 1000 || 0).toFixed(2)}s | ${metrics.stages.api?.status === 'passed' ? '✅' : '❌'} |
| UI Tests | ${(metrics.stages.ui?.duration / 1000 || 0).toFixed(2)}s | ${metrics.stages.ui?.status === 'passed' ? '✅' : '❌'} |
| **Total** | **${(totalDuration / 1000).toFixed(2)}s** | |

### 3. Pass/Fail Rate
- **Total Tests**: ${metrics.totalTests}
- **Passed**: ${metrics.passedTests} (${passRate}%)
- **Failed**: ${metrics.failedTests} (${(100 - passRate).toFixed(2)}%)

#### Breakdown by Stage
| Stage | Passed | Failed | Total |
|-------|--------|--------|-------|
| Unit Tests | ${metrics.stages.unit?.passed || 0} | ${metrics.stages.unit?.failed || 0} | ${metrics.stages.unit?.total || 0} |
| BDD Tests | ${metrics.stages.bdd?.passed || 0} | ${metrics.stages.bdd?.failed || 0} | ${metrics.stages.bdd?.total || 0} |
| API Tests | ${metrics.stages.api?.passed || 0} | ${metrics.stages.api?.failed || 0} | ${metrics.stages.api?.total || 0} |
| UI Tests | ${metrics.stages.ui?.passed || 0} | ${metrics.stages.ui?.failed || 0} | ${metrics.stages.ui?.total || 0} |

### 4. Defects Found
- **Critical Issues**: ${metrics.failedTests > 0 ? 'See detailed logs in test-results/' : 'None'}
- **Failed Tests**: ${metrics.failedTests}

## Detailed Results
- Unit Tests: \`test-results/unit-tests.txt\`
- BDD Tests: \`test-results/bdd-tests.txt\`
- API Tests: \`test-results/api-tests.txt\`
- UI Tests: \`test-results/ui-tests.txt\`
- Coverage Report: \`backend/coverage/lcov-report/index.html\`
`;

fs.writeFileSync(`${RESULTS_DIR}/METRICS-REPORT.md`, report);
fs.writeFileSync(`${RESULTS_DIR}/metrics.json`, JSON.stringify(metrics, null, 2));

// Console summary
console.log(`\n${colors.cyan}╔════════════════════════════════════════════════════════════════╗${colors.reset}`);
console.log(`${colors.cyan}║                    PIPELINE SUMMARY                            ║${colors.reset}`);
console.log(`${colors.cyan}╚════════════════════════════════════════════════════════════════╝${colors.reset}\n`);

console.log(`  Total Duration:    ${(totalDuration / 1000).toFixed(2)}s`);
console.log(`  Total Tests:       ${metrics.totalTests}`);
console.log(`  Passed:            ${colors.green}${metrics.passedTests} (${passRate}%)${colors.reset}`);
console.log(`  Failed:            ${metrics.failedTests > 0 ? colors.red : colors.green}${metrics.failedTests} (${(100 - passRate).toFixed(2)}%)${colors.reset}`);
console.log(`  Coverage:          ${coveragePercent}`);
console.log(`  Status:            ${metrics.failedTests === 0 ? colors.green + '✅ PASSED' : colors.red + '❌ FAILED'}${colors.reset}`);

console.log(`\n  📊 Full report: ${colors.yellow}test-results/METRICS-REPORT.md${colors.reset}`);
console.log(`  📈 Coverage HTML: ${colors.yellow}backend/coverage/lcov-report/index.html${colors.reset}\n`);

process.exit(metrics.failedTests > 0 ? 1 : 0);
