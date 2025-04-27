'use client';

import CreateTaskModal from '../components/ui/CreateTaskModal';
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
        <div className="flex jsutify-center p-8"> Loading board...</div>
      }
    >
      <BoardContent />
    </Suspense>
  );
}
function BoardContent() {
  //temporary fix beacuse next/navigation router doesnt allow for prop forwarding
  const searchParams = useSearchParams();
  const teamId = searchParams.get('teamId');
  const [tasks, setTasks] = React.useState<TaskType[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedTask, setSelectedTask] = React.useState<TaskType | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] =
    React.useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] =
    React.useState<boolean>(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
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

  //Fetch tasks with websockets. Not supported by Vercel directly therefore disabled in code.
  /*   React.useEffect(() => {
    fetchTasks();

    //Setup socket connection from real-time updates
    const socket = io(SOCKET_URL);

    socket.on('connect', () => {
      console.log('Connect to WebSocket server');
      socket.emit('joinRoom', teamId);
    });

    socket.on('taskUpdated', (updatedtask: TaskType) => {
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === updatedtask.id ? updatedtask : task
        )
      );
    });

    socket.on('taskCreated', (newTask: TaskType) => {
      setTasks((currentTasks) => [...currentTasks, newTask]);
    });

    socket.on('taskDeleted', (taskId: string) => {
      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== taskId)
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [teamId, fetchTasks]);
 */

  React.useEffect(() => {
    setIsLoading(true);
    fetchTasks().finally(() => {
      setIsLoading(false);
    });
  }, [teamId]);

  React.useEffect(() => {
    let isFirstRender = true;

    const pollInterval = setInterval(() => {
      if (isFirstRender) {
        isFirstRender = false;
        return;
      }
      fetchTasks();
    }, 1000);

    return () => {
      clearInterval(pollInterval);
    };
  }, [fetchTasks]);

  const toggleModal = () => setIsCreateModalOpen(!isCreateModalOpen);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

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
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <TaskColumn
            title="In Progress"
            status="IN_PROGRESS"
            tasks={tasksByStatus.IN_PROGRESS}
            color="bg-yellow-200"
            onViewTaskDetails={handleViewTaskDetails}
          />
          <TaskColumn
            title="Testing"
            status="TESTING"
            tasks={tasksByStatus.TESTING}
            color="bg-purple-200"
            onViewTaskDetails={handleViewTaskDetails}
          />
          <TaskColumn
            title="Completed"
            status="COMPLETED"
            tasks={tasksByStatus.COMPLETED}
            color="bg-green-200"
            onViewTaskDetails={handleViewTaskDetails}
          />
          <TaskColumn
            title="Cancelled"
            status="CANCELLED"
            tasks={tasksByStatus.CANCELLED}
            color="bg-red-200"
            onViewTaskDetails={handleViewTaskDetails}
          />
        </div>
        <div className="mt-8 pt-8 ">
          <TaskColumn
            title="Backlog"
            status="UNASSIGNED"
            tasks={tasksByStatus.UNNASIGNED}
            color="bg-gray-200"
            onViewTaskDetails={handleViewTaskDetails}
            showAddButton={true}
            onAddTask={toggleModal}
          />
        </div>{' '}
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
