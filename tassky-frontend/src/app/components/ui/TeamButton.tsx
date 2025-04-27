import Image from 'next/image';
import React from 'react';

interface TeamButtonProps {
  team: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  isSelected?: boolean;
  onClick?: () => void;
}

export default function TeamButton({
  team,
  isSelected = false,
  onClick,
}: TeamButtonProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full p-2 shadow-xl rounded-lg transition-all ${
        isSelected
          ? 'bg-violet-500 text-white'
          : 'bg-white hover:bg-violet-100 text-gray-800'
      }`}
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-full mr-2 bg-violet-300 flex items-center justify-center overflow-hidden">
        {team.avatarUrl ? (
          <Image src={team.avatarUrl} alt={team.name} width={32} height={32} />
        ) : (
          <span className="text-sm font-medium text-white">
            {getInitials(team.name)}
          </span>
        )}
      </div>
      <span className="truncate font-medium">{team.name}</span>
    </button>
  );
}
