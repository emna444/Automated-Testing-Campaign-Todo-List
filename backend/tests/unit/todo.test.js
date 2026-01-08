//ED
import { test } from "node:test";
import assert from "node:assert";
import { 
  createTodo, 
  getTodoList, 
  updateTodo, 
  deleteTodo 
} from "../../controller/todo.controller.js";
import TodoModel from "../../model/todo.model.js";

// Suppress console logs during tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
console.log = () => {};
console.error = () => {};

// ===================================
// FAKE RESPONSE
// ===================================
function createRes() {
  return {
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
}

// ===================================
// CREATE TODO TESTS
// ===================================

test("createTodo → INTENTIONAL FAILING TEST for defect detection", async () => {
  // This test is designed to fail to verify defect detection
  const req = { body: { text: "Test todo", user: "user123" } };
  const res = createRes();
  
  await createTodo(req, res);
  
  // Intentionally wrong assertion to trigger a defect
  assert.strictEqual(res.statusCode, 999, "This should fail - checking defect detection");
});

test("createTodo → returns 201 when todo created successfully", async () => {
  // Mock the save method
  TodoModel.prototype.save = async function() {
    return {
      _id: "todo123",
      text: this.text,
      isComplete: this.isComplete,
      user: this.user
    };
  };

  const req = {
    body: { text: "Buy groceries" },
    user: "user123"
  };

  const res = createRes();
  await createTodo(req, res);

  assert.equal(res.statusCode, 201);
  assert.ok(res.jsonData.message);
  assert.ok(res.jsonData.newTodo);
  assert.equal(res.jsonData.newTodo.text, "Buy groceries");
});

test("createTodo → returns 500 when save fails", async () => {
  // Mock the save method to throw error
  TodoModel.prototype.save = async function() {
    throw new Error("Database error");
  };

  const req = {
    body: { text: "Buy groceries" },
    user: "user123"
  };

  const res = createRes();
  await createTodo(req, res);

  assert.equal(res.statusCode, 500);
  assert.equal(res.jsonData.message, "Error in todo creation");
});

// ===================================
// GET TODO LIST TESTS
// ===================================

test("getTodoList → returns 200 with todo list", async () => {
  // Mock TodoModel.find
  TodoModel.find = async (query) => {
    return [
      { _id: "1", text: "Todo 1", isComplete: false, user: query.user },
      { _id: "2", text: "Todo 2", isComplete: true, user: query.user }
    ];
  };

  const req = {
    user: "user123"
  };

  const res = createRes();
  await getTodoList(req, res);

  assert.equal(res.statusCode, 200);
  assert.ok(res.jsonData.message);
  assert.ok(Array.isArray(res.jsonData.todoList));
  assert.equal(res.jsonData.todoList.length, 2);
});

test("getTodoList → returns empty array when no todos", async () => {
  // Mock TodoModel.find to return empty array
  TodoModel.find = async () => [];

  const req = {
    user: "user123"
  };

  const res = createRes();
  await getTodoList(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.jsonData.todoList.length, 0);
});

test("getTodoList → returns 500 when database error", async () => {
  // Mock TodoModel.find to throw error
  TodoModel.find = async () => {
    throw new Error("Database error");
  };

  const req = {
    user: "user123"
  };

  const res = createRes();
  await getTodoList(req, res);

  assert.equal(res.statusCode, 500);
  assert.equal(res.jsonData.message, "Error in fetch todo list");
});

// ===================================
// UPDATE TODO TESTS
// ===================================

test("updateTodo → returns 200 when todo updated successfully", async () => {
  // Mock TodoModel.findByIdAndUpdate
  TodoModel.findByIdAndUpdate = async (id, updateData, options) => {
    return {
      _id: id,
      text: updateData.text || "Original text",
      isComplete: updateData.isComplete !== undefined ? updateData.isComplete : false,
      user: "user123"
    };
  };

  const req = {
    params: { id: "todo123" },
    body: { text: "Updated todo", isComplete: true }
  };

  const res = createRes();
  await updateTodo(req, res);

  assert.equal(res.statusCode, 200);
  assert.ok(res.jsonData.message);
  assert.ok(res.jsonData.todo);
  assert.equal(res.jsonData.todo.text, "Updated todo");
  assert.equal(res.jsonData.todo.isComplete, true);
});


test("updateTodo → returns 500 when update fails", async () => {
  // Mock TodoModel.findByIdAndUpdate to throw error
  TodoModel.findByIdAndUpdate = async () => {
    throw new Error("Database error");
  };

  const req = {
    params: { id: "todo123" },
    body: { text: "Updated todo" }
  };

  const res = createRes();
  await updateTodo(req, res);

  assert.equal(res.statusCode, 500);
  assert.equal(res.jsonData.message, "Error in fetching todo list");
});

// ===================================
// DELETE TODO TESTS
// ===================================

test("deleteTodo → returns 200 when todo deleted successfully", async () => {
  // Mock TodoModel.findByIdAndDelete
  TodoModel.findByIdAndDelete = async (id) => {
    return {
      _id: id,
      text: "Deleted todo",
      isComplete: false,
      user: "user123"
    };
  };

  const req = {
    params: { id: "todo123" }
  };

  const res = createRes();
  await deleteTodo(req, res);

  assert.equal(res.statusCode, 200);
  assert.ok(res.jsonData.message);
  assert.ok(res.jsonData.todo);
});

test("deleteTodo → returns 404 when todo not found", async () => {
  // Mock TodoModel.findByIdAndDelete to return null
  TodoModel.findByIdAndDelete = async () => null;

  const req = {
    params: { id: "nonexistent123" }
  };

  const res = createRes();
  await deleteTodo(req, res);

  assert.equal(res.statusCode, 404);
  assert.equal(res.jsonData.message, "Todo not found");
});

test("deleteTodo → returns 500 when delete fails", async () => {
  // Mock TodoModel.findByIdAndDelete to throw error
  TodoModel.findByIdAndDelete = async () => {
    throw new Error("Database error");
  };

  const req = {
    params: { id: "todo123" }
  };

  const res = createRes();
  await deleteTodo(req, res);

  assert.equal(res.statusCode, 500);
  assert.equal(res.jsonData.message, "Error in fetching todo list");
});