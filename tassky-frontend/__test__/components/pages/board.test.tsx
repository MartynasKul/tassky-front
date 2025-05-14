import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';
import Board from '@/app/board/page';
import { tasksApi } from '@/utils/api';

// Mock Next.js navigation hooks
jest.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: jest.fn((param) => {
      if (param === 'teamId') return 'team-123';
      return null;
    }),
  }),
}));

// Mock the API
jest.mock('@/utils/api', () => ({
  tasksApi: {
    getTasksByTeam: jest.fn(),
    updateTaskStatus: jest.fn(),
    assignTask: jest.fn(),
    createTask: jest.fn(),
  },
}));

// Mock DnD kit
jest.mock('@dnd-kit/core', () => ({
  ...jest.requireActual('@dnd-kit/core'),
  DndContext: ({ children }) => <div data-testid="dnd-context">{children}</div>,
  useSensor: jest.fn(() => ({})),
  useSensors: jest.fn(() => []),
}));

jest.mock('@dnd-kit/sortable', () => ({
  sortableKeyboardCoordinates: jest.fn(),
}));

// Mock localStorage
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => {
      if (key === 'user')
        return JSON.stringify({
          id: 'user-1',
          username: 'testuser',
          avatarUrl: null,
        });
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

// Mock the TaskColumn component
jest.mock('@/app/components/ui/TaskColumn', () => ({
  __esModule: true,
  default: jest.fn(({ title, tasks, onViewTaskDetails, onAddTask }) => (
    <div
      data-testid={`task-column-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <h3>{title}</h3>
      <div>Tasks count: {tasks.length}</div>
      {onAddTask && (
        <button onClick={onAddTask} data-testid="add-task-button">
          Add Task
        </button>
      )}
      {tasks.map((task) => (
        <div
          key={task.id}
          data-testid={`task-${task.id}`}
          onClick={() => onViewTaskDetails && onViewTaskDetails(task)}
        >
          {task.title}
        </div>
      ))}
    </div>
  )),
}));

// Mock modal components
jest.mock('@/app/components/ui/CreateTaskModal', () => ({
  __esModule: true,
  default: jest.fn(({ onClose, onSubmit, teamId }) => (
    <div data-testid="create-task-modal">
      <button onClick={onClose} data-testid="close-modal-button">
        Close
      </button>
      <button
        onClick={() =>
          onSubmit({
            title: 'New Test Task',
            description: 'Test Description',
            priority: 'MEDIUM',
            teamId: teamId,
          })
        }
        data-testid="submit-task-button"
      >
        Create Task
      </button>
    </div>
  )),
}));

jest.mock('@/app/components/ui/TaskDetailModal', () => ({
  __esModule: true,
  default: jest.fn(({ task, onClose, onEdit }) => (
    <div data-testid="task-details-modal">
      <div>Task Title: {task.title}</div>
      <button onClick={onClose} data-testid="close-details-button">
        Close
      </button>
      <button onClick={() => onEdit(task)} data-testid="edit-task-button">
        Edit
      </button>
    </div>
  )),
}));

jest.mock('@/app/components/ui/TaskEditModal', () => ({
  __esModule: true,
  default: jest.fn(({ task, onClose }) => (
    <div data-testid="task-edit-modal">
      <div>Editing Task: {task.title}</div>
      <button onClick={onClose} data-testid="close-edit-button">
        Close
      </button>
    </div>
  )),
}));

describe('Board Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock API responses
    const mockTasks = [
      {
        id: 'task-1',
        title: 'Test Task 1',
        description: 'Description 1',
        priority: 'HIGH',
        status: 'UNASSIGNED',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02',
        assignedToId: null,
        createdById: 'user-creator',
        teamId: 'team-123',
      },
      {
        id: 'task-2',
        title: 'Test Task 2',
        description: 'Description 2',
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02',
        assignedToId: 'user-1',
        assignedTo: {
          id: 'user-1',
          username: 'testuser',
          avatarUrl: null,
        },
        createdById: 'user-creator',
        teamId: 'team-123',
      },
    ];

    (tasksApi.getTasksByTeam as jest.Mock).mockResolvedValue(mockTasks);
    (tasksApi.createTask as jest.Mock).mockImplementation((taskData) =>
      Promise.resolve({
        id: 'new-task-id',
        ...taskData,
        status: 'UNASSIGNED',
        createdAt: '2024-01-03',
        updatedAt: '2024-01-03',
        createdById: 'user-1',
      })
    );
  });

  it('renders the board with task columns', async () => {
    render(<Board />);

    // Should initially show loading
    expect(screen.getByText(/Loading board/i)).toBeInTheDocument();

    // Wait for tasks to load
    await waitFor(() => {
      expect(tasksApi.getTasksByTeam).toHaveBeenCalledWith('team-123');
    });

    // Should show all the task columns
    expect(screen.getByTestId('task-column-in-progress')).toBeInTheDocument();
    expect(screen.getByTestId('task-column-testing')).toBeInTheDocument();
    expect(screen.getByTestId('task-column-completed')).toBeInTheDocument();
    expect(screen.getByTestId('task-column-cancelled')).toBeInTheDocument();
    expect(screen.getByTestId('task-column-backlog')).toBeInTheDocument();
  });

  it('opens the create task modal when clicking add task button', async () => {
    render(<Board />);

    // Wait for tasks to load
    await waitFor(() => {
      expect(tasksApi.getTasksByTeam).toHaveBeenCalled();
    });

    // Click the add task button
    const addButton = screen.getByTestId('add-task-button');
    fireEvent.click(addButton);

    // Create task modal should be visible
    expect(screen.getByTestId('create-task-modal')).toBeInTheDocument();

    // Close the modal
    fireEvent.click(screen.getByTestId('close-modal-button'));
    expect(screen.queryByTestId('create-task-modal')).not.toBeInTheDocument();
  });

  it('creates a new task when submitting the create task form', async () => {
    render(<Board />);

    // Wait for tasks to load
    await waitFor(() => {
      expect(tasksApi.getTasksByTeam).toHaveBeenCalled();
    });

    // Open the create task modal
    fireEvent.click(screen.getByTestId('add-task-button'));

    // Submit the form
    fireEvent.click(screen.getByTestId('submit-task-button'));

    // Verify API was called
    await waitFor(() => {
      expect(tasksApi.createTask).toHaveBeenCalledWith({
        title: 'New Test Task',
        description: 'Test Description',
        priority: 'MEDIUM',
        teamId: 'team-123',
        deadline: undefined,
      });
    });

    // Modal should close after task creation
    expect(screen.queryByTestId('create-task-modal')).not.toBeInTheDocument();
  });

  it('opens task details when clicking on a task', async () => {
    render(<Board />);

    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByTestId('task-task-1')).toBeInTheDocument();
    });

    // Click on a task
    fireEvent.click(screen.getByTestId('task-task-1'));

    // Details modal should be visible
    expect(screen.getByTestId('task-details-modal')).toBeInTheDocument();
    expect(screen.getByText('Task Title: Test Task 1')).toBeInTheDocument();

    // Close the modal
    fireEvent.click(screen.getByTestId('close-details-button'));
    expect(screen.queryByTestId('task-details-modal')).not.toBeInTheDocument();
  });

  it('opens task edit modal from task details', async () => {
    render(<Board />);

    // Wait for tasks to load and click on a task
    await waitFor(() => {
      expect(screen.getByTestId('task-task-1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('task-task-1'));

    // Click edit button
    fireEvent.click(screen.getByTestId('edit-task-button'));

    // Edit modal should be visible
    expect(screen.getByTestId('task-edit-modal')).toBeInTheDocument();
    expect(screen.getByText('Editing Task: Test Task 1')).toBeInTheDocument();

    // Close the edit modal
    fireEvent.click(screen.getByTestId('close-edit-button'));
    expect(screen.queryByTestId('task-edit-modal')).not.toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    // Mock API error
    (tasksApi.getTasksByTeam as jest.Mock).mockRejectedValue(
      new Error('Failed to load tasks')
    );

    render(<Board />);

    // Wait for error to display
    await waitFor(() => {
      expect(
        screen.getByText('Failed to load tasks. Please try again.')
      ).toBeInTheDocument();
    });
  });
});
