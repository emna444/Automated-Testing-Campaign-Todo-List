import { Then } from '@cucumber/cucumber';
import { expect } from 'chai';

let response;

export function setResponse(res) {
  response = res;
}

export function getResponse() {
  return response;
}

Then('I should get status {int}', function(status) {
  expect(response.statusCode).to.equal(status);
});

Then('I should receive a token', function() {
  expect(response.jsonData.token).to.exist;
});
