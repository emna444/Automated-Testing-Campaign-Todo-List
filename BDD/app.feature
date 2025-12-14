Feature: Todo List Application

  # ==========================================
  # Authentication Test Cases
  # ==========================================

  Scenario: TC-A001 - Signup with valid inputs
    Given the user is not registered
    When the user opens the signup page
    And the user enters valid email and password
    And the user clicks Signup
    Then the user should be created and redirected to login

  Scenario: TC-A002 - Signup with missing fields
    Given the user is on the signup page
    When the user leaves fields empty
    And the user clicks Signup
    Then the user should see an error "All fields required"

  Scenario: TC-A003 - Signup with invalid email
    Given the user is on the signup page
    When the user enters invalid email
    And the user enters valid password
    And the user submits the form
    Then the user should see an error "Invalid email format"

  Scenario: TC-A004 - Login with valid credentials
    Given a user exists in the system
    When the user enters correct email and password
    And the user clicks Login
    Then the dashboard should load and JWT should be stored

  Scenario: TC-A005 - Login with wrong password
    Given a user exists in the system
    When the user enters correct email
    And the user enters wrong password
    Then the user should see an error "Invalid credentials"

  Scenario: TC-A006 - Login with missing fields
    Given the user is on the login page
    When the user leaves fields empty
    And the user clicks Login
    Then an error message should be displayed

  # ==========================================
  # Access Control Test Cases
  # ==========================================

  Scenario: TC-AC001 - Access dashboard without login
    Given the user is not logged in
    When the user opens "/" root to dashboard in browser
    Then the user should be redirected to login OR receive 401 Unauthorized

  # ==========================================
  # Task Management Test Cases
  # ==========================================

  Scenario: TC-T001 - Create task with valid title
    Given the user is logged in
    When the user enters a task title
    And the user clicks Add
    Then the task should appear in list with status 201

  Scenario: TC-T002 - Create empty task
    Given the user is logged in
    When the user leaves title empty
    And the user clicks Add
    Then an error should be shown and no task should be created

  Scenario: TC-T003 - Edit task
    Given a task exists in the system
    When the user clicks Edit
    And the user modifies the title
    And the user saves changes
    Then the task should be updated successfully

  Scenario: TC-T004 - Delete task
    Given a task exists in the system
    When the user clicks Delete
    Then the task should be removed from list with status 200

  Scenario: TC-T005 - Toggle complete/incomplete
    Given a task exists in the system
    When the user clicks checkbox
    Then the UI and database should be updated

  Scenario: TC-T006 - Fetch task list
    Given the user is logged in and tasks exist
    When the user logs in
    And the user views dashboard
    Then the list should load with status 200 OK

  # ==========================================
  # Frontend Behavior Test Cases
  # ==========================================

  Scenario: TC-F001 - Signup form validation
    Given the user is on the signup page
    When the user enters invalid email or password
    And the user submits the form
    Then validation errors should be displayed

  Scenario: TC-F002 - UI feedback after task creation
    Given the user is logged in
    When the user adds a valid task
    Then feedback "Task added" should be displayed

  Scenario: TC-F003 - Navigation after login
    Given a user exists in the system
    When the user logs in with valid credentials
    Then the user should be redirected to dashboard

  # ==========================================
  # Backend API Test Cases
  # ==========================================

  Scenario: TC-API001 - POST /signup success
    Given the email is unused
    When a POST request is sent to /signup with valid data
    Then the response should be 201 Created with success message

  Scenario: TC-API002 - POST /login returns JWT
    Given a user exists in the system
    When a POST request is sent to /login
    Then the response should be 200 OK with token returned

  Scenario: TC-API003 - GET /tasks without token
    Given no authentication token is provided
    When a GET request is sent to /tasks with no Authorization header
    Then the response should be 401 Unauthorized

  Scenario: TC-API004 - PUT /tasks/:id invalid ID
    Given the user is logged in
    When a PUT request is called with invalid task ID
    Then the response should be 404 Task not found
