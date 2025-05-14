import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';
import ProfilePage from '@/app/profile/page';
import { usersApi } from '@/utils/api';
import { useRouter } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock the API
jest.mock('@/utils/api', () => ({
  usersApi: {
    getCurrentUser: jest.fn(),
  },
}));

// Mock EditProfileModal component
jest.mock('@/app/components/ui/EditProfileModal', () => ({
  __esModule: true,
  default: jest.fn(({ user, onClose, onUpdateSuccess }) => (
    <div data-testid="edit-profile-modal">
      <div>Editing user: {user.username}</div>
      <button onClick={onClose} data-testid="close-modal-button">
        Close
      </button>
      <button
        onClick={() =>
          onUpdateSuccess({
            ...user,
            username: 'updated-username',
            firstName: 'Updated',
            lastName: 'User',
          })
        }
        data-testid="update-profile-button"
      >
        Update Profile
      </button>
    </div>
  )),
}));

describe('Profile Page', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const mockUser = {
    id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    avatarUrl: null,
    xpPoints: 100,
    level: 5,
    streakDays: 7,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mocks
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (usersApi.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
  });

  it('redirects to login when no user data is found', async () => {
    // Mock no user data
    (usersApi.getCurrentUser as jest.Mock).mockResolvedValue(null);

    render(<ProfilePage />);

    // Wait for user data check
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/login');
    });
  });

  it('shows loading state initially', () => {
    render(<ProfilePage />);

    // Should show loading indicator
    expect(screen.getByText('Loading profile...')).toBeInTheDocument();
  });

  it('displays user profile information when loaded', async () => {
    render(<ProfilePage />);

    // Wait for user data to load
    await waitFor(() => {
      expect(usersApi.getCurrentUser).toHaveBeenCalled();
    });

    // Check that user info is displayed
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Information about user')).toBeInTheDocument();

    // Check specific user fields
    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByText(mockUser.username)).toBeInTheDocument();

    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText(mockUser.email)).toBeInTheDocument();

    expect(screen.getByText('First Name')).toBeInTheDocument();
    expect(screen.getByText(mockUser.firstName)).toBeInTheDocument();

    expect(screen.getByText('Last Name')).toBeInTheDocument();
    expect(screen.getByText(mockUser.lastName)).toBeInTheDocument();

    expect(screen.getByText('Level')).toBeInTheDocument();
    expect(screen.getByText(mockUser.level.toString())).toBeInTheDocument();

    expect(screen.getByText('XP Points')).toBeInTheDocument();
    expect(screen.getByText(mockUser.xpPoints.toString())).toBeInTheDocument();

    expect(screen.getByText('Streak Days')).toBeInTheDocument();
    expect(
      screen.getByText(mockUser.streakDays.toString())
    ).toBeInTheDocument();

    // Edit button should be available
    expect(screen.getByText('Edit profile')).toBeInTheDocument();
  });

  it('handles the case where firstName or lastName is null', async () => {
    // Mock user with null name fields
    const userWithNullNames = {
      ...mockUser,
      firstName: null,
      lastName: null,
    };

    (usersApi.getCurrentUser as jest.Mock).mockResolvedValue(userWithNullNames);

    render(<ProfilePage />);

    // Wait for user data to load
    await waitFor(() => {
      expect(usersApi.getCurrentUser).toHaveBeenCalled();
    });

    // Should show "Not set" for null name fields
    expect(screen.getAllByText('Not set')).toHaveLength(2);
  });

  it('opens the edit profile modal when edit button is clicked', async () => {
    render(<ProfilePage />);

    // Wait for user data to load
    await waitFor(() => {
      expect(usersApi.getCurrentUser).toHaveBeenCalled();
    });

    // Click edit profile button
    fireEvent.click(screen.getByText('Edit profile'));

    // Edit modal should be visible
    expect(screen.getByTestId('edit-profile-modal')).toBeInTheDocument();
    expect(
      screen.getByText(`Editing user: ${mockUser.username}`)
    ).toBeInTheDocument();
  });

  it('closes the edit profile modal when close button is clicked', async () => {
    render(<ProfilePage />);

    // Wait for user data and open modal
    await waitFor(() => {
      expect(usersApi.getCurrentUser).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByText('Edit profile'));

    // Click close button
    fireEvent.click(screen.getByTestId('close-modal-button'));

    // Modal should be closed
    expect(screen.queryByTestId('edit-profile-modal')).not.toBeInTheDocument();
  });

  it('updates user data when profile is successfully updated', async () => {
    render(<ProfilePage />);

    // Wait for user data and open modal
    await waitFor(() => {
      expect(usersApi.getCurrentUser).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByText('Edit profile'));

    // Click update profile button
    fireEvent.click(screen.getByTestId('update-profile-button'));

    // Modal should close
    expect(screen.queryByTestId('edit-profile-modal')).not.toBeInTheDocument();

    // User data should be updated in the UI
    expect(screen.getByText('updated-username')).toBeInTheDocument();
    expect(screen.getByText('Updated')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
  });

  it('handles API error when loading user data', async () => {
    // Mock API error
    console.error = jest.fn(); // Suppress console.error
    (usersApi.getCurrentUser as jest.Mock).mockRejectedValue(
      new Error('Failed to load user')
    );

    render(<ProfilePage />);

    // Wait for API call to fail
    await waitFor(() => {
      expect(usersApi.getCurrentUser).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });

    // Should still show loading as error handling just logs to console
    expect(screen.getByText('Loading profile...')).toBeInTheDocument();
  });
});
