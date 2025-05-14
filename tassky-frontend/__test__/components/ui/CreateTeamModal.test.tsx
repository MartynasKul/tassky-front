import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';
import CreateTeamModal from '@/app/components/ui/CreateTeamModal';

describe('CreateTeamModal', () => {
  const mockOnClose = jest.fn();
  const mockOnCreateTeam = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with all form elements', () => {
    render(
      <CreateTeamModal onClose={mockOnClose} onCreateTeam={mockOnCreateTeam} />
    );

    // Check that all form elements are rendered
    expect(screen.getByText('Create New Team')).toBeInTheDocument();
    expect(screen.getByLabelText(/Team Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();

    // Check for buttons
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Create Team/i })
    ).toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', () => {
    render(
      <CreateTeamModal onClose={mockOnClose} onCreateTeam={mockOnCreateTeam} />
    );

    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('shows validation error when submitting with empty team name', async () => {
    render(
      <CreateTeamModal onClose={mockOnClose} onCreateTeam={mockOnCreateTeam} />
    );

    // Try to submit with empty team name
    fireEvent.click(screen.getByRole('button', { name: /Create Team/i }));

    // Check for error message
    expect(screen.getByText('Team name is required')).toBeInTheDocument();

    // Check that onCreateTeam wasn't called
    expect(mockOnCreateTeam).not.toHaveBeenCalled();
  });

  it('submits form with correct data when form is valid', async () => {
    // Mock the onCreateTeam function to resolve successfully
    mockOnCreateTeam.mockResolvedValue({});

    render(
      <CreateTeamModal onClose={mockOnClose} onCreateTeam={mockOnCreateTeam} />
    );

    // Fill the form
    fireEvent.change(screen.getByLabelText(/Team Name/i), {
      target: { value: 'Test Team' },
    });
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: 'This is a test team' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Create Team/i }));

    // Check that onCreateTeam was called with the correct data
    expect(mockOnCreateTeam).toHaveBeenCalledWith({
      name: 'Test Team',
      description: 'This is a test team',
    });
  });

  it('shows loading state when submitting', async () => {
    // Mock the onCreateTeam function to not resolve immediately
    mockOnCreateTeam.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({}), 100);
        })
    );

    render(
      <CreateTeamModal onClose={mockOnClose} onCreateTeam={mockOnCreateTeam} />
    );

    // Fill the form
    fireEvent.change(screen.getByLabelText(/Team Name/i), {
      target: { value: 'Test Team' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Create Team/i }));

    // Check that the button shows loading state
    expect(
      screen.getByRole('button', { name: /Creating.../i })
    ).toBeInTheDocument();

    // Wait for the submission to complete
    await waitFor(() => {
      expect(mockOnCreateTeam).toHaveBeenCalled();
    });
  });

  it('handles error from team creation', async () => {
    // Mock the onCreateTeam function to reject with an error
    const errorMessage = 'Failed to create team';
    mockOnCreateTeam.mockRejectedValue(new Error(errorMessage));

    render(
      <CreateTeamModal onClose={mockOnClose} onCreateTeam={mockOnCreateTeam} />
    );

    // Fill the form
    fireEvent.change(screen.getByLabelText(/Team Name/i), {
      target: { value: 'Test Team' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Create Team/i }));

    // Wait for the error to be displayed
    await waitFor(() => {
      expect(screen.getByText(/Failed to create team/i)).toBeInTheDocument();
    });

    // Check that the isSubmitting state is reset
    expect(
      screen.getByRole('button', { name: /Create Team/i })
    ).toBeInTheDocument();
  });
});
