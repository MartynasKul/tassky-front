'use client';

import React from 'react';

interface TeamButtonProps {
  team: {
    id: string;
    name: string;
  };
}

export default function TeamButton({ team }: TeamButtonProps) {
  return (
    <button
      className="w-full py-3 px-6 text-left rounded-full bg-white border border-gray-200 hover:border-violet-400 shadow-sm font-medium transition-colors hover:scale-105"
      onClick={() => {
        console.log(`Team ${team.name} selected`);
      }}
    >
      {team.name}
    </button>
  );
}
