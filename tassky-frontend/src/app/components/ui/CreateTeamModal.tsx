'use client';

import React, { useState } from 'react';

interface CreateTeamModalProps {
  onClose: () => void;
  onCreateTeam: (team: { id: string; name: string }) => void;
}

export default function CreateTeamModal({
  onClose,
  onCreateTeam,
}: CreateTeamModalProps) {
  const [teamName, setTeamName] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (teamName.trim()) {
      const newTeam = {
        id: Date.now().toString(),
        name: teamName,
      };
      onCreateTeam(newTeam);
    }
  };

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create Team</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="teamName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Team Name
            </label>
            <input
              type="text"
              id="teamName"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="Enter team name"
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-violet-500 text-white rounded-md hover:bg-violet-600"
            >
              Create Team
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
