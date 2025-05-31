'use client';

import LeaderboardModal from '../components/ui/LeaderboardModal';
import TeamLeaderboardModal from '../components/ui/TeamLeaderboardModal';
import CreateTeamModal from '@/app/components/ui/CreateTeamModal';
import JoinTeamModal from '@/app/components/ui/JoinTeamModal';
import TeamAdminPanel from '@/app/components/ui/TeamAdminPanel';
import TeamButton from '@/app/components/ui/TeamButton';
import { teamsApi } from '@/utils/api';
import { useRouter } from 'next/navigation';
import React from 'react';
import { toast } from 'react-hot-toast';

interface TeamMember {
  id: string;
  userId: string;
  role: 'ADMIN' | 'CAPTAIN' | 'MEMBER';
  joinedAt: string;
  user: {
    id: string;
    username: string;
    email: string;
    avatarUrl?: string;
  };
}

interface Team {
  id: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  totalXp?: number;
  totalTasks?: number;
  inviteCode: string;
  members?: TeamMember[];
}

export default function Dashboard() {
  const [teams, setTeams] = React.useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = React.useState<Team | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [showCreateTeamModal, setShowCreateTeamModal] =
    React.useState<boolean>(false);
  const [showJoinTeamModal, setShowJoinTeamModal] =
    React.useState<boolean>(false);
  const [showAdminPanel, setShowAdminPanel] = React.useState<boolean>(false);
  const [isAdmin, setIsAdmin] = React.useState<boolean>(false);
  const [currentUser, setCurrentUser] = React.useState<string | null>(null);
  const [showLeaderboardModal, setShowLeaderboardModal] =
    React.useState<boolean>(false);
  const [showTeamLeaderboardModal, setShowTeamLeaderboardModal] =
    React.useState<boolean>(false);
  const router = useRouter();

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const teamsData = await teamsApi.getTeams();
      setTeams(teamsData);

      if (teamsData.length > 0 && !selectedTeam) {
        setSelectedTeam(teamsData[0]);
        const detailedTeam = await teamsApi.getTeamWithMembers(teamsData[0].id);
        setSelectedTeam(detailedTeam);
        checkIfUserIsAdmin(detailedTeam);
      }
    } catch (error) {
      console.error('Failed to fetch teams', error);
      toast?.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = () => {
    try {
      const userInfoString = localStorage.getItem('user');

      if (userInfoString) {
        const userInfo = JSON.parse(userInfoString);
        setCurrentUser(userInfo.id);
      } else {
        console.error('No user information found in localStorage');
        router.push('/login');
      }
    } catch (error) {
      console.error('Failed to parse user info from localStorage', error);
    }
  };

  const checkIfUserIsAdmin = (team: Team) => {
    if (!team.members || !currentUser) return false;

    const userMembership = team.members.find(
      (member) => member.userId === currentUser
    );

    const adminStatus = userMembership?.role === 'ADMIN';
    setIsAdmin(adminStatus);
    return adminStatus;
  };

  React.useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchCurrentUser();
  }, [router]);

  React.useEffect(() => {
    if (currentUser) {
      fetchTeams();
    }
  }, [currentUser]);

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

      const detailedTeam = await teamsApi.getTeamWithMembers(newTeam.id);
      setSelectedTeam(detailedTeam);
      checkIfUserIsAdmin(detailedTeam);
    } catch (error) {
      console.error('Failed to create team:', error);
      toast?.error('Failed to create team');
    }
  };

  const handleJoinTeam = async (inviteCode: string) => {
    const joinedTeam = await teamsApi.joinTeam(inviteCode);
    setTeams([...teams, joinedTeam]);
    toast?.success('Joined team successfully!');
  };

  const handleDeleteTeam = async () => {
    try {
      if (!selectedTeam) return;
      setLoading(true);

      await teamsApi.deleteTeam(selectedTeam.id);
      toast.success('Team deleted');

      const updatedTeams = teams.filter((team) => team.id !== selectedTeam.id);
      setTeams(updatedTeams);

      setSelectedTeam(updatedTeams[0] || null);
      setShowAdminPanel(false);
    } catch (error) {
      console.error('Failed to delete team:', error);
      toast.error('Failed to delete team.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTeam = async (team: Team) => {
    try {
      setLoading(true);
      const detailedTeam = await teamsApi.getTeamWithMembers(team.id);
      setSelectedTeam(detailedTeam);
      checkIfUserIsAdmin(detailedTeam);
    } catch (error) {
      console.error('Failed to fetch team details', error);
      toast?.error('Failed to load team details');
      setSelectedTeam(team);
    } finally {
      setLoading(false);
    }
  };

  const handleTeamUpdate = (updatedTeam: Team) => {
    setTeams(
      teams.map((team) => (team.id === updatedTeam.id ? updatedTeam : team))
    );

    setSelectedTeam(updatedTeam);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-violet-600">
      <main className="container mx-auto px-4 py-8">
        <div className="flex">
          {/* Sidebar with teams */}
          <div className="w-48 mr-8">
            <button
              onClick={() => setShowLeaderboardModal(true)}
              className="w-full mb-4 rounded-xl px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white font-semibold shadow-md transition duration-300 ease-in-out transform hover:scale-105"
            >
              Teams Leaderboard
            </button>
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
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">
                      {selectedTeam.name}
                    </h2>
                    {isAdmin && (
                      <div className=" md: grid-cols-2 space-y-2 ">
                        <button
                          onClick={() => setShowAdminPanel(true)}
                          className="rounded-xl px-10 py-2 bg-violet-400 hover:bg-violet-500 text-white font-semibold shadow-ld transition duration-300 ease-in-out transform hover:scale-105"
                        >
                          Manage Team
                        </button>

                        <button
                          onClick={() => {
                            setShowTeamLeaderboardModal(true);
                          }}
                          className="rounded-xl px-10 py-2 mx-2 bg-violet-400 hover:bg-violet-500 text-white font-semibold shadow-ld transition duration-300 ease-in-out transform hover:scale-105"
                        >
                          Leaderboard
                        </button>
                      </div>
                    )}
                  </div>

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
                          router.push(`/board?teamId=${selectedTeam.id}`);
                        }}
                        className="rounded-xl px-10 py-2 my-2 bg-violet-400 hover:bg-violet-500 text-white font-semibold shadow-ld transition duration-300 ease-in-out transform hover:scale-105"
                      >
                        Go to board
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

      {showAdminPanel && selectedTeam && (
        <TeamAdminPanel
          team={{ ...selectedTeam, members: selectedTeam?.members || [] }}
          onClose={() => setShowAdminPanel(false)}
          onTeamUpdate={handleTeamUpdate}
          onTeamDelete={handleDeleteTeam}
        />
      )}

      {showLeaderboardModal && (
        <LeaderboardModal
          onClose={() => setShowLeaderboardModal(false)}
          userTeams={teams}
        />
      )}
      {showTeamLeaderboardModal && (
        <TeamLeaderboardModal
          onClose={() => setShowTeamLeaderboardModal(false)}
          teamId={selectedTeam?.id || ''}
        />
      )}
    </div>
  );
}
