'use client';

import CreateTaskModal from '../components/ui/CreateTaskModal';
import TaskCard from '../components/ui/TaskCard';
import TaskColumn from '../components/ui/TaskColumn';
import TaskDetailsModal from '../components/ui/TaskDetailModal';
import EditTaskModal from '../components/ui/TaskEditModal';
import { tasksApi } from '@/utils/api';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useSearchParams } from 'next/navigation';
import React, { Suspense } from 'react';

//Due to vercel not directly supporting websockets, they are disabled for now.
//import io from 'socket.io-client';
//const SOCKET_URL =
// process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4200';

export type TaskType = {
  id: string;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'UNASSIGNED' | 'IN_PROGRESS' | 'TESTING' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  deadline?: string;
  assignedToId?: string;
  assignedTo?: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  createdById: string;
  teamId: string;
};

export default function Board() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-8"> Loading board...</div>
      }
    >
      <BoardContent />
    </Suspense>
  );
}

function BoardContent() {
  //temporary fix because next/navigation router doesn't allow for prop forwarding
  const searchParams = useSearchParams();
  const teamId = searchParams.get('teamId');

  // All useState hooks first
  const [tasks, setTasks] = React.useState<TaskType[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedTask, setSelectedTask] = React.useState<TaskType | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] =
    React.useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] =
    React.useState<boolean>(false);
  const [activeTask, setActiveTask] = React.useState<TaskType | null>(null);
  const [isMobile, setIsMobile] = React.useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchTasks = React.useCallback(async () => {
    try {
      if (teamId) {
        const tasksData = await tasksApi.getTasksByTeam(teamId);

        if (JSON.stringify(tasksData) !== JSON.stringify(tasks)) {
          setTasks(tasksData);
        }
        setError(null);
      }
    } catch (error) {
      setError('Failed to load tasks. Please try again.');
      console.error(error);
    }
  }, [teamId, tasks]);

  React.useEffect(() => {
    setIsLoading(true);
    fetchTasks().finally(() => {
      setIsLoading(false);
    });
  }, [teamId]);

  // Mobile detection
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  React.useEffect(() => {
    let isFirstRender = true;

    const pollInterval = setInterval(() => {
      if (isFirstRender) {
        isFirstRender = false;
        return;
      }
      fetchTasks();
    }, 15000);

    return () => {
      clearInterval(pollInterval);
    };
  }, [fetchTasks]);

  // Mobile task movement function
  const handleMobileTaskMove = async (
    task: TaskType,
    newStatus: TaskType['status']
  ) => {
    if (task.status === newStatus) return;

    try {
      const updatedTask = { ...task, status: newStatus };
      updateTask(updatedTask);
      await tasksApi.updateTaskStatus(task.id, newStatus);

      // Auto-assign when moving to IN_PROGRESS
      if (newStatus === 'IN_PROGRESS' && !task.assignedToId) {
        const userString = localStorage.getItem('user');
        if (userString) {
          const user = JSON.parse(userString);
          await tasksApi.assignTask(task.id, user.id);
          updateTask({
            ...updatedTask,
            assignedToId: user.id,
            assignedTo: {
              id: user.id,
              username: user.username,
              avatarUrl: user.avatarUrl,
            },
          });
        }
      }
    } catch (error) {
      console.error('Failed to update task status:', error);
      fetchTasks();
    }
  };

  const toggleModal = () => setIsCreateModalOpen(!isCreateModalOpen);

  // Handle drag start - set the active task for overlay
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const draggedTask = tasks.find((task) => task.id === active.id);
    setActiveTask(draggedTask || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    // Clear the active task when drag ends
    setActiveTask(null);

    if (!over) return;

    if (active.data.current?.status !== over.id) {
      const taskId = active.id as string;
      const newStatus = over.id as TaskType['status'];

      try {
        const taskToUpdate = tasks.find((t) => t.id === taskId);
        if (taskToUpdate) {
          const updatedTask = { ...taskToUpdate, status: newStatus };
          updateTask(updatedTask);
        }

        await tasksApi.updateTaskStatus(taskId, newStatus);

        if (
          newStatus === 'IN_PROGRESS' &&
          !tasks.find((t) => t.id === taskId)?.assignedToId
        ) {
          const userString = localStorage.getItem('user');
          if (userString) {
            const user = JSON.parse(userString);
            await tasksApi.assignTask(taskId, user.id);

            const assignedTask = tasks.find((t) => t.id === taskId);
            if (assignedTask) {
              updateTask({
                ...assignedTask,
                assignedToId: user.id,
                assignedTo: {
                  id: user.id,
                  username: user.username,
                  avatarUrl: user.avatarUrl,
                },
              });
            }
          }
        }
      } catch (error) {
        console.error('Failed to update task status:', error);
        fetchTasks();
      }
    }
  };

  const updateTask = (updatedTask: TaskType) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task
      )
    );
  };

  const addTask = (newTask: TaskType) => {
    setTasks((currentTasks) => [...currentTasks, newTask]);
  };

  const toggleCreateModal = () => setIsCreateModalOpen(!isCreateModalOpen);

  const handleViewTaskDetails = (task: TaskType) => {
    setSelectedTask(task);
    setIsDetailsModalOpen(true);
  };

  const handleEditTask = (task: TaskType) => {
    setSelectedTask(task);
    setIsDetailsModalOpen(false);
    setIsEditModalOpen(true);
  };

  const handleCreateTask = async (
    newTask: Omit<
      TaskType,
      'id' | 'createdAt' | 'updatedAt' | 'createdById' | 'status'
    >
  ) => {
    try {
      if (teamId) {
        const createdTask = await tasksApi.createTask({
          ...newTask,
          teamId,
          deadline: newTask.deadline ? new Date(newTask.deadline) : undefined,
        });

        addTask(createdTask);
        toggleModal();
      }
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const tasksByStatus = {
    UNNASIGNED: tasks.filter((task) => task.status === 'UNASSIGNED'),
    IN_PROGRESS: tasks.filter((task) => task.status === 'IN_PROGRESS'),
    TESTING: tasks.filter((task) => task.status === 'TESTING'),
    COMPLETED: tasks.filter((task) => task.status === 'COMPLETED'),
    CANCELLED: tasks.filter((task) => task.status === 'CANCELLED'),
  };

  if (isLoading)
    return <div className="flex justify-center p-8"> Loading tasks...</div>;
  if (error) return <div className="text-red-500 p-4 font-bold">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Board</h1>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Mobile: Backlog first */}
        <div className="block md:hidden mb-8">
          <TaskColumn
            title="Backlog"
            status="UNASSIGNED"
            tasks={tasksByStatus.UNNASIGNED}
            color="bg-gray-200"
            onViewTaskDetails={handleViewTaskDetails}
            showAddButton={true}
            onAddTask={toggleModal}
            isMobile={isMobile}
            onMobileTaskMove={handleMobileTaskMove}
          />
        </div>

        {/* Main columns grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <TaskColumn
            title="In Progress"
            status="IN_PROGRESS"
            tasks={tasksByStatus.IN_PROGRESS}
            color="bg-yellow-200"
            onViewTaskDetails={handleViewTaskDetails}
            isMobile={isMobile}
            onMobileTaskMove={handleMobileTaskMove}
          />
          <TaskColumn
            title="Review"
            status="TESTING"
            tasks={tasksByStatus.TESTING}
            color="bg-purple-200"
            onViewTaskDetails={handleViewTaskDetails}
            isMobile={isMobile}
            onMobileTaskMove={handleMobileTaskMove}
          />
          <TaskColumn
            title="Completed"
            status="COMPLETED"
            tasks={tasksByStatus.COMPLETED}
            color="bg-green-200"
            onViewTaskDetails={handleViewTaskDetails}
            isMobile={isMobile}
            onMobileTaskMove={handleMobileTaskMove}
          />
          <TaskColumn
            title="Cancelled"
            status="CANCELLED"
            tasks={tasksByStatus.CANCELLED}
            color="bg-red-200"
            onViewTaskDetails={handleViewTaskDetails}
            isMobile={isMobile}
            onMobileTaskMove={handleMobileTaskMove}
          />
        </div>

        {/* Desktop: Backlog at bottom */}
        <div className="hidden md:block mt-8 pt-8">
          <TaskColumn
            title="Backlog"
            status="UNASSIGNED"
            tasks={tasksByStatus.UNNASIGNED}
            color="bg-gray-200"
            onViewTaskDetails={handleViewTaskDetails}
            showAddButton={true}
            onAddTask={toggleModal}
            isMobile={isMobile}
            onMobileTaskMove={handleMobileTaskMove}
          />
        </div>

        {/* Add DragOverlay with better styling */}
        <DragOverlay dropAnimation={{ duration: 0 }}>
          {activeTask ? (
            <div className="transform rotate-3 opacity-90 pointer-events-none shadow-2xl">
              <TaskCard
                task={activeTask}
                onViewDetails={() => {}} // Empty function since overlay shouldn't be clickable
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {isCreateModalOpen && teamId && (
        <CreateTaskModal
          onClose={toggleCreateModal}
          onSubmit={handleCreateTask}
          teamId={teamId}
        />
      )}
      {isDetailsModalOpen && selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          onClose={() => setIsDetailsModalOpen(false)}
          onUpdate={fetchTasks}
          onDelete={fetchTasks}
          onEdit={handleEditTask}
        />
      )}
      {isEditModalOpen && selectedTask && (
        <EditTaskModal
          task={selectedTask}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={fetchTasks}
        />
      )}
    </div>
  );
}
