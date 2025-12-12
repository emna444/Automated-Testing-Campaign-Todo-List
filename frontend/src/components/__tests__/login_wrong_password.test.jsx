import React from 'react';
import { test, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import Signin from '../Login.jsx'; // adjust path/name if needed

vi.mock('axios');

afterEach(() => {
  vi.clearAllMocks();
});
/*
// ---------------- RED (commented) ----------------
// This RED test expects a validation message that the component does NOT
// currently show, so it MUST fail. After implementing validation, we will
// update the test to expect the correct message.

test('TC-A005 RED: shows error when logging in with wrong password', async () => {
  axios.post.mockRejectedValueOnce({
    response: {
      data: { message: 'Invalid credentials' }, // actual server behavior
      status: 401
    }
  });

  render(
    <MemoryRouter>
      <Signin />
    </MemoryRouter>
  );

  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } });
  fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrong-password' } });
  fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

  // RED phase intentionally checks for a message that does NOT exist yet:
  const msg = await screen.findByText(/wrong password/i); 
  expect(msg).toBeDefined();
});

*/

/*
// ---------------- GREEN (commented) ----------------
// TC-A005 GREEN phase: minimum implementation passes.
// At this stage, the Signin component has just enough logic to:
//  - catch a 401/4xx error from axios
//  - read response.data.message
//  - display "Invalid credentials"
// No extra refactoring yet.

test('TC-A005 GREEN: logging in with wrong password shows "Invalid credentials" error and does not navigate', async () => {
  axios.post.mockRejectedValueOnce({
    response: {
      data: { message: 'Invalid credentials' },
      status: 401,
    },
  });

  render(
    <MemoryRouter>
      <Signin />
    </MemoryRouter>
  );

  const emailInput = screen.getByLabelText(/email/i);
  const passwordInput = screen.getByLabelText(/password/i);
  const submitButton = screen.getByRole('button', { name: /sign in/i });

  fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
  fireEvent.change(passwordInput, { target: { value: 'wrong-password' } });
  fireEvent.click(submitButton);

  // With the minimal GREEN implementation, this should now pass:
  const errorMsg = await screen.findByText(/invalid credentials/i);
  expect(errorMsg).toBeDefined();

  // Optionally, verify that axios was called with the right payload
  expect(axios.post).toHaveBeenCalledWith(
    'http://localhost:4001/user/sign-in',
    {
      email: 'user@example.com',
      password: 'wrong-password',
    }
  );
});
*/


// ---------------- REFACTOR (active) ----------------
// TC-A005 REFACTOR phase: final, cleaned-up test.
// Behaviour is the same as GREEN, but your Signin.jsx implementation may now
// have better error handling, clearer messages, or improved structure.
// This is the single active test that should PASS.
test('TC-A005 REFACTOR: Login with wrong password shows "Invalid credentials" error', async () => {
  axios.post.mockRejectedValueOnce({
    response: {
      data: { message: 'Invalid credentials' },
      status: 401,
    },
  });

  render(
    <MemoryRouter>
      <Signin />
    </MemoryRouter>
  );

  const emailInput = screen.getByLabelText(/email/i);
  const passwordInput = screen.getByLabelText(/password/i);
  const submitButton = screen.getByRole('button', { name: /sign in/i });

  // Correct email, wrong password
  fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
  fireEvent.change(passwordInput, { target: { value: 'wrong-password' } });
  fireEvent.click(submitButton);

  // Assert the specific error message is shown
  const errorMsg = await screen.findByText(/invalid credentials/i);
  expect(errorMsg).toBeDefined();

  // Optionally ensure we don't accidentally navigate away;
  // since navigate is used internally, we just ensure the form is still visible.
  await waitFor(() => {
    expect(screen.getByRole('button', { name: /sign in/i })).toBeDefined();
  });
});
