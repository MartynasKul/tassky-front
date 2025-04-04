import { SortableTask } from './SortableTask';
import {
  KanbanColumnType,
  //  KanbanTask
} from './page';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import React from 'react';

interface KanbanColumnProps {
  column: KanbanColumnType;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ column }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.id}`,
  });

  // Get custom background color based on column id
  const getColumnHeaderColor = (id: string) => {
    switch (id) {
      case 'unassigned':
        return 'bg-purple-400';
      case 'in-progress':
        return 'bg-amber-400';
      case 'testing':
        return 'bg-violet-500';
      case 'completed':
        return 'bg-lime-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-blue-400';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div
        className={`${getColumnHeaderColor(
          column.id
        )} p-2 rounded-t-md text-white font-medium`}
      >
        {column.title}
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 min-h-64 p-2 rounded-b-md ${
          isOver ? 'bg-blue-50/80' : 'bg-gray-50/60'
        } backdrop-blur-sm overflow-y-auto transition-colors duration-200`}
      >
        <SortableContext
          items={column.tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.tasks.map((task) => (
            <SortableTask key={task.id} task={task} />
          ))}
        </SortableContext>

        {column.tasks.length === 0 && (
          <div className="h-16 flex items-center justify-center text-gray-400 border border-dashed border-gray-300 rounded-md">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
};
