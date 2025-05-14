import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';
import TeamButton from '../../../src/app/components/ui/TeamButton';

// Mock Image component to avoid Next.js image issues
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

describe('TeamButton', () => {
  const mockTeam = {
    id: 'team-123',
    name: 'Test Team',
    avatarUrl: undefined,
  };

  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with team name', () => {
    render(<TeamButton team={mockTeam} />);
    expect(screen.getByText('Test Team')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    render(<TeamButton team={mockTeam} onClick={mockOnClick} />);
    fireEvent.click(screen.getByText('Test Team'));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});
