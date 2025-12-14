const { Given, When, Then, Before, After, setDefaultTimeout } = require('@cucumber/cucumber');
const axios = require('axios');
const { expect } = require('chai');

setDefaultTimeout(10000);

const BASE_URL = 'http://localhost:4001';
const testContext = {};

// Helper function to generate unique test data
function generateTestUser() {
  const timestamp = Date.now();
  return {
    username: `testuser${timestamp}`,
    email: `test${timestamp}@example.com`,
    password: 'Test123456'
  };
}

Before(function () {
  testContext.user = generateTestUser();
  testContext.response = null;
  testContext.error = null;
  testContext.token = null;
  testContext.taskId = null;
  testContext.taskTitle = null;
});

After(async function () {
  // Cleanup: Delete test user and tasks if needed
  // This can be expanded based on your cleanup requirements
});

// ==========================================
// Authentication Test Cases
// ==========================================

Given('the user is not registered', function () {
  testContext.user = generateTestUser();
});

When('the user opens the signup page', function () {
  testContext.signupData = { ...testContext.user };
});

When('the user enters valid email and password', function () {
  testContext.signupData = { ...testContext.user };
});

When('the user clicks Signup', async function () {
  try {
    testContext.response = await axios.post(`${BASE_URL}/user/sign-up`, testContext.signupData);
    testContext.error = null;
  } catch (error) {
    testContext.error = error.response || error;
    testContext.response = error.response;
  }
});

Then('the user should be created and redirected to login', function () {
  expect(testContext.response).to.exist;
  expect([200, 201]).to.include(testContext.response.status);
});

Given('the user is on the signup page', function () {
  testContext.signupData = {};
});

When('the user leaves fields empty', function () {
  testContext.signupData = { username: '', email: '', password: '' };
});

Then('the user should see an error {string}', function (errorMessage) {
  expect(testContext.error).to.exist;
  expect(testContext.response.status).to.be.at.least(400);
});

When('the user enters invalid email', function () {
  testContext.signupData = { ...testContext.user, email: 'invalid-email' };
});

When('the user enters valid password', function () {
  if (!testContext.signupData) testContext.signupData = {};
  testContext.signupData.password = 'ValidPass123';
});

When('the user submits the form', async function () {
  try {
    testContext.response = await axios.post(`${BASE_URL}/user/sign-up`, testContext.signupData);
    testContext.error = null;
  } catch (error) {
    testContext.error = error.response || error;
    testContext.response = error.response;
  }
});

Given('a user exists in the system', async function () {
  testContext.user = generateTestUser();
  try {
    await axios.post(`${BASE_URL}/user/sign-up`, testContext.user);
  } catch (error) {
    // User might already exist, continue
  }
});

When('the user enters correct email and password', function () {
  testContext.loginData = {
    email: testContext.user.email,
    password: testContext.user.password
  };
});

When('the user clicks Login', async function () {
  try {
    testContext.response = await axios.post(`${BASE_URL}/user/sign-in`, testContext.loginData);
    testContext.token = testContext.response.data.token;
    testContext.error = null;
  } catch (error) {
    testContext.error = error.response || error;
    testContext.response = error.response;
  }
});

Then('the dashboard should load and JWT should be stored', function () {
  expect(testContext.response.status).to.equal(200);
  expect(testContext.token).to.exist;
});

When('the user enters correct email', function () {
  testContext.loginData = { email: testContext.user.email };
});

When('the user enters wrong password', function () {
  testContext.loginData = {
    ...testContext.loginData,
    password: 'WrongPassword123'
  };
});

Given('the user is on the login page', function () {
  testContext.loginData = {};
});

Then('an error message should be displayed', function () {
  expect(testContext.error).to.exist;
  expect(testContext.response.status).to.be.at.least(400);
});

// ==========================================
// Access Control Test Cases
// ==========================================

Given('the user is not logged in', function () {
  testContext.token = null;
});

When('the user opens {string} root to dashboard in browser', async function (path) {
  try {
    testContext.response = await axios.get(`${BASE_URL}/todo/fetch`);
  } catch (error) {
    testContext.error = error.response || error;
    testContext.response = error.response;
  }
});

Then('the user should be redirected to login OR receive {int} Unauthorized', function (statusCode) {
  expect(testContext.response.status).to.equal(statusCode);
});

