import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';
import LeaderboardModal from '@/app/components/ui/LeaderboardModal';
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

// Mock date-fns functions
jest.mock('date-fns', () => ({
  format: jest.fn().mockImplementation((date, formatStr) => {
    if (formatStr === 'MMM d') return 'May 1';
    if (formatStr === 'MMM d, yyyy') return 'May 1, 2025';
    return '05/01/2025';
  }),
  endOfWeek: jest.fn().mockImplementation(() => new Date()),
  parseISO: jest.fn().mockImplementation(() => new Date()),
  isWithinInterval: jest.fn().mockReturnValue(true),
  isAfter: jest.fn().mockReturnValue(true),
  eachWeekOfInterval: jest.fn().mockReturnValue([new Date(), new Date()]),
}));

// Mock the API calls
jest.mock('@/utils/api', () => ({
  tasksApi: {
    getTasksByTeam: jest.fn(),
  },
}));

describe('LeaderboardModal', () => {
  const mockOnClose = jest.fn();
  const mockUserTeams = [
    {
      id: 'team-1',
      name: 'Team Alpha',
      totalXp: 150,
      totalTasks: 10,
    },
    {
      id: 'team-2',
      name: 'Team Beta',
      totalXp: 100,
      totalTasks: 7,
    },
  ];

  const mockTasksForTeam1 = [
    {
      id: 'task-1',
      title: 'Task 1',
      status: 'COMPLETED',
      createdAt: '2025-04-01T12:00:00Z',
      updatedAt: '2025-04-15T12:00:00Z',
      completedAt: '2025-04-15T12:00:00Z',
      xpRewarded: 30,
      teamId: 'team-1',
      team: { id: 'team-1', name: 'Team Alpha' },
    },
    {
      id: 'task-2',
      title: 'Task 2',
      status: 'COMPLETED',
      createdAt: '2025-04-05T12:00:00Z',
      updatedAt: '2025-04-20T12:00:00Z',
      completedAt: '2025-04-20T12:00:00Z',
      xpRewarded: 20,
      teamId: 'team-1',
      team: { id: 'team-1', name: 'Team Alpha' },
    },
  ];

  const mockTasksForTeam2 = [
    {
      id: 'task-3',
      title: 'Task 3',
      status: 'COMPLETED',
      createdAt: '2025-04-10T12:00:00Z',
      updatedAt: '2025-04-25T12:00:00Z',
      completedAt: '2025-04-25T12:00:00Z',
      xpRewarded: 15,
      teamId: 'team-2',
      team: { id: 'team-2', name: 'Team Beta' },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock API responses
    (tasksApi.getTasksByTeam as jest.Mock).mockImplementation((teamId) => {
      if (teamId === 'team-1') return Promise.resolve(mockTasksForTeam1);
      if (teamId === 'team-2') return Promise.resolve(mockTasksForTeam2);
      return Promise.resolve([]);
    });
  });

  it('renders correctly with title and tabs', () => {
    render(
      <LeaderboardModal onClose={mockOnClose} userTeams={mockUserTeams} />
    );

    // Check that the title is rendered
    expect(screen.getByText('Team Leaderboard')).toBeInTheDocument();

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
    render(
      <LeaderboardModal onClose={mockOnClose} userTeams={mockUserTeams} />
    );

    fireEvent.click(screen.getByRole('button', { name: /Close/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('fetches tasks data for each team on mount', async () => {
    render(
      <LeaderboardModal onClose={mockOnClose} userTeams={mockUserTeams} />
    );

    await waitFor(() => {
      expect(tasksApi.getTasksByTeam).toHaveBeenCalledTimes(2);
      expect(tasksApi.getTasksByTeam).toHaveBeenCalledWith('team-1');
      expect(tasksApi.getTasksByTeam).toHaveBeenCalledWith('team-2');
    });
  });

  it('shows loading state when fetching data', () => {
    // Mock slow API responses
    (tasksApi.getTasksByTeam as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve([]), 100))
    );

    render(
      <LeaderboardModal onClose={mockOnClose} userTeams={mockUserTeams} />
    );

    // Check for loading indicator
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('displays bar chart with team performance data', async () => {
    render(
      <LeaderboardModal onClose={mockOnClose} userTeams={mockUserTeams} />
    );

    // Wait for data to load
    await waitFor(() => {
      expect(tasksApi.getTasksByTeam).toHaveBeenCalledTimes(2);
    });

    // Check that the chart components are rendered
    expect(screen.getByTestId('mock-responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('mock-bar-chart')).toBeInTheDocument();
    expect(screen.getAllByTestId('mock-bar').length).toBeGreaterThan(0);
  });

  it('switches between XP and tasks tabs correctly', async () => {
    render(
      <LeaderboardModal onClose={mockOnClose} userTeams={mockUserTeams} />
    );

    // Wait for data to load
    await waitFor(() => {
      expect(tasksApi.getTasksByTeam).toHaveBeenCalledTimes(2);
    });

    // By default, XP tab should be active
    expect(screen.getByRole('button', { name: /XP Performance/i })).toHaveClass(
      'bg-violet-600'
    );
    expect(
      screen.getByRole('button', { name: /Tasks Completed/i })
    ).not.toHaveClass('bg-violet-600');

    // Switch to Tasks tab
    fireEvent.click(screen.getByRole('button', { name: /Tasks Completed/i }));

    // Now Tasks tab should be active
    expect(
      screen.getByRole('button', { name: /Tasks Completed/i })
    ).toHaveClass('bg-violet-600');
    expect(
      screen.getByRole('button', { name: /XP Performance/i })
    ).not.toHaveClass('bg-violet-600');
  });

  it('identifies the top performing team correctly', async () => {
    render(
      <LeaderboardModal onClose={mockOnClose} userTeams={mockUserTeams} />
    );

    // Wait for data to load
    await waitFor(() => {
      expect(tasksApi.getTasksByTeam).toHaveBeenCalledTimes(2);
    });

    // Team Alpha has more XP, so it should be identified as the top performer
    expect(
      screen.getByText(/The team with the highest XP is Team Alpha/i)
    ).toBeInTheDocument();

    // Switch to Tasks tab
    fireEvent.click(screen.getByRole('button', { name: /Tasks Completed/i }));

    // Team Alpha also has more tasks, so it should be identified as the top performer for tasks too
    expect(
      screen.getByText(
        /The team with the highest completed tasks is Team Alpha/i
      )
    ).toBeInTheDocument();
  });

  it('identifies the most improved team when there is sufficient data', async () => {
    render(
      <LeaderboardModal onClose={mockOnClose} userTeams={mockUserTeams} />
    );

    // Wait for data to load
    await waitFor(() => {
      expect(tasksApi.getTasksByTeam).toHaveBeenCalledTimes(2);
    });

    // With the mock data setup, one of the teams should be identified as most improved
    expect(screen.getByText(/Most Improved:/i)).toBeInTheDocument();
  });

  it('shows latest activity insights when data is available', async () => {
    render(
      <LeaderboardModal onClose={mockOnClose} userTeams={mockUserTeams} />
    );

    // Wait for data to load
    await waitFor(() => {
      expect(tasksApi.getTasksByTeam).toHaveBeenCalledTimes(2);
    });

    // Check for latest activity section
    expect(screen.getByText(/Latest Activity:/i)).toBeInTheDocument();
    expect(screen.getByText(/In the week of May 1/i)).toBeInTheDocument();
  });

  it('handles empty teams array gracefully', async () => {
    render(<LeaderboardModal onClose={mockOnClose} userTeams={[]} />);

    // No API calls should be made with empty teams
    await waitFor(() => {
      expect(tasksApi.getTasksByTeam).not.toHaveBeenCalled();
    });

    // Should show appropriate message
    expect(
      screen.getByText(/No team data available for insights/i)
    ).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    // Mock API error
    console.error = jest.fn(); // Suppress console.error
    (tasksApi.getTasksByTeam as jest.Mock).mockRejectedValue(
      new Error('Failed to fetch tasks')
    );

    render(
      <LeaderboardModal onClose={mockOnClose} userTeams={mockUserTeams} />
    );

    // Wait for API calls to fail
    await waitFor(() => {
      expect(tasksApi.getTasksByTeam).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });

    // Modal should still be functional
    fireEvent.click(screen.getByRole('button', { name: /Close/i }));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
