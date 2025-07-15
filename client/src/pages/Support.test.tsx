import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import Support from './Support';

const server = setupServer(
  rest.post('/api/user/support/tickets', (req, res, ctx) => {
    return res(ctx.status(200));
  }),
  rest.get('/api/user/support/tickets', (req, res, ctx) => {
    return res(ctx.json([]));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Support Page', () => {
  it('allows a user to create a support ticket', async () => {
    render(<Support />);

    fireEvent.change(screen.getByPlaceholderText('Subject'), {
      target: { value: 'Test Subject' },
    });
    fireEvent.change(screen.getByPlaceholderText('Describe your issue...'), {
      target: { value: 'Test Description' },
    });

    fireEvent.click(screen.getByText('Submit Ticket'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Subject')).toHaveValue('');
      expect(screen.getByPlaceholderText('Describe your issue...')).toHaveValue('');
    });
  });
});
