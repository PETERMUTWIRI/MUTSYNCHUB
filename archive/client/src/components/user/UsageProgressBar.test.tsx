import React from 'react';
import { render, screen } from '@testing-library/react';
import UsageProgressBar from './UsageProgressBar';

describe('UsageProgressBar', () => {
  it('renders the usage and limit', () => {
    render(<UsageProgressBar usage={50} limit={100} />);
    expect(screen.getByText('50 / 100')).toBeInTheDocument();
  });

  it('calculates the percentage correctly', () => {
    const { container } = render(<UsageProgressBar usage={50} limit={100} />);
    const progressBar = container.querySelector('.bg-gradient-to-r');
    expect(progressBar).toHaveStyle('width: 50%');
  });

  it('displays the remaining percentage', () => {
    render(<UsageProgressBar usage={50} limit={100} />);
    expect(screen.getByText('50% remaining')).toBeInTheDocument();
  });
});
