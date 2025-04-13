import TaskCard from './taskCard';
import { TaskType } from '@/app/board/page';
import { useDroppable } from '@dnd-kit/core';
import React from 'react';

interface TaskColumnProps {
  title: string;
  status: TaskType['status'];
  tasks: TaskType[];
  color: string;
}

const TaskColumn: React.FC<TaskColumnProps> = ({
  title,
  status,
  tasks,
  color,
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
      <div className="font-bold italic text-center mb-3">{title}</div>
      <div className="h-full min-h-64 bg-white rounded-lg p-2 space-y-2">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
};

export default TaskColumn;
