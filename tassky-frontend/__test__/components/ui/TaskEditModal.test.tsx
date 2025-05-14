import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';
import TaskEditModal from '@/app/components/ui/TaskEditModal';
import { teamsApi, tasksApi } from '@/utils/api';

// Mock the API calls
jest.mock('@/utils/api', () => ({
  teamsApi: {
    getTeamWithMembers: jest.fn(),
  },
  tasksApi: {
    updateTask: jest.fn(),
  },
}));

// Mock localStorage
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('TaskEditModal', () => {
  const mockTask = {
    id: 'task-123',
    title: 'Test Task',
    description: 'This is a test task',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    createdAt: '2025-05-01T12:00:00Z',
    updatedAt: '2025-05-01T12:00:00Z',
    deadline: '2025-05-30T12:00:00Z',
    assignedToId: 'user-1',
    assignedTo: {
      id: 'user-1',
      username: 'testuser1',
    },
    createdBy: {
      id: 'user-creator',
      username: 'creatorsname',
    },
    teamId: 'team-123',
  };

  const mockTeamMembers = [
    {
      id: 'member-1',
      user: {
        id: 'user-1',
        username: 'testuser1',
      },
    },
    {
      id: 'member-2',
      user: {
        id: 'user-2',
        username: 'testuser2',
      },
    },
  ];

  const mockOnClose = jest.fn();
  const mockOnUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock API responses
    (teamsApi.getTeamWithMembers as jest.Mock).mockResolvedValue({
      members: mockTeamMembers,
    });
    (tasksApi.updateTask as jest.Mock).mockResolvedValue(mockTask);

    // Set up localStorage mock
    window.localStorage.setItem(
      'user',
      JSON.stringify({ id: 'user-1', username: 'testuser1' })
    );
  });

  it('renders correctly with task data', async () => {
    render(
      <TaskEditModal
        task={mockTask}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    // Check that all form elements are rendered with correct values
    expect(screen.getByText('Edit Task')).toBeInTheDocument();

    // Form fields should be populated with task data
    expect(screen.getByLabelText(/Title/i)).toHaveValue(mockTask.title);
    expect(screen.getByLabelText(/Description/i)).toHaveValue(
      mockTask.description
    );

    // Select fields should have the correct values
    expect(screen.getByLabelText(/Status/i)).toHaveValue(mockTask.status);
    expect(screen.getByLabelText(/Priority/i)).toHaveValue(mockTask.priority);

    // Wait for team members to load
    await waitFor(() => {
      expect(teamsApi.getTeamWithMembers).toHaveBeenCalledWith(mockTask.teamId);
    });

    // Check that the assignee select has the correct value
    expect(screen.getByLabelText(/Assign To/i)).toHaveValue(
      mockTask.assignedToId
    );

    // Deadline field should be formatted correctly (YYYY-MM-DD)
    const deadlineDate = new Date(mockTask.deadline)
      .toISOString()
      .split('T')[0];
    expect(screen.getByLabelText(/Deadline/i)).toHaveValue(deadlineDate);
  });

  it('calls onClose when cancel button is clicked', () => {
    render(
      <TaskEditModal
        task={mockTask}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('updates task with changed values', async () => {
    render(
      <TaskEditModal
        task={mockTask}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    // Change title and description
    fireEvent.change(screen.getByLabelText(/Title/i), {
      target: { value: 'Updated Task Title' },
    });
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: 'Updated task description' },
    });

    // Change status and priority
    fireEvent.change(screen.getByLabelText(/Status/i), {
      target: { value: 'TESTING' },
    });
    fireEvent.change(screen.getByLabelText(/Priority/i), {
      target: { value: 'HIGH' },
    });

    // Wait for team members to load
    await waitFor(() => {
      expect(teamsApi.getTeamWithMembers).toHaveBeenCalledWith(mockTask.teamId);
    });

    // Change assignee
    fireEvent.change(screen.getByLabelText(/Assign To/i), {
      target: { value: 'user-2' },
    });

    // Change deadline
    const newDeadline = '2025-06-15';
    fireEvent.change(screen.getByLabelText(/Deadline/i), {
      target: { value: newDeadline },
    });

    // Submit the form
    fireEvent.submit(screen.getByRole('button', { name: /Update Task/i }));

    // Check that updateTask was called with the correct data
    await waitFor(() => {
      expect(tasksApi.updateTask).toHaveBeenCalledWith(mockTask.id, {
        title: 'Updated Task Title',
        description: 'Updated task description',
        status: 'TESTING',
        priority: 'HIGH',
        assignedToId: 'user-2',
        deadline: expect.any(String), // ISO string of the deadline
      });
    });

    // Check that onUpdate and onClose were called
    expect(mockOnUpdate).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('does not submit when title is empty', async () => {
    render(
      <TaskEditModal
        task={mockTask}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    // Clear the title
    fireEvent.change(screen.getByLabelText(/Title/i), {
      target: { value: '' },
    });

    // Try to submit the form
    fireEvent.submit(screen.getByRole('button', { name: /Update Task/i }));

    // Check that updateTask was not called
    expect(tasksApi.updateTask).not.toHaveBeenCalled();
  });

  it('auto-assigns task to current user when status changes and task is unassigned', async () => {
    // Create an unassigned task
    const unassignedTask = {
      ...mockTask,
      assignedToId: undefined,
      assignedTo: undefined,
      status: 'UNASSIGNED',
    };

    // Set current user in localStorage
    const currentUser = { id: 'current-user', username: 'currentuser' };
    window.localStorage.setItem('user', JSON.stringify(currentUser));

    render(
      <TaskEditModal
        task={unassignedTask}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    // Change status to IN_PROGRESS
    fireEvent.change(screen.getByLabelText(/Status/i), {
      target: { value: 'IN_PROGRESS' },
    });

    // Submit the form
    fireEvent.submit(screen.getByRole('button', { name: /Update Task/i }));

    // Check that updateTask was called with assignedToId set to current user
    await waitFor(() => {
      expect(tasksApi.updateTask).toHaveBeenCalledWith(
        unassignedTask.id,
        expect.objectContaining({
          status: 'IN_PROGRESS',
          assignedToId: currentUser.id,
        })
      );
    });
  });

  it('displays loading state when fetching team members', async () => {
    // Mock a slow API response
    (teamsApi.getTeamWithMembers as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ members: mockTeamMembers }), 100)
        )
    );

    render(
      <TaskEditModal
        task={mockTask}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    // Check that the update button is disabled during loading
    expect(screen.getByRole('button', { name: /Update Task/i })).toBeDisabled();

    // Wait for the team members to load
    await waitFor(() => {
      expect(teamsApi.getTeamWithMembers).toHaveBeenCalled();
    });

    // Check that the update button is enabled after loading
    expect(
      screen.getByRole('button', { name: /Update Task/i })
    ).not.toBeDisabled();
  });

  it('handles API errors gracefully', async () => {
    // Mock API error
    console.error = jest.fn(); // Suppress console.error for test
    (tasksApi.updateTask as jest.Mock).mockRejectedValue(
      new Error('Failed to update task')
    );

    render(
      <TaskEditModal
        task={mockTask}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    // Submit the form
    fireEvent.submit(screen.getByRole('button', { name: /Update Task/i }));

    // Wait for the API call to fail
    await waitFor(() => {
      expect(tasksApi.updateTask).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });

    // Ensure update and close were not called after error
    expect(mockOnUpdate).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});
