import React from 'react';
import { render, screen } from '@testing-library/react';
import BillingSummary from './BillingSummary';

describe('BillingSummary', () => {
  it('renders the amount and next bill date', () => {
    render(<BillingSummary amount={99} nextBillDate="July 30, 2024" />);
    expect(screen.getByText('$99')).toBeInTheDocument();
    expect(screen.getByText('Next bill on July 30, 2024')).toBeInTheDocument();
  });
});
