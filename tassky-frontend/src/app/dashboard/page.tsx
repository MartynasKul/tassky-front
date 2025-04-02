'use client';

import CreateTeamModal from '@/app/components/ui/CreateTeamModal';
import JoinTeamModal from '@/app/components/ui/JoinTeamModal';
import TeamButton from '@/app/components/ui/TeamButton';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

interface Team {
  id: string;
  name: string;
}

export default function Dashboard() {
  const [teams, setTeams] = useState<Team[]>([
    { id: '1', name: 'T1' },
    { id: '2', name: 'T2' },
    { id: '3', name: 'T3' },
    { id: '4', name: 'T4' },
  ]);
  const [showCreateTeamModal, setShowCreateTeamModal] =
    useState<boolean>(false);
  const [showJoinTeamModal, setShowJoinTeamModal] = useState<boolean>(false);
  const router = useRouter();

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-violet-600">
      <main className="container mx-auto px-4 py-8">
        <div className="flex">
          {/* Sidebar stays the same */}
          <div className="w-48 mr-8">
            {' '}
            <div className="mb-4 flex flex-col space-y-3 max-h-[80vh] overflow-y-auto pr-2">
              {teams.map((team) => (
                <TeamButton key={team.id} team={team} />
              ))}
            </div>
          </div>

          <div className="flex-1 max-w-5xl">
            {' '}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">My Dashboard</h1>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowJoinTeamModal(true)}
                  className="rounded-xl px-10 py-2 bg-violet-400 hover:bg-violet-500 text-white font-semibold shadow-ld transition duration-300 ease-in-out transform hover:scale-105"
                >
                  Join team
                </button>
                <button
                  onClick={() => setShowCreateTeamModal(true)}
                  className="rounded-xl px-10 py-2 bg-violet-400 hover:bg-violet-500 text-white font-semibold shadow-ld transition duration-300 ease-in-out transform hover:scale-105"
                >
                  Create team
                </button>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 min-h-[600px]">
              {' '}
              <p className="text-gray-500">Select a team to view its tasks</p>
              <p className="text-gray-500">IN DEVELOPMENT</p>
            </div>
          </div>
        </div>
      </main>

      {/* Modals - Now they float on top instead of darkening the screen */}
      {showCreateTeamModal && (
        <CreateTeamModal
          onClose={() => setShowCreateTeamModal(false)}
          onCreateTeam={(newTeam) => {
            setTeams([...teams, newTeam]);
            setShowCreateTeamModal(false);
          }}
        />
      )}

      {showJoinTeamModal && (
        <JoinTeamModal
          onClose={() => setShowJoinTeamModal(false)}
          onJoinTeam={(joinedTeam) => {
            setTeams([...teams, joinedTeam]);
            setShowJoinTeamModal(false);
          }}
        />
      )}
    </div>
  );
}
