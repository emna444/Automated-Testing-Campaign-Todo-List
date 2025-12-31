import React from 'react';
import { test, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Signup from '../Signup.jsx';
import { MemoryRouter } from 'react-router-dom';

// ---------------- RED (commented) ----------------
// This test represents the failing RED phase. It asserts that when the form
// is submitted with all fields empty the UI shows "All fields required".
// At RED this test should fail because the component does not yet show the
// validation message.
/*test('TC-A002 RED: shows "All fields required" when signup submitted with missing fields', async () => {
  const { container } = render(
    <MemoryRouter>
      <Signup />
    </MemoryRouter>
  );

  // Submit the empty form
  const form = container.querySelector('form');
  fireEvent.submit(form);

  // Expect the validation message to appear (this will fail in RED)
  const msg = await screen.findByText(/All fields required/i);
  expect(msg).toBeDefined();
});*/

// ---------------- GREEN (active) ----------------
// This test represents the minimal GREEN phase. It is commented out here
// and shows the smallest implementation needed to make the RED test pass:
// adding client-side validation that sets an error message when any field is
// empty. Once implemented, this test should pass.
/*test('TC-A002 GREEN: shows "All fields required" when signup submitted with missing fields', async () => {
  const { container } = render(
    <MemoryRouter>
      <Signup />
    </MemoryRouter>
  );

   // Submit the empty form
   const form = container.querySelector('form');
   fireEvent.submit(form);
   // Now the component should show the message
    const msg = await screen.findByText(/All fields required/i);
  expect(msg).toBeDefined();
});*/

// ---------------- REFACTOR (active) ----------------
// Final cleaned-up test: uses MemoryRouter, triggers submission via
// fireEvent.submit(), and asserts the expected message. This is the single
// active test that should pass after the minimal implementation.
test('TC-A002 REFACTOR: Signup with missing fields shows "All fields required" on submit', async () => {
  const { container } = render(
    <MemoryRouter>
      <Signup />
    </MemoryRouter>
  );

  // Submit the empty form
  const form = container.querySelector('form');
  fireEvent.submit(form);

  // Assert the validation message appears
  const msg = await screen.findByText(/All fields required/i);
  expect(msg).toBeDefined();
});
