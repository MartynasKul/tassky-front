'use client';

import { KanbanColumn } from './KanbanColumn';
// import { SortableTask } from './SortableTask';
import { Card, CardContent } from '@/app/components/ui/card';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  // SortableContext,
  sortableKeyboardCoordinates,
  // verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import React, { useState } from 'react';

// Types
export interface KanbanTask {
  id: string;
  content: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface KanbanColumnType {
  id: string;
  title: string;
  tasks: KanbanTask[];
}

interface KanbanBoardProps {
  initialColumns?: KanbanColumnType[];
}

// Sample initial data - this would come from backend later
const sampleColumns: KanbanColumnType[] = [
  {
    id: 'unassigned',
    title: 'Unassigned',
    tasks: [
      {
        id: 'task-1',
        content: 'Create authentication system',
        priority: 'high',
      },
      { id: 'task-2', content: 'Design logo', priority: 'medium' },
    ],
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    tasks: [
      { id: 'task-3', content: 'Setup CI/CD pipeline', priority: 'medium' },
    ],
  },
  {
    id: 'testing',
    title: 'Testing',
    tasks: [
      {
        id: 'task-4',
        content: 'Test user registration flow',
        priority: 'high',
      },
    ],
  },
  {
    id: 'completed',
    title: 'Completed',
    tasks: [
      { id: 'task-5', content: 'Initialize Next.js project', priority: 'low' },
    ],
  },
  {
    id: 'cancelled',
    title: 'Cancelled',
    tasks: [],
  },
];

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  initialColumns = sampleColumns,
}) => {
  const [columns, setColumns] = useState<KanbanColumnType[]>(initialColumns);
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);

  // Initialize sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Find the column and task by task ID
  const findTaskAndColumn = (taskId: string) => {
    for (const column of columns) {
      const task = column.tasks.find((task) => task.id === taskId);
      if (task) {
        return { task, column };
      }
    }
    return { task: null, column: null };
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { task } = findTaskAndColumn(event.active.id as string);
    setActiveTask(task);
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveTask(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find source column and task
    const { task: activeTask, column: activeColumn } =
      findTaskAndColumn(activeId);

    if (!activeTask || !activeColumn) {
      setActiveTask(null);
      return;
    }

    // Check if the task is dropped on a column
    const isColumnDrop = overId.startsWith('column-');

    if (isColumnDrop) {
      // Extract column ID from the drop target ID
      const targetColumnId = overId.replace('column-', '');
      const targetColumn = columns.find(
        (column) => column.id === targetColumnId
      );

      if (targetColumn) {
        // Remove task from source column
        const newColumns = columns.map((column) => {
          if (column.id === activeColumn.id) {
            return {
              ...column,
              tasks: column.tasks.filter((task) => task.id !== activeId),
            };
          }
          // Add task to target column
          if (column.id === targetColumnId) {
            return {
              ...column,
              tasks: [...column.tasks, activeTask],
            };
          }
          return column;
        });

        setColumns(newColumns);
      }
    } else {
      // Handle reordering within the same column
      const { column: overColumn } = findTaskAndColumn(overId);

      if (overColumn && activeColumn.id === overColumn.id) {
        const sourceIndex = activeColumn.tasks.findIndex(
          (task) => task.id === activeId
        );
        const targetIndex = overColumn.tasks.findIndex(
          (task) => task.id === overId
        );

        if (sourceIndex !== -1 && targetIndex !== -1) {
          const newColumns = columns.map((column) => {
            if (column.id === activeColumn.id) {
              return {
                ...column,
                tasks: arrayMove(column.tasks, sourceIndex, targetIndex),
              };
            }
            return column;
          });

          setColumns(newColumns);
        }
      }
    }

    setActiveTask(null);
  };

  // Handle drag over - for dropping tasks between columns
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find source column and task
    const { task: activeTask, column: activeColumn } =
      findTaskAndColumn(activeId);

    if (!activeTask || !activeColumn) return;

    // Check if the task is dragged over another task in a different column
    if (!overId.startsWith('column-')) {
      const { column: overColumn } = findTaskAndColumn(overId);

      if (overColumn && activeColumn.id !== overColumn.id) {
        // Remove task from source column
        const newColumns = columns.map((column) => {
          if (column.id === activeColumn.id) {
            return {
              ...column,
              tasks: column.tasks.filter((task) => task.id !== activeId),
            };
          }
          // Add task to target column
          if (column.id === overColumn.id) {
            // Find the position to insert the task
            const overTaskIndex = overColumn.tasks.findIndex(
              (task) => task.id === overId
            );
            const newTasks = [...overColumn.tasks];
            newTasks.splice(overTaskIndex, 0, activeTask);

            return {
              ...column,
              tasks: newTasks,
            };
          }
          return column;
        });

        setColumns(newColumns);
      }
    }
  };

  return (
    <div className="p-4 w-full h-full min-h-screen overflow-x-auto">
      <Card className="bg-white/40 backdrop-blur-sm border border-white/20 shadow-xl rounded-lg p-2">
        <CardContent className="p-4">
          <h2 className="text-2xl font-bold mb-6">Tassky Board</h2>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {columns.map((column) => (
                <KanbanColumn key={column.id} column={column} />
              ))}
            </div>

            <DragOverlay>
              {activeTask ? (
                <div className="p-3 bg-white rounded-md shadow border-l-4 border-blue-500 opacity-80">
                  {activeTask.content}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </CardContent>
      </Card>
    </div>
  );
};

export default KanbanBoard;
