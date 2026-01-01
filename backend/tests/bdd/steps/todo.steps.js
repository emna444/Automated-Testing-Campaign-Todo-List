import { Given, When } from '@cucumber/cucumber';
import { setResponse } from './common.steps.js';
import { createTodo, getTodoList, updateTodo, deleteTodo } from '../../../controller/todo.controller.js';
import TodoModel from '../../../model/todo.model.js';

let todoData;
let todoId = 'test-todo-id';

Given('I have todo data', function() {
  todoData = {
    text: 'Buy groceries',
    isComplete: false
  };
});

When('I create a todo', async function() {
  TodoModel.prototype.save = async function() {
    return {
      _id: todoId,
      text: this.text,
      isComplete: this.isComplete,
      user: this.user
    };
  };
  
  const req = { body: todoData, user: 'test-user-id' };
  const res = {
    statusCode: null,
    jsonData: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.jsonData = data;
    }
  };
  
  await createTodo(req, res);
  setResponse(res);
});

When('I get my todo list', async function() {
  TodoModel.find = async () => [
    { _id: '1', text: 'Todo 1', isComplete: false, user: 'test-user-id' },
    { _id: '2', text: 'Todo 2', isComplete: true, user: 'test-user-id' }
  ];
  
  const req = { user: 'test-user-id' };
  const res = {
    statusCode: null,
    jsonData: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.jsonData = data;
    }
  };
  
  await getTodoList(req, res);
  setResponse(res);
});

Given('I have a todo to update', function() {
  todoData = {
    text: 'Updated todo',
    isComplete: true
  };
});

When('I update the todo', async function() {
  TodoModel.findByIdAndUpdate = async () => ({
    _id: todoId,
    ...todoData
  });
  
  const req = { body: todoData, params: { id: todoId } };
  const res = {
    statusCode: null,
    jsonData: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.jsonData = data;
    }
  };
  
  await updateTodo(req, res);
  setResponse(res);
});

Given('I have a todo to delete', function() {
  todoId = 'test-todo-id';
});

When('I delete the todo', async function() {
  TodoModel.findByIdAndDelete = async () => ({
    _id: todoId,
    text: 'Deleted todo',
    isComplete: false
  });
  
  const req = { params: { id: todoId } };
  const res = {
    statusCode: null,
    jsonData: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.jsonData = data;
    }
  };
  
  await deleteTodo(req, res);
  setResponse(res);
});
