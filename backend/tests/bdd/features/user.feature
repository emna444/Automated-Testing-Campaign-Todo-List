Feature: User Authentication
  Scenario: Register a user
    Given I have registration data
    When I register
    Then I should get status 201

  Scenario: Login with valid credentials
    Given I have login credentials
    When I login
    Then I should get status 200
    And I should receive a token

  Scenario: Logout
    When I logout
    Then I should get status 200
