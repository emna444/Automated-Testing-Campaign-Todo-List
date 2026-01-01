Feature: Todo Management
  Scenario: Create a todo
    Given I have todo data
    When I create a todo
    Then I should get status 201

  Scenario: Get todo list
    When I get my todo list
    Then I should get status 200

  Scenario: Update a todo
    Given I have a todo to update
    When I update the todo
    Then I should get status 200

  Scenario: Delete a todo
    Given I have a todo to delete
    When I delete the todo
    Then I should get status 200
