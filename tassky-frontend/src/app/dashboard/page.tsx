'use client';

import LeaderboardModal from '../components/ui/LeaderboardModal';
import TeamLeaderboardModal from '../components/ui/TeamLeaderboardModal';
import CreateTeamModal from '@/app/components/ui/CreateTeamModal';
import JoinTeamModal from '@/app/components/ui/JoinTeamModal';
import TeamAdminPanel from '@/app/components/ui/TeamAdminPanel';
import TeamButton from '@/app/components/ui/TeamButton';
import { teamsApi } from '@/utils/api';
import { Menu, X, Users, Plus, UserPlus, Trophy } from 'lucide-react';
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

  // Mobile sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = React.useState<boolean>(false);
  const sidebarRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close sidebar when clicking outside (mobile)
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setIsSidebarOpen(false);
      }
    };

    if (isSidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarOpen]);

  // Close sidebar when team is selected (mobile)
  const handleSelectTeamMobile = async (team: Team) => {
    await handleSelectTeam(team);
    setIsSidebarOpen(false);
  };

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
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between mb-6 bg-white rounded-lg shadow-md p-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="h-6 w-6 text-gray-700" />
          </button>

          <h1 className="text-xl font-bold">My Dashboard</h1>

          <div className="flex space-x-1">
            <button
              onClick={() => setShowJoinTeamModal(true)}
              className="p-2 bg-violet-400 hover:bg-violet-500 text-white rounded-lg transition-colors"
              title="Join Team"
            >
              <UserPlus className="h-5 w-5" />
            </button>
            <button
              onClick={() => setShowCreateTeamModal(true)}
              className="p-2 bg-violet-400 hover:bg-violet-500 text-white rounded-lg transition-colors"
              title="Create Team"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex relative">
          {/* Mobile Sidebar Overlay */}
          {isSidebarOpen && (
            <div className="fixed inset-0 bg-black/20 z-40 md:hidden backdrop-blur-sm" />
          )}

          {/* Sidebar */}
          <div
            ref={sidebarRef}
            className={`
              fixed md:relative top-0 left-0 h-full md:h-auto
              w-72 md:w-48 mr-0 md:mr-8 
              bg-white/90 md:bg-transparent backdrop-blur-md md:backdrop-blur-none
              shadow-xl md:shadow-none rounded-r-2xl md:rounded-none
              border-r border-white/20 md:border-none
              z-50 md:z-auto
              transform transition-all duration-300 ease-in-out
              ${
                isSidebarOpen
                  ? 'translate-x-0'
                  : '-translate-x-full md:translate-x-0'
              }
              p-4 md:p-0
            `}
          >
            {/* Mobile Close Button */}
            <div className="md:hidden flex justify-between items-center mb-4 pb-4 border-b">
              <h2 className="font-semibold text-gray-800">Teams</h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Teams Leaderboard Button */}
            <button
              onClick={() => {
                setShowLeaderboardModal(true);
                setIsSidebarOpen(false);
              }}
              className="w-full mb-4 rounded-xl px-4 py-3 bg-violet-500 hover:bg-violet-600 text-white font-semibold shadow-md transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Teams Leaderboard</span>
              <span className="sm:hidden">Leaderboard</span>
            </button>

            {/* Teams List */}
            <div className="mb-4 flex flex-col space-y-3 max-h-[60vh] md:max-h-[80vh] overflow-y-auto pr-2">
              {loading ? (
                <div className="text-gray-500 text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-500 mx-auto mb-2"></div>
                  Loading teams...
                </div>
              ) : teams.length > 0 ? (
                teams.map((team) => (
                  <TeamButton
                    key={team.id}
                    team={team}
                    isSelected={selectedTeam?.id === team.id}
                    onClick={() => handleSelectTeamMobile(team)}
                  />
                ))
              ) : (
                <div className="text-gray-500 text-center py-8">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p>No teams yet</p>
                  <p className="text-sm">
                    Create or join a team to get started
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 max-w-none md:max-w-5xl">
            {/* Desktop Header */}
            <div className="hidden md:flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">My Dashboard</h1>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowJoinTeamModal(true)}
                  className="rounded-xl px-6 lg:px-10 py-2 bg-violet-400 hover:bg-violet-500 text-white font-semibold shadow-ld transition duration-300 ease-in-out transform hover:scale-105 flex items-center gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  <span className="hidden lg:inline">Join team</span>
                  <span className="lg:hidden">Join</span>
                </button>
                <button
                  onClick={() => setShowCreateTeamModal(true)}
                  className="rounded-xl px-6 lg:px-10 py-2 bg-violet-400 hover:bg-violet-500 text-white font-semibold shadow-ld transition duration-300 ease-in-out transform hover:scale-105 flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden lg:inline">Create team</span>
                  <span className="lg:hidden">Create</span>
                </button>
              </div>
            </div>

            {/* Team Content Card */}
            <div className="bg-white rounded-lg shadow-md p-3 sm:p-6 min-h-[400px] sm:min-h-[600px]">
              {selectedTeam ? (
                <div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
                    <h2 className="text-lg sm:text-xl font-semibold">
                      {selectedTeam.name}
                    </h2>
                    {isAdmin && (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => setShowAdminPanel(true)}
                          className="rounded-xl px-4 sm:px-8 py-2 bg-violet-400 hover:bg-violet-500 text-white font-semibold shadow-ld transition duration-300 ease-in-out transform hover:scale-105 text-sm"
                        >
                          Manage Team
                        </button>
                        <button
                          onClick={() => setShowTeamLeaderboardModal(true)}
                          className="rounded-xl px-4 sm:px-8 py-2 bg-violet-400 hover:bg-violet-500 text-white font-semibold shadow-ld transition duration-300 ease-in-out transform hover:scale-105 text-sm"
                        >
                          Leaderboard
                        </button>
                      </div>
                    )}
                  </div>

                  {selectedTeam.description && (
                    <p className="text-gray-600 mb-4 text-sm sm:text-base">
                      {selectedTeam.description}
                    </p>
                  )}

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                    <div className="bg-violet-100 p-3 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-600">
                        Total XP
                      </p>
                      <p className="text-lg sm:text-xl font-bold">
                        {selectedTeam.totalXp || 0}
                      </p>
                    </div>
                    <div className="bg-violet-100 p-3 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-600">Tasks</p>
                      <p className="text-lg sm:text-xl font-bold">
                        {selectedTeam.totalTasks || 0}
                      </p>
                    </div>
                    <div className="bg-violet-100 p-3 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-600">
                        Invite code
                      </p>
                      <p className="text-lg sm:text-xl font-bold break-all">
                        {selectedTeam.inviteCode}
                      </p>
                    </div>
                  </div>

                  {/* Go to Board Button */}
                  <div className="mb-6">
                    <button
                      onClick={() => {
                        router.push(`/board?teamId=${selectedTeam.id}`);
                      }}
                      className="w-full sm:w-auto rounded-xl px-6 sm:px-10 py-3 bg-violet-400 hover:bg-violet-500 text-white font-semibold shadow-ld transition duration-300 ease-in-out transform hover:scale-105"
                    >
                      Go to Board
                    </button>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-gray-500 text-sm sm:text-base">
                      Tasks will be displayed here in future updates.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg mb-2">
                    {teams.length > 0
                      ? 'Select a team to view its details'
                      : 'No teams yet'}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {teams.length === 0 &&
                      'Create or join a team to get started'}
                  </p>
                  {teams.length === 0 && (
                    <div className="mt-4 flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => setShowCreateTeamModal(true)}
                        className="px-6 py-2 bg-violet-400 hover:bg-violet-500 text-white rounded-lg transition-colors"
                      >
                        Create Team
                      </button>
                      <button
                        onClick={() => setShowJoinTeamModal(true)}
                        className="px-6 py-2 bg-violet-400 hover:bg-violet-500 text-white rounded-lg transition-colors"
                      >
                        Join Team
                      </button>
                    </div>
                  )}
                </div>
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
