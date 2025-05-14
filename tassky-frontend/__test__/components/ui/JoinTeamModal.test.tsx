import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';
import JoinTeamModal from '@/app/components/ui/JoinTeamModal';

describe('JoinTeamModal', () => {
  const mockOnClose = jest.fn();
  const mockOnJoinTeam = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with all form elements', () => {
    render(<JoinTeamModal onClose={mockOnClose} onJoinTeam={mockOnJoinTeam} />);

    // Check that all form elements are rendered
    expect(screen.getByText('Join Team')).toBeInTheDocument();
    expect(screen.getByLabelText(/Invite Code/i)).toBeInTheDocument();
    expect(
      screen.getByText('Ask your team admin for the invite code')
    ).toBeInTheDocument();

    // Check for buttons
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Join Team/i })
    ).toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', () => {
    render(<JoinTeamModal onClose={mockOnClose} onJoinTeam={mockOnJoinTeam} />);

    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('shows validation error when submitting with empty invite code', async () => {
    render(<JoinTeamModal onClose={mockOnClose} onJoinTeam={mockOnJoinTeam} />);

    // Try to submit with empty invite code
    fireEvent.click(screen.getByRole('button', { name: /Join Team/i }));

    // Check for error message
    expect(screen.getByText('Invite code is required')).toBeInTheDocument();

    // Check that onJoinTeam wasn't called
    expect(mockOnJoinTeam).not.toHaveBeenCalled();
  });

  it('submits form with correct data when form is valid', async () => {
    // Mock the onJoinTeam function to resolve successfully
    mockOnJoinTeam.mockResolvedValue({});

    render(<JoinTeamModal onClose={mockOnClose} onJoinTeam={mockOnJoinTeam} />);

    // Fill the form
    const inviteCode = 'ABC123';
    fireEvent.change(screen.getByLabelText(/Invite Code/i), {
      target: { value: inviteCode },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Join Team/i }));

    // Check that onJoinTeam was called with the correct data
    expect(mockOnJoinTeam).toHaveBeenCalledWith(inviteCode);
  });

  it('trims whitespace from invite code before submission', async () => {
    // Mock the onJoinTeam function to resolve successfully
    mockOnJoinTeam.mockResolvedValue({});

    render(<JoinTeamModal onClose={mockOnClose} onJoinTeam={mockOnJoinTeam} />);

    // Fill the form with whitespace
    const inviteCodeWithWhitespace = '  ABC123  ';
    const trimmedInviteCode = 'ABC123';

    fireEvent.change(screen.getByLabelText(/Invite Code/i), {
      target: { value: inviteCodeWithWhitespace },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Join Team/i }));

    // Check that onJoinTeam was called with the trimmed invite code
    expect(mockOnJoinTeam).toHaveBeenCalledWith(trimmedInviteCode);
  });

  it('shows loading state when submitting', async () => {
    // Mock the onJoinTeam function to not resolve immediately
    mockOnJoinTeam.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({}), 100);
        })
    );

    render(<JoinTeamModal onClose={mockOnClose} onJoinTeam={mockOnJoinTeam} />);

    // Fill the form
    fireEvent.change(screen.getByLabelText(/Invite Code/i), {
      target: { value: 'ABC123' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Join Team/i }));

    // Check that the button shows loading state
    expect(
      screen.getByRole('button', { name: /Joining.../i })
    ).toBeInTheDocument();

    // Wait for the submission to complete
    await waitFor(() => {
      expect(mockOnJoinTeam).toHaveBeenCalled();
    });
  });

  it('handles error from team joining', async () => {
    // Mock the onJoinTeam function to reject with an error
    const errorMessage = 'Invalid invite code';
    mockOnJoinTeam.mockRejectedValue(new Error(errorMessage));

    render(<JoinTeamModal onClose={mockOnClose} onJoinTeam={mockOnJoinTeam} />);

    // Fill the form
    fireEvent.change(screen.getByLabelText(/Invite Code/i), {
      target: { value: 'WRONG123' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Join Team/i }));

    // Wait for the error to be displayed
    await waitFor(() => {
      expect(screen.getByText(/Failed to join team/i)).toBeInTheDocument();
    });

    // Check that onClose is called when an error occurs
    expect(mockOnClose).toHaveBeenCalled();
  });
});
