import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';
import Dashboard from '@/app/dashboard/page';
import { teamsApi } from '@/utils/api';
import { useRouter } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock the API
jest.mock('@/utils/api', () => ({
  teamsApi: {
    getTeams: jest.fn(),
    getTeamWithMembers: jest.fn(),
    createTeam: jest.fn(),
    joinTeam: jest.fn(),
    deleteTeam: jest.fn(),
  },
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock localStorage
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => {
      if (key === 'user')
        return JSON.stringify({ id: 'user-123', username: 'testuser' });
      if (key === 'access_token') return 'test-token';
      return store[key] || null;
    }),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

// Mock UI components
jest.mock('@/app/components/ui/TeamButton', () => ({
  __esModule: true,
  default: jest.fn(({ team, isSelected, onClick }) => (
    <button
      data-testid={`team-button-${team.id}`}
      className={isSelected ? 'selected-team' : ''}
      onClick={onClick}
    >
      {team.name}
    </button>
  )),
}));

jest.mock('@/app/components/ui/CreateTeamModal', () => ({
  __esModule: true,
  default: jest.fn(({ onClose, onCreateTeam }) => (
    <div data-testid="create-team-modal">
      <button onClick={onClose} data-testid="close-create-modal">
        Cancel
      </button>
      <button
        onClick={() =>
          onCreateTeam({
            name: 'New Test Team',
            description: 'Test Description',
          })
        }
        data-testid="submit-create-team"
      >
        Create Team
      </button>
    </div>
  )),
}));

jest.mock('@/app/components/ui/JoinTeamModal', () => ({
  __esModule: true,
  default: jest.fn(({ onClose, onJoinTeam }) => (
    <div data-testid="join-team-modal">
      <button onClick={onClose} data-testid="close-join-modal">
        Cancel
      </button>
      <button
        onClick={() => onJoinTeam('TEST-CODE')}
        data-testid="submit-join-team"
      >
        Join Team
      </button>
    </div>
  )),
}));

jest.mock('@/app/components/ui/TeamAdminPanel', () => ({
  __esModule: true,
  default: jest.fn(({ team, onClose, onTeamDelete }) => (
    <div data-testid="team-admin-panel">
      <div>Team Admin: {team.name}</div>
      <button onClick={onClose} data-testid="close-admin-panel">
        Close
      </button>
      <button onClick={onTeamDelete} data-testid="delete-team-button">
        Delete Team
      </button>
    </div>
  )),
}));

jest.mock('@/app/components/ui/LeaderboardModal', () => ({
  __esModule: true,
  default: jest.fn(({ onClose }) => (
    <div data-testid="leaderboard-modal">
      <button onClick={onClose} data-testid="close-leaderboard">
        Close
      </button>
    </div>
  )),
}));

jest.mock('@/app/components/ui/TeamLeaderboardModal', () => ({
  __esModule: true,
  default: jest.fn(({ onClose, teamId }) => (
    <div data-testid="team-leaderboard-modal">
      <div>Team ID: {teamId}</div>
      <button onClick={onClose} data-testid="close-team-leaderboard">
        Close
      </button>
    </div>
  )),
}));

describe('Dashboard Page', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const mockTeams = [
    {
      id: 'team-1',
      name: 'Test Team 1',
      description: 'Team 1 Description',
      inviteCode: 'TEAM1CODE',
      totalXp: 100,
      totalTasks: 5,
    },
    {
      id: 'team-2',
      name: 'Test Team 2',
      description: 'Team 2 Description',
      inviteCode: 'TEAM2CODE',
      totalXp: 200,
      totalTasks: 10,
    },
  ];

  const mockTeamWithMembers = {
    ...mockTeams[0],
    members: [
      {
        id: 'member-1',
        userId: 'user-123',
        role: 'ADMIN',
        joinedAt: '2024-01-01',
        user: {
          id: 'user-123',
          username: 'testuser',
          email: 'test@example.com',
        },
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mocks
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (teamsApi.getTeams as jest.Mock).mockResolvedValue(mockTeams);
    (teamsApi.getTeamWithMembers as jest.Mock).mockResolvedValue(
      mockTeamWithMembers
    );
    (teamsApi.createTeam as jest.Mock).mockImplementation((teamData) =>
      Promise.resolve({
        id: 'new-team-id',
        ...teamData,
        inviteCode: 'NEWTEAMCODE',
      })
    );
    (teamsApi.joinTeam as jest.Mock).mockResolvedValue({
      id: 'joined-team-id',
      name: 'Joined Team',
      inviteCode: 'TEST-CODE',
    });
  });

  it('redirects to login if no auth token', async () => {
    // Mock no token in localStorage
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'access_token') return null;
      return null;
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/login');
    });
  });

  it('renders the dashboard with teams', async () => {
    render(<Dashboard />);

    // Wait for teams to load
    await waitFor(() => {
      expect(teamsApi.getTeams).toHaveBeenCalled();
      expect(teamsApi.getTeamWithMembers).toHaveBeenCalledWith(mockTeams[0].id);
    });

    // Should display team buttons
    expect(screen.getByTestId('team-button-team-1')).toBeInTheDocument();
    expect(screen.getByTestId('team-button-team-2')).toBeInTheDocument();

    // Should display selected team info
    expect(screen.getByText(mockTeams[0].name)).toBeInTheDocument();
    expect(screen.getByText(mockTeams[0].description)).toBeInTheDocument();
    expect(screen.getByText(mockTeams[0].inviteCode)).toBeInTheDocument();

    // Should display action buttons
    expect(screen.getByText('Go to board')).toBeInTheDocument();
  });

  it('opens the create team modal', async () => {
    render(<Dashboard />);

    // Wait for initial render
    await waitFor(() => {
      expect(teamsApi.getTeams).toHaveBeenCalled();
    });

    // Click create team button
    fireEvent.click(screen.getByText('Create team'));

    // Modal should appear
    expect(screen.getByTestId('create-team-modal')).toBeInTheDocument();

    // Close modal
    fireEvent.click(screen.getByTestId('close-create-modal'));
    expect(screen.queryByTestId('create-team-modal')).not.toBeInTheDocument();
  });

  it('creates a new team', async () => {
    render(<Dashboard />);

    // Wait for initial render
    await waitFor(() => {
      expect(teamsApi.getTeams).toHaveBeenCalled();
    });

    // Open create team modal and submit
    fireEvent.click(screen.getByText('Create team'));
    fireEvent.click(screen.getByTestId('submit-create-team'));

    // Verify API call
    await waitFor(() => {
      expect(teamsApi.createTeam).toHaveBeenCalledWith({
        name: 'New Test Team',
        description: 'Test Description',
      });
    });
  });

  it('opens the join team modal', async () => {
    render(<Dashboard />);

    // Wait for initial render
    await waitFor(() => {
      expect(teamsApi.getTeams).toHaveBeenCalled();
    });

    // Click join team button
    fireEvent.click(screen.getByText('Join team'));

    // Modal should appear
    expect(screen.getByTestId('join-team-modal')).toBeInTheDocument();

    // Close modal
    fireEvent.click(screen.getByTestId('close-join-modal'));
    expect(screen.queryByTestId('join-team-modal')).not.toBeInTheDocument();
  });

  it('joins a team with invite code', async () => {
    render(<Dashboard />);

    // Wait for initial render
    await waitFor(() => {
      expect(teamsApi.getTeams).toHaveBeenCalled();
    });

    // Open join team modal and submit
    fireEvent.click(screen.getByText('Join team'));
    fireEvent.click(screen.getByTestId('submit-join-team'));

    // Verify API call
    await waitFor(() => {
      expect(teamsApi.joinTeam).toHaveBeenCalledWith('TEST-CODE');
    });
  });

  it('opens the admin panel for team owners', async () => {
    render(<Dashboard />);

    // Wait for initial render
    await waitFor(() => {
      expect(teamsApi.getTeamWithMembers).toHaveBeenCalled();
    });

    // Admin button should be visible because mock user is team admin
    const manageButton = screen.getByText('Manage Team');
    fireEvent.click(manageButton);

    // Admin panel should open
    expect(screen.getByTestId('team-admin-panel')).toBeInTheDocument();
    expect(
      screen.getByText(`Team Admin: ${mockTeams[0].name}`)
    ).toBeInTheDocument();

    // Close panel
    fireEvent.click(screen.getByTestId('close-admin-panel'));
    expect(screen.queryByTestId('team-admin-panel')).not.toBeInTheDocument();
  });

  it('navigates to board when go to board button is clicked', async () => {
    render(<Dashboard />);

    // Wait for initial render
    await waitFor(() => {
      expect(teamsApi.getTeams).toHaveBeenCalled();
    });

    // Click go to board
    fireEvent.click(screen.getByText('Go to board'));

    // Should navigate to board with teamId param
    expect(mockRouter.push).toHaveBeenCalledWith(
      `/board?teamId=${mockTeams[0].id}`
    );
  });

  it('deletes a team from the admin panel', async () => {
    render(<Dashboard />);

    // Wait for initial render and open admin panel
    await waitFor(() => {
      expect(teamsApi.getTeamWithMembers).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByText('Manage Team'));

    // Delete the team
    fireEvent.click(screen.getByTestId('delete-team-button'));

    // Verify API call
    await waitFor(() => {
      expect(teamsApi.deleteTeam).toHaveBeenCalledWith(mockTeams[0].id);
    });
  });

  it('opens the team leaderboard', async () => {
    render(<Dashboard />);

    // Wait for initial render
    await waitFor(() => {
      expect(teamsApi.getTeamWithMembers).toHaveBeenCalled();
    });

    // Click leaderboard button
    fireEvent.click(screen.getByText('Leaderboard'));

    // Team leaderboard modal should open
    expect(screen.getByTestId('team-leaderboard-modal')).toBeInTheDocument();
    expect(screen.getByText(`Team ID: ${mockTeams[0].id}`)).toBeInTheDocument();

    // Close modal
    fireEvent.click(screen.getByTestId('close-team-leaderboard'));
    expect(
      screen.queryByTestId('team-leaderboard-modal')
    ).not.toBeInTheDocument();
  });

  it('opens the general leaderboard', async () => {
    render(<Dashboard />);

    // Wait for initial render
    await waitFor(() => {
      expect(teamsApi.getTeams).toHaveBeenCalled();
    });

    // Click teams leaderboard button
    fireEvent.click(screen.getByText('Teams Leaderboard'));

    // Leaderboard modal should open
    expect(screen.getByTestId('leaderboard-modal')).toBeInTheDocument();

    // Close modal
    fireEvent.click(screen.getByTestId('close-leaderboard'));
    expect(screen.queryByTestId('leaderboard-modal')).not.toBeInTheDocument();
  });
});