// ==========================================
// Task Management Test Cases
// ==========================================

Given('the user is logged in', async function () {
  testContext.user = generateTestUser();
  await axios.post(`${BASE_URL}/user/sign-up`, testContext.user);
  const loginResponse = await axios.post(`${BASE_URL}/user/sign-in`, {
    email: testContext.user.email,
    password: testContext.user.password
  });
  testContext.token = loginResponse.data.token;
});

When('the user enters a task title', function () {
  testContext.taskTitle = `Test Task ${Date.now()}`;
});

When('the user clicks Add', async function () {
  try {
    testContext.response = await axios.post(
      `${BASE_URL}/todo/create`,
      { title: testContext.taskTitle },
      { headers: { Authorization: `Bearer ${testContext.token}` } }
    );
    testContext.taskId = testContext.response.data._id || testContext.response.data.id;
    testContext.error = null;
  } catch (error) {
    testContext.error = error.response || error;
    testContext.response = error.response;
  }
});

Then('the task should appear in list with status {int}', function (statusCode) {
  expect(testContext.response.status).to.equal(statusCode);
});

When('the user leaves title empty', function () {
  testContext.taskTitle = '';
});

Then('an error should be shown and no task should be created', function () {
  expect(testContext.error).to.exist;
  expect(testContext.response.status).to.be.at.least(400);
});

Given('a task exists in the system', async function () {
  if (!testContext.token) {
    testContext.user = generateTestUser();
    await axios.post(`${BASE_URL}/user/sign-up`, testContext.user);
    const loginResponse = await axios.post(`${BASE_URL}/user/sign-in`, {
      email: testContext.user.email,
      password: testContext.user.password
    });
    testContext.token = loginResponse.data.token;
  }
  
  const taskResponse = await axios.post(
    `${BASE_URL}/todo/create`,
    { title: `Test Task ${Date.now()}` },
    { headers: { Authorization: `Bearer ${testContext.token}` } }
  );
  testContext.taskId = taskResponse.data._id || taskResponse.data.id;
  testContext.taskTitle = taskResponse.data.title;
});

When('the user clicks Edit', function () {
  testContext.editMode = true;
});

When('the user modifies the title', function () {
  testContext.taskTitle = `Modified Task ${Date.now()}`;
});

When('the user saves changes', async function () {
  try {
    testContext.response = await axios.put(
      `${BASE_URL}/todo/update/${testContext.taskId}`,
      { title: testContext.taskTitle },
      { headers: { Authorization: `Bearer ${testContext.token}` } }
    );
    testContext.error = null;
  } catch (error) {
    testContext.error = error.response || error;
    testContext.response = error.response;
  }
});

Then('the task should be updated successfully', function () {
  expect(testContext.response.status).to.equal(200);
});

When('the user clicks Delete', async function () {
  try {
    testContext.response = await axios.delete(
      `${BASE_URL}/todo/delete/${testContext.taskId}`,
      { headers: { Authorization: `Bearer ${testContext.token}` } }
    );
    testContext.error = null;
  } catch (error) {
    testContext.error = error.response || error;
    testContext.response = error.response;
  }
});

Then('the task should be removed from list with status {int}', function (statusCode) {
  expect(testContext.response.status).to.equal(statusCode);
});

When('the user clicks checkbox', async function () {
  try {
    testContext.response = await axios.put(
      `${BASE_URL}/todo/update/${testContext.taskId}`,
      { completed: true },
      { headers: { Authorization: `Bearer ${testContext.token}` } }
    );
    testContext.error = null;
  } catch (error) {
    testContext.error = error.response || error;
    testContext.response = error.response;
  }
});

Then('the UI and database should be updated', function () {
  expect(testContext.response.status).to.be.at.most(299);
});

Given('the user is logged in and tasks exist', async function () {
  testContext.user = generateTestUser();
  await axios.post(`${BASE_URL}/user/sign-up`, testContext.user);
  const loginResponse = await axios.post(`${BASE_URL}/user/sign-in`, {
    email: testContext.user.email,
    password: testContext.user.password
  });
  testContext.token = loginResponse.data.token;
  
  await axios.post(
    `${BASE_URL}/todo/create`,
    { title: `Test Task ${Date.now()}` },
    { headers: { Authorization: `Bearer ${testContext.token}` } }
  );
});

