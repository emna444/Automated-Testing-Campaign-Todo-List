import { Given, When } from '@cucumber/cucumber';
import { setResponse } from './common.steps.js';
import { register, login, logout } from '../../../controller/user.controller.js';
import User from '../../../model/user.model.js';
import bcrypt from 'bcryptjs';

process.env.JWT_SECRET = 'test-secret';

let userData;
let loginData;

Given('I have registration data', function() {
  userData = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123'
  };
});

When('I register', async function() {
  User.findOne = async () => null;
  User.prototype.save = async function() {
    return { _id: 'test-id', ...userData };
  };
  
  const req = { body: userData };
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
  
  await register(req, res);
  setResponse(res);
});

Given('I have login credentials', function() {
  loginData = {
    email: 'test@example.com',
    password: 'password123'
  };
});

When('I login', async function() {
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  User.findOne = function() {
    return {
      select: async () => ({
        _id: 'test-id',
        email: 'test@example.com',
        password: hashedPassword
      })
    };
  };
  
  const req = { body: loginData };
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
  
  await login(req, res);
  setResponse(res);
});

When('I logout', async function() {
  const req = {};
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
  
  await logout(req, res);
  setResponse(res);
});
