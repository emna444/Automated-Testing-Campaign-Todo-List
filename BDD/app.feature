Feature: Todo List Application

  # User Authentication
  Scenario: Successful Sign Up
    Given the user is on the sign-up page
    When the user enters a valid username, email, and password and clicks "Sign Up"
    Then the user should see a success message and be redirected to the login page

  Scenario: Sign Up with Existing Email
    Given the user is on the sign-up page
    When the user enters an email that is already registered and clicks "Sign Up"
    Then the user should see an error message indicating the email is already in use

  Scenario: Sign Up with Invalid Email
    Given the user is on the sign-up page
    When the user enters an invalid email and clicks "Sign Up"
    Then the user should see an error message indicating the email format is invalid

  Scenario: Sign Up with Short Password
    Given the user is on the sign-up page
    When the user enters a password shorter than 6 characters and clicks "Sign Up"
    Then the user should see an error message indicating the password is too short

  Scenario: Sign Up with Empty Fields
    Given the user is on the sign-up page
    When the user leaves all fields empty and clicks "Sign Up"
    Then the user should see an error message indicating all fields are required

  Scenario: Successful Login
    Given the user is on the login page
    When the user enters a valid email and password and clicks "Login"
    Then the user should be logged in and see their todo list

  Scenario: Login with Wrong Password
    Given the user is on the login page
    When the user enters a valid email and an incorrect password and clicks "Login"
    Then the user should see an error message indicating invalid credentials

  Scenario: Login with Unregistered Email
    Given the user is on the login page
    When the user enters an unregistered email and clicks "Login"
    Then the user should see an error message indicating the account does not exist

  Scenario: Login with Empty Fields
    Given the user is on the login page
    When the user leaves all fields empty and clicks "Login"
    Then the user should see an error message indicating all fields are required

  Scenario: Logout
    Given the user is logged in
    When the user clicks the "Logout" button
    Then the user should be logged out and redirected to the login page

  # Todo Management
  Scenario: Add a New Todo
    Given the user is logged in and on their todo list page
    When the user enters a new todo item and clicks "Add"
    Then the new todo should appear in the list

  Scenario: Add Todo with Empty Text
    Given the user is logged in and on their todo list page
    When the user leaves the todo text empty and clicks "Add"
    Then the user should see an error message indicating the todo text is required

  Scenario: Add Todo with Special Characters
    Given the user is logged in and on their todo list page
    When the user enters a todo item with special characters and clicks "Add"
    Then the new todo should appear in the list

  Scenario: Add Duplicate Todo
    Given the user is logged in and on their todo list page
    When the user enters a todo item that already exists and clicks "Add"
    Then the user should see an error message indicating duplicate todos are not allowed

  Scenario: View Todo List
    Given the user is logged in
    When the user navigates to the todo list page
    Then the user should see all their todo items

  Scenario: Mark Todo as Completed
    Given the user has a todo item in their list
    When the user marks the todo as completed
    Then the todo item should be shown as completed

  Scenario: Mark Todo as Not Completed
    Given the user has a completed todo item in their list
    When the user marks the todo as not completed
    Then the todo item should be shown as not completed

  Scenario: Edit Todo Item
    Given the user has a todo item in their list
    When the user edits the todo text and saves changes
    Then the updated todo should appear in the list

  Scenario: Edit Todo to Empty Text
    Given the user has a todo item in their list
    When the user edits the todo text to be empty and saves changes
    Then the user should see an error message indicating the todo text is required

  Scenario: Delete a Todo
    Given the user has a todo item in their list
    When the user clicks the delete button for that todo
    Then the todo item should be removed from the list

  Scenario: Delete All Todos
    Given the user has multiple todo items in their list
    When the user clicks the delete button for each todo
    Then the todo list should be empty

  Scenario: Add Todo with Maximum Length
    Given the user is logged in and on their todo list page
    When the user enters a todo item with the maximum allowed length and clicks "Add"
    Then the new todo should appear in the list

  Scenario: Add Todo Exceeding Maximum Length
    Given the user is logged in and on their todo list page
    When the user enters a todo item exceeding the maximum allowed length and clicks "Add"
    Then the user should see an error message indicating the todo text is too long

  Scenario: Add Todo with Only Spaces
    Given the user is logged in and on their todo list page
    When the user enters a todo item with only spaces and clicks "Add"
    Then the user should see an error message indicating the todo text is required

  Scenario: Add Todo with HTML Tags
    Given the user is logged in and on their todo list page
    When the user enters a todo item containing HTML tags and clicks "Add"
    Then the new todo should appear in the list

  Scenario: Add Todo with Numbers
    Given the user is logged in and on their todo list page
    When the user enters a todo item containing only numbers and clicks "Add"
    Then the new todo should appear in the list

  Scenario: Add Todo with Mixed Content
    Given the user is logged in and on their todo list page
    When the user enters a todo item containing letters, numbers, and symbols and clicks "Add"
    Then the new todo should appear in the list

  Scenario: Add Todo with Unicode Characters
    Given the user is logged in and on their todo list page
    When the user enters a todo item containing Unicode characters and clicks "Add"
    Then the new todo should appear in the list

  Scenario: Add Todo with Emoji
    Given the user is logged in and on their todo list page
    When the user enters a todo item containing emoji and clicks "Add"
    Then the new todo should appear in the list

  Scenario: Add Todo with Line Breaks
    Given the user is logged in and on their todo list page
    When the user enters a todo item containing line breaks and clicks "Add"
    Then the new todo should appear in the list

  Scenario: Add Todo with Tab Characters
    Given the user is logged in and on their todo list page
    When the user enters a todo item containing tab characters and clicks "Add"
    Then the new todo should appear in the list

  Scenario: Add Todo with Quotes
    Given the user is logged in and on their todo list page
    When the user enters a todo item containing single and double quotes and clicks "Add"
    Then the new todo should appear in the list

  Scenario: Add Todo with Backslash
    Given the user is logged in and on their todo list page
    When the user enters a todo item containing a backslash and clicks "Add"
    Then the new todo should appear in the list

  Scenario: Add Todo with Forward Slash
    Given the user is logged in and on their todo list page
    When the user enters a todo item containing a forward slash and clicks "Add"
    Then the new todo should appear in the list

  Scenario: Add Todo with Comma
    Given the user is logged in and on their todo list page
    When the user enters a todo item containing a comma and clicks "Add"
    Then the new todo should appear in the list

  Scenario: Add Todo with Period
    Given the user is logged in and on their todo list page
    When the user enters a todo item containing a period and clicks "Add"
    Then the new todo should appear in the list

  Scenario: Add Todo with Exclamation Mark
    Given the user is logged in and on their todo list page
    When the user enters a todo item containing an exclamation mark and clicks "Add"
    Then the new todo should appear in the list

  Scenario: Add Todo with Question Mark
    Given the user is logged in and on their todo list page
    When the user enters a todo item containing a question mark and clicks "Add"
    Then the new todo should appear in the list

  Scenario: Add Todo with Parentheses
    Given the user is logged in and on their todo list page
    When the user enters a todo item containing parentheses and clicks "Add"
    Then the new todo should appear in the list

  Scenario: Add Todo with Brackets
    Given the user is logged in and on their todo list page
    When the user enters a todo item containing brackets and clicks "Add"
    Then the new todo should appear in the list

  Scenario: Add Todo with Braces
    Given the user is logged in and on their todo list page
    When the user enters a todo item containing braces and clicks "Add"
    Then the new todo should appear in the list

  Scenario: Add Todo with Colon
    Given the user is logged in and on their todo list page
    When the user enters a todo item containing a colon and clicks "Add"
    Then the new todo should appear in the list

  Scenario: Add Todo with Semicolon
    Given the user is logged in and on their todo list page
    When the user enters a todo item containing a semicolon and clicks "Add"
    Then the new todo should appear in the list

  Scenario: Add Todo with At Symbol
    Given the user is logged in and on their todo list page
    When the user enters a todo item containing an at symbol and clicks "Add"
    Then the new todo should appear in the list

  Scenario: Add Todo with Hash Symbol
    Given the user is logged in and on their todo list page
    When the user enters a todo item containing a hash symbol and clicks "Add"
    Then the new todo should appear in the list

  Scenario: Add Todo with Dollar Sign
    Given the user is logged in and on their todo list page
    When the user enters a todo item containing a dollar sign and clicks "Add"
    Then the new todo should appear in the list

  Scenario: Add Todo with Percent Sign
    Given the user is logged in and on their todo list page
    When the user enters a todo item containing a percent sign and clicks "Add"
    Then the new todo should appear in the list

  Scenario: Add Todo with Ampersand
    Given the user is logged in and on their todo list page
    When the user enters a todo item containing an ampersand and clicks "Add"
    Then the new todo should appear in the list

  Scenario: Add Todo with Asterisk
    Given the user is logged in and on their todo list page
    When the user enters a todo item containing an asterisk and clicks "Add"
    Then the new todo should appear in the list

  Scenario: Add Todo with Underscore
    Given the user is logged in and on their todo list page
    When the user enters a todo item containing an underscore and clicks "Add"
    Then the new todo should appear in the list

  Scenario: Add Todo with Pipe Symbol
    Given the user is logged in and on their todo list page
    When the user enters a todo item containing a pipe symbol and clicks "Add"
    Then the new todo should appear in the list

  # Error Handling & Edge Cases
  Scenario: Backend Server Down
    Given the backend server is not running
    When the user tries to log in
    Then the user should see an error message indicating a server error

  Scenario: Database Not Connected
    Given the database is not connected
    When the user tries to sign up
    Then the user should see an error message indicating a database error

  Scenario: Unauthorized Access to Todos
    Given the user is not logged in
    When the user tries to access the todo list page
    Then the user should be redirected to the login page

  Scenario: Access Another User's Todos
    Given the user is logged in
    When the user tries to access another user's todo list
    Then the user should see an error message indicating unauthorized access

  Scenario: Session Expired
    Given the user is logged in
    When the user's session expires
    Then the user should be logged out and redirected to the login page