When('the user logs in', async function () {
  const loginResponse = await axios.post(`${BASE_URL}/user/sign-in`, {
    email: testContext.user.email,
    password: testContext.user.password
  });
  testContext.token = loginResponse.data.token;
});

When('the user views dashboard', async function () {
  try {
    testContext.response = await axios.get(
      `${BASE_URL}/todo/fetch`,
      { headers: { Authorization: `Bearer ${testContext.token}` } }
    );
    testContext.error = null;
  } catch (error) {
    testContext.error = error.response || error;
    testContext.response = error.response;
  }
});

Then('the list should load with status {int} OK', function (statusCode) {
  expect(testContext.response.status).to.equal(statusCode);
});

// ==========================================
// Frontend Behavior Test Cases
// ==========================================

When('the user enters invalid email or password', function () {
  testContext.signupData = {
    username: 'test',
    email: 'invalid',
    password: '123'
  };
});

Then('validation errors should be displayed', function () {
  expect(testContext.error).to.exist;
  expect(testContext.response.status).to.be.at.least(400);
});

When('the user adds a valid task', async function () {
  testContext.taskTitle = `Valid Task ${Date.now()}`;
  try {
    testContext.response = await axios.post(
      `${BASE_URL}/todo/create`,
      { title: testContext.taskTitle },
      { headers: { Authorization: `Bearer ${testContext.token}` } }
    );
    testContext.error = null;
  } catch (error) {
    testContext.error = error.response || error;
    testContext.response = error.response;
  }
});

Then('feedback {string} should be displayed', function (message) {
  expect(testContext.response).to.exist;
  expect(testContext.response.status).to.be.at.most(299);
});

When('the user logs in with valid credentials', async function () {
  const loginResponse = await axios.post(`${BASE_URL}/user/sign-in`, {
    email: testContext.user.email,
    password: testContext.user.password
  });
  testContext.token = loginResponse.data.token;
  testContext.response = loginResponse;
});

Then('the user should be redirected to dashboard', function () {
  expect(testContext.response.status).to.equal(200);
  expect(testContext.token).to.exist;
});

// ==========================================
// Backend API Test Cases
// ==========================================

Given('the email is unused', function () {
  testContext.user = generateTestUser();
});

When('a POST request is sent to \\/signup with valid data', async function () {
  try {
    testContext.response = await axios.post(`${BASE_URL}/user/sign-up`, testContext.user);
    testContext.error = null;
  } catch (error) {
    testContext.error = error.response || error;
    testContext.response = error.response;
  }
});

Then('the response should be {int} Created with success message', function (statusCode) {
  expect(testContext.response.status).to.equal(statusCode);
});

When('a POST request is sent to \\/login', async function () {
  try {
    testContext.response = await axios.post(`${BASE_URL}/user/sign-in`, {
      email: testContext.user.email,
      password: testContext.user.password
    });
    testContext.token = testContext.response.data.token;
    testContext.error = null;
  } catch (error) {
    testContext.error = error.response || error;
    testContext.response = error.response;
  }
});

Then('the response should be {int} OK with token returned', function (statusCode) {
  expect(testContext.response.status).to.equal(statusCode);
  expect(testContext.token).to.exist;
});

Given('no authentication token is provided', function () {
  testContext.token = null;
});

When('a GET request is sent to \\/tasks with no Authorization header', async function () {
  try {
    testContext.response = await axios.get(`${BASE_URL}/todo/fetch`);
  } catch (error) {
    testContext.error = error.response || error;
    testContext.response = error.response;
  }
});

Then('the response should be {int} Unauthorized', function (statusCode) {
  expect(testContext.response.status).to.equal(statusCode);
});

When('a PUT request is called with invalid task ID', async function () {
  try {
    testContext.response = await axios.put(
      `${BASE_URL}/todo/update/invalid-id-123`,
      { title: 'Test' },
      { headers: { Authorization: `Bearer ${testContext.token}` } }
    );
  } catch (error) {
    testContext.error = error.response || error;
    testContext.response = error.response;
  }
});

Then('the response should be {int} Task not found', function (statusCode) {
  expect(testContext.response.status).to.equal(statusCode);
});
