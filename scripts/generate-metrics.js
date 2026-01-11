#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Automated Test Metrics Generator
 * Generates comprehensive metrics report from test results
 */

// Configuration
const CONFIG = {
  thresholds: {
    coverage: 75,
    passRate: 95,
    maxDuration: 300000, // 5 minutes in ms
  },
  severity: {
    critical: ['crash', 'exception', 'error', 'fatal'],
    high: ['failed', 'failure', 'assertion'],
    medium: ['warning', 'timeout'],
    low: ['skip', 'pending'],
  },
};

// Utility functions
const readFileIfExists = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf8');
    }
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
  }
  return null;
};

const readJsonIfExists = (filePath) => {
  const content = readFileIfExists(filePath);
  if (content) {
    try {
      return JSON.parse(content);
    } catch (error) {
      console.error(`Error parsing JSON from ${filePath}:`, error.message);
    }
  }
  return null;
};

// Parse unit test results
const parseUnitTests = (content) => {
  if (!content) return null;

  const results = {
    passed: 0,
    failed: 0,
    total: 0,
    duration: 0,
    coverage: null,
    defects: [],
  };

  // Extract test counts - Support both formats
  // Format 1: ℹ pass 16, ℹ fail 0, ℹ tests 16
  const passMatch = content.match(/ℹ pass (\d+)/);
  const failMatch = content.match(/ℹ fail (\d+)/);
  const testsMatch = content.match(/ℹ tests (\d+)/);
  
  // Format 2 (TAP format): # tests 16, # pass 16, # fail 0
  const tapTestsMatch = content.match(/# tests (\d+)/);
  const tapPassMatch = content.match(/# pass (\d+)/);
  const tapFailMatch = content.match(/# fail (\d+)/);
  
  // Use whichever format is present
  if (passMatch) results.passed = parseInt(passMatch[1]);
  else if (tapPassMatch) results.passed = parseInt(tapPassMatch[1]);
  
  if (failMatch) results.failed = parseInt(failMatch[1]);
  else if (tapFailMatch) results.failed = parseInt(tapFailMatch[1]);
  
  if (testsMatch) results.total = parseInt(testsMatch[1]);
  else if (tapTestsMatch) results.total = parseInt(tapTestsMatch[1]);
  
  const durationMatch = content.match(/ℹ duration_ms ([\d.]+)/);
  const tapDurationMatch = content.match(/# duration_ms ([\d.]+)/);
  
  if (durationMatch) results.duration = parseFloat(durationMatch[1]);
  else if (tapDurationMatch) results.duration = parseFloat(tapDurationMatch[1]);

  // Extract coverage from text output
  const coverageMatch = content.match(/All files\s+\|\s+([\d.]+)/);
  if (coverageMatch) {
    results.coverage = parseFloat(coverageMatch[1]);
  } else {
    // Try reading from lcov.info if text output doesn't have it
    const lcovPath = path.join(__dirname, '..', 'backend', 'coverage', 'lcov.info');
    console.log(`[DEBUG] Looking for coverage at: ${lcovPath}`);
    const lcovContent = readFileIfExists(lcovPath);
    
    if (lcovContent) {
      // Parse lcov.info to calculate coverage
      // Format: LF:total_lines, LH:lines_hit
      const totalLinesMatch = lcovContent.match(/LF:(\d+)/g);
      const hitLinesMatch = lcovContent.match(/LH:(\d+)/g);
      
      if (totalLinesMatch && hitLinesMatch) {
        let totalLines = 0;
        let hitLines = 0;
        
        totalLinesMatch.forEach(match => {
          totalLines += parseInt(match.split(':')[1]);
        });
        
        hitLinesMatch.forEach(match => {
          hitLines += parseInt(match.split(':')[1]);
        });
        
        console.log(`[DEBUG] Total lines: ${totalLines}, Hit lines: ${hitLines}`);
        
        if (totalLines > 0) {
          results.coverage = (hitLines / totalLines) * 100;
          console.log(`[DEBUG] Calculated coverage: ${results.coverage.toFixed(2)}%`);
        }
      }
    } else {
      console.log('[DEBUG] lcov.info not found');
    }
  }

  // Extract failed tests as defects
  // Look for Node.js test runner failure pattern: "not ok N - test name"
  const failedTestRegex = /not ok \d+ - (.+)/g;
  let match;
  while ((match = failedTestRegex.exec(content)) !== null) {
    results.defects.push({
      type: 'Unit Test Failure',
      name: match[1],
      severity: 'HIGH',
      category: 'Functional',
    });
  }
  
  // Also look for old format: ✖ test name (Xms)
  const oldFormatRegex = /✖ (.+?) \((\d+\.?\d*)ms\)/g;
  while ((match = oldFormatRegex.exec(content)) !== null) {
    results.defects.push({
      type: 'Unit Test Failure',
      name: match[1],
      severity: 'HIGH',
      category: 'Functional',
    });
  }

  return results;
};

// Parse BDD test results
const parseBddTests = (content) => {
  if (!content) return null;

  const results = {
    scenarios: { passed: 0, failed: 0, total: 0 },
    steps: { passed: 0, failed: 0, total: 0 },
    duration: 0,
    defects: [],
  };

  // Extract scenario counts
  const scenarioMatch = content.match(/(\d+) scenarios? \((\d+) passed(?:, (\d+) failed)?\)/);
  if (scenarioMatch) {
    results.scenarios.total = parseInt(scenarioMatch[1]);
    results.scenarios.passed = parseInt(scenarioMatch[2]);
    results.scenarios.failed = scenarioMatch[3] ? parseInt(scenarioMatch[3]) : 0;
  }

  // Extract step counts
  const stepMatch = content.match(/(\d+) steps? \((\d+) passed(?:, (\d+) failed)?\)/);
  if (stepMatch) {
    results.steps.total = parseInt(stepMatch[1]);
    results.steps.passed = parseInt(stepMatch[2]);
    results.steps.failed = stepMatch[3] ? parseInt(stepMatch[3]) : 0;
  }

  // Extract duration
  const durationMatch = content.match(/(\d+)m([\d.]+)s/);
  if (durationMatch) {
    results.duration = (parseInt(durationMatch[1]) * 60 + parseFloat(durationMatch[2])) * 1000;
  }

  // Extract failed scenarios as defects
  const failedScenarioRegex = /✖ (.+)/g;
  let match;
  while ((match = failedScenarioRegex.exec(content)) !== null) {
    results.defects.push({
      type: 'BDD Scenario Failure',
      name: match[1],
      severity: 'HIGH',
      category: 'Integration',
    });
  }

  return results;
};

// Parse API test results
const parseApiTests = (content, jsonContent) => {
  if (!content) return null;

  const results = {
    requests: { executed: 0, failed: 0 },
    assertions: { executed: 0, failed: 0 },
    duration: 0,
    defects: [],
  };

  // Use JSON if available
  if (jsonContent && jsonContent.run) {
    const run = jsonContent.run;
    results.requests.executed = run.stats.requests.total || 0;
    results.requests.failed = run.stats.requests.failed || 0;
    results.assertions.executed = run.stats.assertions.total || 0;
    results.assertions.failed = run.stats.assertions.failed || 0;
    results.duration = run.timings ? run.timings.completed - run.timings.started : 0;

    // Extract failures as defects
    if (run.executions) {
      run.executions.forEach((exec) => {
        if (exec.assertions) {
          exec.assertions.forEach((assertion) => {
            if (assertion.error) {
              results.defects.push({
                type: 'API Assertion Failure',
                name: `${exec.item.name} - ${assertion.assertion}`,
                severity: 'HIGH',
                category: 'API',
                details: assertion.error.message,
              });
            }
          });
        }
      });
    }
  } else {
    // Parse from text output
    const statsMatch = content.match(/│\s+requests\s+│\s+(\d+)\s+│\s+(\d+)\s+│/);
    if (statsMatch) {
      results.requests.executed = parseInt(statsMatch[1]);
      results.requests.failed = parseInt(statsMatch[2]);
    }

    const assertionsMatch = content.match(/│\s+assertions\s+│\s+(\d+)\s+│\s+(\d+)\s+│/);
    if (assertionsMatch) {
      results.assertions.executed = parseInt(assertionsMatch[1]);
      results.assertions.failed = parseInt(assertionsMatch[2]);
    }

    const durationMatch = content.match(/total run duration: (\d+)ms/);
    if (durationMatch) {
      results.duration = parseInt(durationMatch[1]);
    }

    // Extract failures
    const failureRegex = /✖\s+(.+)/g;
    let match;
    while ((match = failureRegex.exec(content)) !== null) {
      results.defects.push({
        type: 'API Test Failure',
        name: match[1],
        severity: 'HIGH',
        category: 'API',
      });
    }
  }

  return results;
};

// Parse UI test results
const parseUiTests = (content) => {
  if (!content) return null;

  const results = {
    passed: 0,
    failed: 0,
    total: 0,
    duration: 0,
    defects: [],
  };

  // Extract test counts
  const passMatch = content.match(/(\d+) passing/);
  const failMatch = content.match(/(\d+) failing/);

  if (passMatch) results.passed = parseInt(passMatch[1]);
  if (failMatch) results.failed = parseInt(failMatch[1]);
  results.total = results.passed + results.failed;

  // Extract duration (e.g., "1m" or "12 passing (1m)")
  // Use negative lookahead to avoid matching "ms" in milliseconds like "3880ms"
  const durationMatch = content.match(/(\d+)m(?!s)(?:\s+(\d+)s)?/);
  if (durationMatch) {
    const minutes = parseInt(durationMatch[1]) || 0;
    const seconds = parseInt(durationMatch[2]) || 0;
    results.duration = (minutes * 60 + seconds) * 1000;
  }

  // Extract failed tests as defects
  const failureRegex = /\d+\)\s+(.+?):\s*\n\s+(.+)/g;
  let match;
  while ((match = failureRegex.exec(content)) !== null) {
    results.defects.push({
      type: 'UI Test Failure',
      name: match[1],
      severity: 'CRITICAL',
      category: 'UI',
      details: match[2],
    });
  }

  return results;
};

// Calculate overall metrics
const calculateOverallMetrics = (unitResults, bddResults, apiResults, uiResults) => {
  const metrics = {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    passRate: 0,
    coverage: unitResults?.coverage || 0,
    totalDuration: 0,
    defects: {
      total: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      byCategory: {
        functional: 0,
        integration: 0,
        api: 0,
        ui: 0,
      },
    },
  };

  // Unit tests
  if (unitResults) {
    metrics.totalTests += unitResults.total;
    metrics.passedTests += unitResults.passed;
    metrics.failedTests += unitResults.failed;
    metrics.totalDuration += unitResults.duration;
  }

  // BDD tests
  if (bddResults) {
    metrics.totalTests += bddResults.scenarios.total;
    metrics.passedTests += bddResults.scenarios.passed;
    metrics.failedTests += bddResults.scenarios.failed;
    metrics.totalDuration += bddResults.duration;
  }

  // API tests
  if (apiResults) {
    metrics.totalTests += apiResults.assertions.executed;
    metrics.passedTests += apiResults.assertions.executed - apiResults.assertions.failed;
    metrics.failedTests += apiResults.assertions.failed;
    metrics.totalDuration += apiResults.duration;
  }

  // UI tests
  if (uiResults) {
    metrics.totalTests += uiResults.total;
    metrics.passedTests += uiResults.passed;
    metrics.failedTests += uiResults.failed;
    metrics.totalDuration += uiResults.duration;
  }

  // Calculate pass rate
  if (metrics.totalTests > 0) {
    metrics.passRate = ((metrics.passedTests / metrics.totalTests) * 100).toFixed(2);
  }

  // Aggregate defects
  const allDefects = [
    ...(unitResults?.defects || []),
    ...(bddResults?.defects || []),
    ...(apiResults?.defects || []),
    ...(uiResults?.defects || []),
  ];

  metrics.defects.total = allDefects.length;

  allDefects.forEach((defect) => {
    // Count by severity
    if (defect.severity === 'CRITICAL') metrics.defects.critical++;
    else if (defect.severity === 'HIGH') metrics.defects.high++;
    else if (defect.severity === 'MEDIUM') metrics.defects.medium++;
    else metrics.defects.low++;

    // Count by category
    const category = defect.category.toLowerCase();
    if (category === 'functional') metrics.defects.byCategory.functional++;
    else if (category === 'integration') metrics.defects.byCategory.integration++;
    else if (category === 'api') metrics.defects.byCategory.api++;
    else if (category === 'ui') metrics.defects.byCategory.ui++;
  });

  return { metrics, defects: allDefects };
};

// Generate quality status
const getQualityStatus = (metrics) => {
  const status = {
    coverage: metrics.coverage >= CONFIG.thresholds.coverage ? '✅' : '❌',
    passRate: parseFloat(metrics.passRate) >= CONFIG.thresholds.passRate ? '✅' : '❌',
    duration: metrics.totalDuration <= CONFIG.thresholds.maxDuration ? '✅' : '⚠️',
    defects: metrics.defects.total === 0 ? '✅' : metrics.defects.critical > 0 ? '❌' : '⚠️',
  };

  const allPassed = Object.values(status).every((s) => s === '✅');
  status.overall = allPassed ? '✅ PASSED' : '❌ FAILED';
  status.health = allPassed ? 98 : Object.values(status).filter((s) => s === '✅').length * 20;

  return status;
};

// Generate markdown report
const generateMarkdownReport = (unitResults, bddResults, apiResults, uiResults, overall, status) => {
  const { metrics, defects } = overall;
  const timestamp = new Date().toISOString();

  let report = `# Test Automation Metrics Report

**Generated**: ${timestamp}  
**Status**: ${status.overall}  
**Build Health**: ${status.health}/100 ⭐

---

## 📊 Executive Summary

\`\`\`
╔══════════════════════════════════════════════════════════╗
║            QUALITY METRICS DASHBOARD                      ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║  Overall Status:       ${status.overall.padEnd(31)}║
║  Test Pass Rate:       ${metrics.passRate}% (${metrics.passedTests}/${metrics.totalTests}) ${status.passRate}              ║
║  Code Coverage:        ${metrics.coverage.toFixed(2)}% ${status.coverage}                       ║
║  Total Duration:       ${(metrics.totalDuration / 1000).toFixed(2)}s ${status.duration}                    ║
║  Defects Found:        ${metrics.defects.total} ${status.defects}                           ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
\`\`\`

---

## 1. Code Coverage Analysis

| Component | Coverage | Status | Target |
|-----------|----------|--------|--------|
| **Overall** | **${metrics.coverage.toFixed(2)}%** | **${status.coverage}** | ≥${CONFIG.thresholds.coverage}% |

`;

  if (unitResults && unitResults.coverage) {
    report += `
### Coverage Breakdown (from Unit Tests)

\`\`\`
${readFileIfExists(path.join(process.cwd(), 'backend/unit-test-results.txt'))?.split('---')[1]?.trim() || 'Coverage details not available'}
\`\`\`
`;
  }

  report += `
---

## 2. Test Execution Time

| Test Layer | Duration | Status | % of Total |
|------------|----------|--------|------------|
| **Unit Tests** | ${unitResults ? (unitResults.duration / 1000).toFixed(2) : 0}s | ${unitResults && unitResults.failed === 0 ? '✅' : '❌'} | ${unitResults ? ((unitResults.duration / metrics.totalDuration) * 100).toFixed(1) : 0}% |
| **BDD Tests** | ${bddResults ? (bddResults.duration / 1000).toFixed(2) : 0}s | ${bddResults && bddResults.scenarios.failed === 0 ? '✅' : '❌'} | ${bddResults ? ((bddResults.duration / metrics.totalDuration) * 100).toFixed(1) : 0}% |
| **API Tests** | ${apiResults ? (apiResults.duration / 1000).toFixed(2) : 0}s | ${apiResults && apiResults.assertions.failed === 0 ? '✅' : '❌'} | ${apiResults ? ((apiResults.duration / metrics.totalDuration) * 100).toFixed(1) : 0}% |
| **UI Tests** | ${uiResults ? (uiResults.duration / 1000).toFixed(2) : 0}s | ${uiResults && uiResults.failed === 0 ? '✅' : '❌'} | ${uiResults ? ((uiResults.duration / metrics.totalDuration) * 100).toFixed(1) : 0}% |
| **TOTAL** | **${(metrics.totalDuration / 1000).toFixed(2)}s** | **${status.duration}** | **100%** |

**Performance Status**: ${status.duration === '✅' ? 'Within acceptable range' : 'Exceeds threshold'} (Target: <${CONFIG.thresholds.maxDuration / 1000}s)

---

## 3. Pass/Fail Rate Analysis

### Overall Results

- **Total Tests**: ${metrics.totalTests}
- **Passed**: ${metrics.passedTests} (${status.passRate === '✅' ? '✅' : '❌'})
- **Failed**: ${metrics.failedTests}
- **Pass Rate**: **${metrics.passRate}%**
- **Target**: ≥${CONFIG.thresholds.passRate}%

### Breakdown by Test Layer

| Layer | Passed | Failed | Total | Pass Rate | Status |
|-------|--------|--------|-------|-----------|--------|
| **Unit Tests** | ${unitResults?.passed || 0} | ${unitResults?.failed || 0} | ${unitResults?.total || 0} | ${unitResults ? ((unitResults.passed / unitResults.total) * 100).toFixed(1) : 0}% | ${unitResults && unitResults.failed === 0 ? '✅' : '❌'} |
| **BDD Scenarios** | ${bddResults?.scenarios.passed || 0} | ${bddResults?.scenarios.failed || 0} | ${bddResults?.scenarios.total || 0} | ${bddResults?.scenarios.total ? ((bddResults.scenarios.passed / bddResults.scenarios.total) * 100).toFixed(1) : 0}% | ${bddResults && bddResults.scenarios.failed === 0 ? '✅' : '❌'} |
| **API Assertions** | ${apiResults ? apiResults.assertions.executed - apiResults.assertions.failed : 0} | ${apiResults?.assertions.failed || 0} | ${apiResults?.assertions.executed || 0} | ${apiResults?.assertions.executed ? (((apiResults.assertions.executed - apiResults.assertions.failed) / apiResults.assertions.executed) * 100).toFixed(1) : 0}% | ${apiResults && apiResults.assertions.failed === 0 ? '✅' : '❌'} |
| **UI Tests** | ${uiResults?.passed || 0} | ${uiResults?.failed || 0} | ${uiResults?.total || 0} | ${uiResults?.total ? ((uiResults.passed / uiResults.total) * 100).toFixed(1) : 0}% | ${uiResults && uiResults.failed === 0 ? '✅' : '❌'} |

---

## 4. Defects Analysis

### Summary

- **Total Defects**: ${metrics.defects.total}
- **Critical**: ${metrics.defects.critical} 🔴
- **High**: ${metrics.defects.high} 🟠
- **Medium**: ${metrics.defects.medium} 🟡
- **Low**: ${metrics.defects.low} 🟢

### Defects by Category

| Category | Count | Percentage |
|----------|-------|------------|
| Functional | ${metrics.defects.byCategory.functional} | ${metrics.defects.total ? ((metrics.defects.byCategory.functional / metrics.defects.total) * 100).toFixed(1) : 0}% |
| Integration | ${metrics.defects.byCategory.integration} | ${metrics.defects.total ? ((metrics.defects.byCategory.integration / metrics.defects.total) * 100).toFixed(1) : 0}% |
| API | ${metrics.defects.byCategory.api} | ${metrics.defects.total ? ((metrics.defects.byCategory.api / metrics.defects.total) * 100).toFixed(1) : 0}% |
| UI | ${metrics.defects.byCategory.ui} | ${metrics.defects.total ? ((metrics.defects.byCategory.ui / metrics.defects.total) * 100).toFixed(1) : 0}% |

`;

  if (defects.length > 0) {
    report += `
### Detailed Defect List

| # | Severity | Type | Name | Category |
|---|----------|------|------|----------|
`;
    defects.forEach((defect, index) => {
      const severityIcon = {
        CRITICAL: '🔴',
        HIGH: '🟠',
        MEDIUM: '🟡',
        LOW: '🟢',
      }[defect.severity];
      report += `| ${index + 1} | ${severityIcon} ${defect.severity} | ${defect.type} | ${defect.name} | ${defect.category} |\n`;
    });
  } else {
    report += `
### 🎉 No Defects Found!

All tests passed successfully. Great work!
`;
  }

  report += `
---

## 5. Quality Gates Status

| Gate | Threshold | Actual | Status |
|------|-----------|--------|--------|
| **Code Coverage** | ≥${CONFIG.thresholds.coverage}% | ${metrics.coverage.toFixed(2)}% | ${status.coverage} |
| **Pass Rate** | ≥${CONFIG.thresholds.passRate}% | ${metrics.passRate}% | ${status.passRate} |
| **Execution Time** | ≤${CONFIG.thresholds.maxDuration / 1000}s | ${(metrics.totalDuration / 1000).toFixed(2)}s | ${status.duration} |
| **Critical Defects** | 0 | ${metrics.defects.critical} | ${metrics.defects.critical === 0 ? '✅' : '❌'} |

**Overall Quality Gate**: ${status.overall}

---

## 6. Recommendations

`;

  const recommendations = [];

  if (parseFloat(metrics.passRate) < CONFIG.thresholds.passRate) {
    recommendations.push('- ⚠️ **Pass rate is below target**. Review and fix failing tests.');
  }

  if (metrics.coverage < CONFIG.thresholds.coverage) {
    recommendations.push('- ⚠️ **Coverage is below target**. Add more unit tests to uncovered code.');
  }

  if (metrics.totalDuration > CONFIG.thresholds.maxDuration) {
    recommendations.push('- ⚠️ **Execution time exceeds target**. Consider parallelizing tests or optimizing slow tests.');
  }

  if (metrics.defects.critical > 0) {
    recommendations.push('- 🔴 **Critical defects found**. These must be fixed immediately before release.');
  }

  if (metrics.defects.high > 0) {
    recommendations.push('- 🟠 **High-priority defects found**. Plan to fix these in the current sprint.');
  }

  if (recommendations.length === 0) {
    recommendations.push('- ✅ **All quality gates passed!** Maintain the current testing standards.');
    recommendations.push('- 💡 Consider increasing coverage targets or adding more edge case tests.');
  }

  report += recommendations.join('\n');

  report += `

---

## 7. Artifacts

- **Coverage Report**: \`backend/coverage/lcov-report/index.html\`
- **Unit Test Results**: \`backend/unit-test-results.txt\`
- **BDD Test Results**: \`backend/bdd-test-results.txt\`
- **API Test Results**: \`backend/api-test-results.txt\`
- **UI Test Results**: \`ui-tests/ui-test-results.txt\`

---

**Report Generated by**: Automated Metrics System  
**Timestamp**: ${timestamp}  
**Version**: 2.0.0
`;

  return report;
};

// Main function
const main = () => {
  console.log('🔍 Generating test metrics report...\n');

  const baseDir = process.cwd();

  // Read test results
  const unitContent = readFileIfExists(path.join(baseDir, 'backend/unit-test-results.txt'));
  const bddContent = readFileIfExists(path.join(baseDir, 'backend/bdd-test-results.txt'));
  const apiContent = readFileIfExists(path.join(baseDir, 'backend/api-test-results.txt'));
  const apiJsonContent = readJsonIfExists(path.join(baseDir, 'backend/api-test-results.json'));
  const uiContent = readFileIfExists(path.join(baseDir, 'ui-tests/ui-test-results.txt'));

  // Parse results
  const unitResults = parseUnitTests(unitContent);
  const bddResults = parseBddTests(bddContent);
  const apiResults = parseApiTests(apiContent, apiJsonContent);
  const uiResults = parseUiTests(uiContent);

  console.log('✅ Unit Tests:', unitResults ? 'Parsed' : 'Not found');
  console.log('✅ BDD Tests:', bddResults ? 'Parsed' : 'Not found');
  console.log('✅ API Tests:', apiResults ? 'Parsed' : 'Not found');
  console.log('✅ UI Tests:', uiResults ? 'Parsed' : 'Not found');
  console.log('');

  // Calculate overall metrics
  const overall = calculateOverallMetrics(unitResults, bddResults, apiResults, uiResults);
  const status = getQualityStatus(overall.metrics);

  console.log('📊 Overall Metrics:');
  console.log(`   - Total Tests: ${overall.metrics.totalTests}`);
  console.log(`   - Pass Rate: ${overall.metrics.passRate}%`);
  console.log(`   - Coverage: ${overall.metrics.coverage.toFixed(2)}%`);
  console.log(`   - Duration: ${(overall.metrics.totalDuration / 1000).toFixed(2)}s`);
  console.log(`   - Defects: ${overall.metrics.defects.total}`);
  console.log(`   - Status: ${status.overall}`);
  console.log('');

  // Generate report
  const report = generateMarkdownReport(unitResults, bddResults, apiResults, uiResults, overall, status);

  // Save reports
  const resultsDir = path.join(baseDir, 'test-results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  fs.writeFileSync(path.join(resultsDir, 'METRICS-REPORT.md'), report);
  fs.writeFileSync(
    path.join(resultsDir, 'metrics.json'),
    JSON.stringify({ timestamp: new Date().toISOString(), ...overall.metrics, status }, null, 2)
  );

  console.log('✅ Reports generated:');
  console.log(`   - test-results/METRICS-REPORT.md`);
  console.log(`   - test-results/metrics.json`);
  console.log('');

  // Exit with appropriate code based on quality gates
  if (status.overall.includes('FAILED')) {
    console.error('❌ Quality gates failed!');
    process.exit(1);
  } else {
    console.log('✅ All quality gates passed!');
    process.exit(0);
  }
};

// Run
main();
