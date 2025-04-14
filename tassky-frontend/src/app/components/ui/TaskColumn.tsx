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
}

const TaskColumn: React.FC<TaskColumnProps> = ({
  title,
  status,
  tasks,
  color,
  onViewTaskDetails,
  showAddButton,
  onAddTask,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div
      ref={setNodeRef}
      className={`${color} rounded-lg p-3 ${
        isOver ? 'ring-2 ring-blue-500' : ''
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">{title}</h2>
        <span className="bg-white px-2 py-1 rounded-full text-sm">
          {tasks.length}
        </span>
        {showAddButton && onAddTask && (
          <button
            onClick={onAddTask}
            className="ml-2 px-3 py-1 bg-white border border-black rounded-full hover:bg-gray-200 text-sm"
          >
            Add
          </button>
        )}
      </div>
      <div className="h-full min-h-64 bg-white rounded-lg p-2 space-y-2">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onViewDetails={onViewTaskDetails}
          />
        ))}
      </div>
    </div>
  );
};

export default TaskColumn;
