import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';
import TeamLeaderboardModal from '@/app/components/ui/TeamLeaderboardModal';
import { tasksApi } from '@/utils/api';

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ''} />;
  },
}));

// Mock recharts components
jest.mock('recharts', () => ({
  BarChart: ({ children }) => (
    <div data-testid="mock-bar-chart">{children}</div>
  ),
  Bar: () => <div data-testid="mock-bar"></div>,
  XAxis: () => <div data-testid="mock-xaxis"></div>,
  YAxis: () => <div data-testid="mock-yaxis"></div>,
  CartesianGrid: () => <div data-testid="mock-grid"></div>,
  Tooltip: () => <div data-testid="mock-tooltip"></div>,
  Legend: () => <div data-testid="mock-legend"></div>,
  ResponsiveContainer: ({ children }) => (
    <div data-testid="mock-responsive-container">{children}</div>
  ),
  LineChart: ({ children }) => (
    <div data-testid="mock-line-chart">{children}</div>
  ),
  Line: () => <div data-testid="mock-line"></div>,
}));

// Mock the API calls
jest.mock('@/utils/api', () => ({
  tasksApi: {
    getTasksByStatus: jest.fn(),
  },
}));

describe('TeamLeaderboardModal', () => {
  const mockTeamId = 'team-123';
  const mockOnClose = jest.fn();

  const mockCompletedTasks = [
    {
      id: 'task-1',
      title: 'Task 1',
      status: 'COMPLETED',
      priority: 'HIGH',
      createdAt: '2025-04-01T12:00:00Z',
      updatedAt: '2025-04-15T12:00:00Z',
      completedAt: '2025-04-15T12:00:00Z',
      xpRewarded: 30,
      teamId: mockTeamId,
      assignedToId: 'user-1',
      assignedTo: {
        id: 'user-1',
        username: 'user1',
        avatarUrl: '/avatar1.png',
      },
      team: {
        id: mockTeamId,
        name: 'Test Team',
      },
    },
    {
      id: 'task-2',
      title: 'Task 2',
      status: 'COMPLETED',
      priority: 'LOW',
      createdAt: '2025-04-05T12:00:00Z',
      updatedAt: '2025-04-20T12:00:00Z',
      completedAt: '2025-04-20T12:00:00Z',
      xpRewarded: 10,
      teamId: mockTeamId,
      assignedToId: 'user-2',
      assignedTo: {
        id: 'user-2',
        username: 'user2',
        avatarUrl: '/avatar2.png',
      },
      team: {
        id: mockTeamId,
        name: 'Test Team',
      },
    },
    {
      id: 'task-3',
      title: 'Task 3',
      status: 'COMPLETED',
      priority: 'MEDIUM',
      createdAt: '2025-04-10T12:00:00Z',
      updatedAt: '2025-04-25T12:00:00Z',
      completedAt: '2025-04-25T12:00:00Z',
      xpRewarded: 20,
      teamId: mockTeamId,
      assignedToId: 'user-1',
      assignedTo: {
        id: 'user-1',
        username: 'user1',
        avatarUrl: '/avatar1.png',
      },
      team: {
        id: mockTeamId,
        name: 'Test Team',
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock API response
    (tasksApi.getTasksByStatus as jest.Mock).mockResolvedValue(
      mockCompletedTasks
    );
  });

  it('renders correctly with title and tabs', async () => {
    render(<TeamLeaderboardModal onClose={mockOnClose} teamId={mockTeamId} />);

    // Check that the title is rendered
    expect(screen.getByText('User Leaderboard')).toBeInTheDocument();

    // Check that the tabs are rendered
    expect(
      screen.getByRole('button', { name: /XP Performance/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Tasks Completed/i })
    ).toBeInTheDocument();

    // Check for the close button
    expect(screen.getByRole('button', { name: /Close/i })).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<TeamLeaderboardModal onClose={mockOnClose} teamId={mockTeamId} />);

    fireEvent.click(screen.getByRole('button', { name: /Close/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('fetches tasks data on mount', async () => {
    render(<TeamLeaderboardModal onClose={mockOnClose} teamId={mockTeamId} />);

    await waitFor(() => {
      expect(tasksApi.getTasksByStatus).toHaveBeenCalledWith(
        'COMPLETED',
        mockTeamId
      );
    });
  });

  it('shows loading state when fetching data', () => {
    // Mock a slow API response
    (tasksApi.getTasksByStatus as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve(mockCompletedTasks), 100)
        )
    );

    render(<TeamLeaderboardModal onClose={mockOnClose} teamId={mockTeamId} />);

    // Check for loading indicator
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('processes and displays user data correctly after loading', async () => {
    render(<TeamLeaderboardModal onClose={mockOnClose} teamId={mockTeamId} />);

    // Wait for data to load
    await waitFor(() => {
      expect(tasksApi.getTasksByStatus).toHaveBeenCalled();
    });

    // Check that user data is displayed in the table
    expect(screen.getByText('user1')).toBeInTheDocument();
    expect(screen.getByText('user2')).toBeInTheDocument();

    // Check for XP values (by default, XP tab is selected)
    expect(screen.getByText('50 XP')).toBeInTheDocument(); // user1: 30 + 20 XP
    expect(screen.getByText('10 XP')).toBeInTheDocument(); // user2: 10 XP
  });

  it('switches between XP and Tasks tabs correctly', async () => {
    render(<TeamLeaderboardModal onClose={mockOnClose} teamId={mockTeamId} />);

    // Wait for data to load
    await waitFor(() => {
      expect(tasksApi.getTasksByStatus).toHaveBeenCalled();
    });

    // XP tab is selected by default, switch to Tasks tab
    fireEvent.click(screen.getByRole('button', { name: /Tasks Completed/i }));

    // Check that the task counts are displayed
    expect(screen.getByText('2 Tasks')).toBeInTheDocument(); // user1: 2 tasks
    expect(screen.getByText('1 Tasks')).toBeInTheDocument(); // user2: 1 task
  });

  it('handles no data scenario gracefully', async () => {
    // Mock empty tasks array
    (tasksApi.getTasksByStatus as jest.Mock).mockResolvedValue([]);

    render(<TeamLeaderboardModal onClose={mockOnClose} teamId={mockTeamId} />);

    // Wait for data loading to complete
    await waitFor(() => {
      expect(tasksApi.getTasksByStatus).toHaveBeenCalled();
    });

    // Check for empty state message
    expect(
      screen.getByText(/No users have completed any tasks yet/i)
    ).toBeInTheDocument();
  });

  it('displays insights about top performers', async () => {
    render(<TeamLeaderboardModal onClose={mockOnClose} teamId={mockTeamId} />);

    // Wait for data to load
    await waitFor(() => {
      expect(tasksApi.getTasksByStatus).toHaveBeenCalled();
    });

    // Check for insights text
    expect(screen.getByText(/The top performer is/i)).toBeInTheDocument();
    expect(screen.getByText(/user1/i)).toBeInTheDocument(); // Top performer
    expect(screen.getByText(/50 XP/i)).toBeInTheDocument(); // Top performer XP
  });

  it('calculates performance differences correctly for insights', async () => {
    render(<TeamLeaderboardModal onClose={mockOnClose} teamId={mockTeamId} />);

    // Wait for data to load
    await waitFor(() => {
      expect(tasksApi.getTasksByStatus).toHaveBeenCalled();
    });

    // Check for runner-up insight
    // Top performer (user1) has 50 XP, runner-up (user2) has 10 XP
    // Difference: (50-10)/50*100 = 80%
    expect(
      screen.getByText(/The runner-up user2 is 80% behind./i)
    ).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    // Mock API error
    console.error = jest.fn(); // Suppress console.error
    (tasksApi.getTasksByStatus as jest.Mock).mockRejectedValue(
      new Error('Failed to fetch tasks')
    );

    render(<TeamLeaderboardModal onClose={mockOnClose} teamId={mockTeamId} />);

    // Wait for API call to fail
    await waitFor(() => {
      expect(tasksApi.getTasksByStatus).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });

    // Modal should still be functional
    fireEvent.click(screen.getByRole('button', { name: /Close/i }));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
