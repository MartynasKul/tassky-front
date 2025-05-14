import { render, screen } from '@testing-library/react';
import React from 'react';

describe('Simple test', () => {
  it('should pass', () => {
    expect(1 + 1).toBe(2);
  });

  it('can render a basic component', () => {
    render(<div data-testid="test">Hello World</div>);
    expect(screen.getByTestId('test')).toBeInTheDocument();
  });
});
