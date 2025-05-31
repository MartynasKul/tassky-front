'use client';

import TaskCard from './TaskCard';
import { TaskType } from '@/app/board/page';
import { useDroppable } from '@dnd-kit/core';
import React from 'react';

interface TaskColumnProps {
  title: string;
  status: TaskType['status'];
  tasks: TaskType[];
  color: string;
  onViewTaskDetails: (task: TaskType) => void;
  showAddButton?: boolean;
  onAddTask?: () => void;
  isMobile?: boolean;
  onMobileTaskMove?: (task: TaskType, newStatus: TaskType['status']) => void;
}

const TaskColumn: React.FC<TaskColumnProps> = ({
  title,
  status,
  tasks,
  color,
  onViewTaskDetails,
  showAddButton,
  onAddTask,
  isMobile = false,
  onMobileTaskMove,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div
      ref={isMobile ? undefined : setNodeRef}
      className={`${color} rounded-lg p-3 ${
        !isMobile && isOver ? 'ring-2 ring-blue-500' : ''
      }`}
    >
      <div className="flex justify-between items-center mb-4 -z-50">
        <h2 className="text-lg font-medium">{title}</h2>
        <span className="bg-white px-2 py-1 rounded-full font-bold text-sm">
          {tasks.length}
        </span>
        {showAddButton && onAddTask && (
          <button
            onClick={onAddTask}
            className="rounded-xl px-4 py-2 bg-violet-400 hover:bg-violet-500 text-white font-semibold shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            Add
          </button>
        )}
      </div>
      <div className="h-full min-h-64 bg-white rounded-lg p-2 space-y-2 max-h-128 overflow-y-auto overflow-x-visible">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onViewDetails={onViewTaskDetails}
            isMobile={isMobile}
            onMobileTaskMove={onMobileTaskMove}
          />
        ))}
      </div>
    </div>
  );
};

export default TaskColumn;
