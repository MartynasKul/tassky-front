'use client';

import React, { useState } from 'react';

interface JoinTeamModalProps {
  onClose: () => void;
  onJoinTeam: (team: { id: string; name: string }) => void;
}

export default function JoinTeamModal({
  onClose,
  onJoinTeam,
}: JoinTeamModalProps) {
  const [teamCode, setTeamCode] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (teamCode.trim()) {
      const joinedTeam = {
        id: teamCode,
        name: `Team-${teamCode.substring(0, 4)}`,
      };
      onJoinTeam(joinedTeam);
    }
  };

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Join Team</h2>
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
              htmlFor="teamCode"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Team Code
            </label>
            <input
              type="text"
              id="teamCode"
              value={teamCode}
              onChange={(e) => setTeamCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="Enter team invitation code"
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
              Join Team
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
