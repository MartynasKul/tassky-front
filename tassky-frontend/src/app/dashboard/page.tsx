'use client';

import CreateTeamModal from '@/app/components/ui/CreateTeamModal';
import JoinTeamModal from '@/app/components/ui/JoinTeamModal';
import TeamButton from '@/app/components/ui/TeamButton';
import { teamsApi } from '@/utils/api';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface Team {
  id: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  totalXp?: number;
  totalTasks?: number;
  inviteCode: string;
}

export default function Dashboard() {
  const [teams, setTeams] = React.useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = React.useState<Team | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [showCreateTeamModal, setShowCreateTeamModal] =
    useState<boolean>(false);
  const [showJoinTeamModal, setShowJoinTeamModal] = useState<boolean>(false);
  const router = useRouter();

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const teamsData = await teamsApi.getTeams();
      setTeams(teamsData);

      if (teamsData.length > 0 && !selectedTeam) {
        setSelectedTeam(teamsData[0]);
      }
    } catch (error) {
      console.error('Failed to fetch teams', error);
      toast?.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchTeams();
  }, [router]);

  const handleCreateTeam = async (teamData: {
    name: string;
    description?: string;
  }) => {
    try {
      const newTeam = await teamsApi.createTeam(teamData);
      setTeams([...teams, newTeam]);
      setSelectedTeam(newTeam);
      setShowCreateTeamModal(false);
      toast?.success('Team created successfully!');
    } catch (error) {
      console.error('Failed to create team:', error);
      toast?.error('Failed to create team');
    }
  };

  const handleJoinTeam = async (inviteCode: string) => {
    try {
      const joinedTeam = await teamsApi.joinTeam(inviteCode);
      setTeams([...teams, joinedTeam]);
      setShowJoinTeamModal(false);
      toast?.success('Joined team successfully!');
    } catch (error) {
      console.error('Failed to join team', error);
      toast?.error('Failed to join team. Invalid code?');
    }
  };

  const handleSelectTeam = (team: Team) => {
    setSelectedTeam(team);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-violet-600">
      <main className="container mx-auto px-4 py-8">
        <div className="flex">
          {/* Sidebar with teams */}
          <div className="w-48 mr-8">
            <div className="mb-4 flex flex-col space-y-3 max-h-[80vh] overflow-y-auto pr-2">
              {loading ? (
                <div className="text-gray-500">Loading teams...</div>
              ) : teams.length > 0 ? (
                teams.map((team) => (
                  <TeamButton
                    key={team.id}
                    team={team}
                    isSelected={selectedTeam?.id === team.id}
                    onClick={() => handleSelectTeam(team)}
                  />
                ))
              ) : (
                <div className="text-gray-500">No teams yet</div>
              )}
            </div>
          </div>

          <div className="flex-1 max-w-5xl">
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
              {selectedTeam ? (
                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    {selectedTeam.name}
                  </h2>
                  {selectedTeam.description && (
                    <p className="text-gray-600 mb-4">
                      {selectedTeam.description}
                    </p>
                  )}
                  <div className="flex space-x-4 mb-6">
                    <div className="bg-violet-100 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Total XP</p>
                      <p className="text-xl font-bold">
                        {selectedTeam.totalXp || 0}
                      </p>
                    </div>
                    <div className="bg-violet-100 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Tasks</p>
                      <p className="text-xl font-bold">
                        {selectedTeam.totalTasks || 0}
                      </p>
                    </div>
                    <div className="bg-violet-100 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Invite code</p>
                      <p className="text-xl font-bold">
                        {selectedTeam.inviteCode || 0}
                      </p>
                    </div>

                    <div>
                      <button
                        onClick={() => {
                          console.log('Go board button pressed');
                          router.push('/kanbanBoard');
                        }}
                        className="rounded-xl px-10 py-2 bg-violet-400 hover:bg-violet-500 text-white font-semibold shadow-ld transition duration-300 ease-in-out transform hover:scale-105"
                      >
                        Go board
                      </button>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <p className="text-gray-500">
                      Tasks will be displayed here in future updates.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">
                  {teams.length > 0
                    ? 'Select a team to view its tasks'
                    : 'Create or join a team to get started'}
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {showCreateTeamModal && (
        <CreateTeamModal
          onClose={() => setShowCreateTeamModal(false)}
          onCreateTeam={handleCreateTeam}
        />
      )}

      {showJoinTeamModal && (
        <JoinTeamModal
          onClose={() => setShowJoinTeamModal(false)}
          onJoinTeam={handleJoinTeam}
        />
      )}
    </div>
  );
}
