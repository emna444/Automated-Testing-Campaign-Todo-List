#!/usr/bin/env node

/**
 * Test Runner Script
 * This script helps you run different types of tests
 */

const { spawn } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function runCommand(command, description) {
  return new Promise((resolve, reject) => {
    console.log(`\n🚀 ${description}...`);
    console.log(`Running: ${command}\n`);
    
    const child = spawn(command, [], { 
      shell: true, 
      stdio: 'inherit',
      cwd: process.cwd()
    });

    child.on('close', (code) => {
      if (code !== 0) {
        console.log(`\n❌ ${description} failed with code ${code}\n`);
        resolve(false);
      } else {
        console.log(`\n✅ ${description} completed successfully\n`);
        resolve(true);
      }
    });

    child.on('error', (err) => {
      console.error(`\n❌ Error running ${description}:`, err);
      resolve(false);
    });
  });
}

function showMenu() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║     Test Suite Runner                  ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('\n1. Run Unit Tests');
  console.log('2. Run BDD Tests (Cucumber)');
  console.log('3. Run API Tests (Newman) - Server must be running!');
  console.log('4. Run All Tests (Unit + BDD)');
  console.log('5. Run All Tests (Unit + BDD + API) - Server must be running!');
  console.log('6. Generate Code Coverage Report');
  console.log('7. Exit');
  console.log('\n');
}

async function handleChoice(choice) {
  let success = true;
  
  switch (choice) {
    case '1':
      success = await runCommand('npm run test:unit', 'Unit Tests');
      break;
    case '2':
      success = await runCommand('npm run test:bdd', 'BDD Tests');
      break;
    case '3':
      console.log('\n⚠️  WARNING: Make sure the backend server is running on port 5000!');
      console.log('   Start it in another terminal with: npm start\n');
      await new Promise(resolve => setTimeout(resolve, 2000));
      success = await runCommand('npm run test:api', 'API Tests');
      break;
    case '4':
      success = await runCommand('npm run test:unit', 'Unit Tests');
      if (success) {
        success = await runCommand('npm run test:bdd', 'BDD Tests');
      }
      break;
    case '5':
      console.log('\n⚠️  WARNING: Make sure the backend server is running on port 5000!');
      console.log('   Start it in another terminal with: npm start\n');
      await new Promise(resolve => setTimeout(resolve, 2000));
      success = await runCommand('npm run test:all', 'All Tests');
      break;
    case '6':
      success = await runCommand('npm run test:coverage', 'Code Coverage');
      if (success) {
        console.log('\n📊 Coverage report generated at: coverage/index.html');
      }
      break;
    case '7':
      console.log('\n👋 Goodbye!\n');
      rl.close();
      process.exit(0);
      break;
    default:
      console.log('\n❌ Invalid choice. Please try again.\n');
  }
  
  return success;
}

async function main() {
  console.log('\n');
  console.log('═'.repeat(50));
  console.log('  TODO List Backend - Test Suite Runner');
  console.log('═'.repeat(50));
  
  const prompt = () => {
    showMenu();
    rl.question('Select an option (1-7): ', async (choice) => {
      await handleChoice(choice.trim());
      prompt();
    });
  };
  
  prompt();
}

main();
