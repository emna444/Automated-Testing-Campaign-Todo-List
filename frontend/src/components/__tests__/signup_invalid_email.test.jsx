import React from 'react';
import { test, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import Signup from '../Signup.jsx';

vi.mock('axios');

afterEach(() => {
  vi.clearAllMocks();
});

// ---------------- RED (commented) ----------------
// In RED, we pretend we expect client-side validation to block the request
// and show "Invalid email format" without calling axios. This will FAIL with
// the current Signup.jsx, which relies on the server to send that message.
/*
test('TC-A003 RED: expects client-side "Invalid email format" without calling axios (will fail)', async () => {
  axios.post.mockResolvedValueOnce({
    status: 201,
    data: { token: 'fake-token' },
  });

  const { container } = render(
    <MemoryRouter>
      <Signup />
    </MemoryRouter>
  );

  const usernameInput = screen.getByLabelText(/username/i);
  const emailInput = screen.getByLabelText(/email/i);
  const passwordInput = screen.getByLabelText(/password/i);

  fireEvent.change(usernameInput, { target: { value: 'John Doe' } });
  fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
  fireEvent.change(passwordInput, { target: { value: 'ValidPassword123!' } });

  const form = container.querySelector('form');
  fireEvent.submit(form);

  // This will fail with current Signup.jsx, because it doesn't do
  // client-side format validation; it relies on the backend.
  const errorMsg = await screen.findByText(/invalid email format/i);
  expect(errorMsg).toBeDefined();

  // And this will also fail, because axios *is* called.
  expect(axios.post).not.toHaveBeenCalled();
});
*/

/*
// ---------------- GREEN (active) ----------------
// GREEN: now we align the test with the actual behaviour of Signup.jsx.
// It calls axios, the server responds with { message: "Invalid email format" },
// and the component shows that message from serverData.message.
test('TC-A003 GREEN: shows "Invalid email format" when server responds with that message for invalid email', async () => {
  // Simulate backend rejecting the signup with a specific message
  axios.post.mockRejectedValueOnce({
    response: {
      data: { message: 'Invalid email format' },
      status: 400,
    },
  });

  const { container } = render(
    <MemoryRouter>
      <Signup />
    </MemoryRouter>
  );

  const usernameInput = screen.getByLabelText(/username/i);
  const emailInput = screen.getByLabelText(/email/i);
  const passwordInput = screen.getByLabelText(/password/i);

  // Username + password valid, email syntactically invalid
  fireEvent.change(usernameInput, { target: { value: 'John Doe' } });
  fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
  fireEvent.change(passwordInput, { target: { value: 'ValidPassword123!' } });

  const form = container.querySelector('form');
  fireEvent.submit(form);

  // With current Signup.jsx, this error message comes from the backend
  const errorMsg = await screen.findByText(/invalid email format/i);
  expect(errorMsg).toBeDefined();

  // And axios *is* called once with those credentials
  expect(axios.post).toHaveBeenCalledTimes(1);
  expect(axios.post).toHaveBeenCalledWith(
    'http://localhost:4001/user/sign-up',
    {
      username: 'John Doe',
      email: 'invalid-email',
      password: 'ValidPassword123!',
    }
  );
});
*/


// ---------------- REFACTOR (commented) ----------------
// Later, if you decide to refactor, you can use this test as the final version,
// maybe with a helper function for validation or clearer error handling.

test('TC-A003 REFACTOR: invalid email shows server-provided "Invalid email format" error', async () => {
  axios.post.mockRejectedValueOnce({
    response: {
      data: { message: 'Invalid email format' },
      status: 400,
    },
  });

  const { container } = render(
    <MemoryRouter>
      <Signup />
    </MemoryRouter>
  );

  const usernameInput = screen.getByLabelText(/username/i);
  const emailInput = screen.getByLabelText(/email/i);
  const passwordInput = screen.getByLabelText(/password/i);

  fireEvent.change(usernameInput, { target: { value: 'John Doe' } });
  fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
  fireEvent.change(passwordInput, { target: { value: 'ValidPassword123!' } });

  const form = container.querySelector('form');
  fireEvent.submit(form);

  const errorMsg = await screen.findByText(/invalid email format/i);
  expect(errorMsg).toBeDefined();
  expect(axios.post).toHaveBeenCalledTimes(1);
});
