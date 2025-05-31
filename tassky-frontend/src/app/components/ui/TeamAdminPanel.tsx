import { teamsApi } from '@/utils/api';
import {
  User,
  Mail,
  Calendar,
  Shield,
  Crown,
  Users,
  X,
  RefreshCw,
  Save,
  Trash2,
} from 'lucide-react';
import Image from 'next/image';
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
  inviteCode: string;
  members: TeamMember[];
}

interface TeamAdminPanelProps {
  team: Team;
  onClose: () => void;
  onTeamUpdate: (updatedTeam: Team) => void;
  onTeamDelete: () => void;
}

export default function TeamAdminPanel({
  team,
  onClose,
  onTeamUpdate,
  onTeamDelete,
}: TeamAdminPanelProps) {
  const [teamData, setTeamData] = React.useState<Team>(team);
  const [nameInput, setNameInput] = React.useState<string>(team.name);
  const [descriptionInput, setDescriptionInput] = React.useState<string>(
    team.description || ''
  );
  const [loading, setLoading] = React.useState<boolean>(false);
  // Simple validation - just check if name is empty
  const isNameEmpty = !nameInput.trim();

  const refreshInviteCode = async () => {
    try {
      setLoading(true);
      const response = await teamsApi.refreshInviteCode(team.id);
      setTeamData({
        ...teamData,
        inviteCode: response.inviteCode,
      });
      toast.success('Invite code refreshed');
    } catch (error) {
      console.error('Failed to refresh invite code:', error);
      toast.error('Failed to refresh invite code');
    } finally {
      setLoading(false);
    }
  };

  const updateTeamInfo = async () => {
    // Simple check - if name is empty, show browser validation
    if (!nameInput.trim()) {
      toast.error('Team name cannot be empty');
      return;
    }

    try {
      setLoading(true);
      const updatedTeam = await teamsApi.updateTeam(team.id, {
        name: nameInput.trim(),
        description: descriptionInput.trim(),
      });
      setTeamData(updatedTeam);
      onTeamUpdate(updatedTeam);
      toast.success('Team information updated');
    } catch (error) {
      console.error('Failed to update team:', error);
      toast.error('Failed to update team information');
    } finally {
      setLoading(false);
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      setLoading(true);
      await teamsApi.removeMember(team.id, memberId);

      const updatedMembers = teamData.members.filter((m) => m.id !== memberId);
      const updatedTeam = { ...teamData, members: updatedMembers };
      setTeamData(updatedTeam);
      onTeamUpdate(updatedTeam);

      toast.success('Member removed successfully');
    } catch (error) {
      console.error('Failed to remove member:', error);
      toast.error('Failed to remove member');
    } finally {
      setLoading(false);
    }
  };

  const changeRole = async (
    memberId: string,
    newRole: 'ADMIN' | 'CAPTAIN' | 'MEMBER'
  ) => {
    try {
      setLoading(true);
      await teamsApi.changeRole(team.id, memberId, newRole);

      const updatedMembers = teamData.members.map((member) =>
        member.id === memberId ? { ...member, role: newRole } : member
      );

      const updatedTeam = { ...teamData, members: updatedMembers };
      setTeamData(updatedTeam);
      onTeamUpdate(updatedTeam);

      toast.success('Role updated successfully');
    } catch (error) {
      console.error('Failed to change role:', error);
      toast.error('Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameInput(e.target.value);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="h-4 w-4 text-red-500" />;
      case 'CAPTAIN':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      default:
        return <User className="h-4 w-4 text-blue-500" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'CAPTAIN':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-2 sm:p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Team Admin Panel
            </h2>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={onTeamDelete}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Delete Team</span>
                <span className="sm:hidden">Delete</span>
              </button>

              <button
                onClick={onClose}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl backdrop-blur-sm transition duration-300 ease-in-out transform hover:scale-105"
              >
                <X className="h-4 w-4" />
                Close
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-120px)] p-4 sm:p-6">
          {/* Team Information Section */}
          <div className="mb-8 bg-gradient-to-br from-violet-50 to-purple-50 p-4 sm:p-6 rounded-xl border border-violet-100">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-gray-800">
              <Users className="h-5 w-5 text-violet-600" />
              Team Information
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Name*
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={handleNameChange}
                  className="w-full p-3 border border-gray-300 rounded-xl bg-white transition duration-300 ease-in-out focus:border-violet-500 focus:ring-2 focus:ring-violet-200 focus:outline-none"
                  required
                  maxLength={50}
                  placeholder="Enter team name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={descriptionInput}
                  onChange={(e) => setDescriptionInput(e.target.value)}
                  className="w-full p-3 border bg-white border-gray-300 rounded-xl h-24 resize-none transition duration-300 ease-in-out focus:border-violet-500 focus:ring-2 focus:ring-violet-200 focus:outline-none"
                  maxLength={500}
                  placeholder="Describe your team..."
                />
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {descriptionInput.length}/500 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invite Code
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={teamData.inviteCode}
                    readOnly
                    className="flex-1 p-3 border border-gray-300 rounded-xl bg-gray-50 font-mono text-center sm:text-left"
                  />
                  <button
                    onClick={refreshInviteCode}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-violet-500 hover:bg-violet-600 disabled:bg-violet-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg transition duration-300 ease-in-out transform hover:scale-105 disabled:hover:scale-100"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                    />
                    {loading ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={updateTeamInfo}
                  disabled={loading || isNameEmpty}
                  className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-xl shadow-lg transition duration-300 ease-in-out transform ${
                    loading || isNameEmpty
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-violet-500 hover:bg-violet-600 text-white hover:scale-105'
                  }`}
                >
                  <Save className="h-4 w-4" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>

          {/* Team Members Section */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-xl border border-blue-100">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-gray-800">
              <Users className="h-5 w-5 text-blue-600" />
              Team Members ({teamData.members.length})
            </h3>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-4 px-6 border-b text-left font-semibold text-gray-700">
                      User
                    </th>
                    <th className="py-4 px-6 border-b text-left font-semibold text-gray-700">
                      Email
                    </th>
                    <th className="py-4 px-6 border-b text-left font-semibold text-gray-700">
                      Role
                    </th>
                    <th className="py-4 px-6 border-b text-left font-semibold text-gray-700">
                      Joined
                    </th>
                    <th className="py-4 px-6 border-b text-left font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {teamData.members.map((member, index) => (
                    <tr
                      key={member.id}
                      className={`hover:bg-gray-50 transition duration-200 ${
                        index !== teamData.members.length - 1 ? 'border-b' : ''
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-violet-200 flex items-center justify-center mr-3 overflow-hidden">
                            {member.user?.avatarUrl ? (
                              <Image
                                src={member.user.avatarUrl}
                                alt={member.user.username}
                                width={40}
                                height={40}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <span className="font-semibold text-violet-700">
                                {member.user?.username.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {member.user?.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {member.user?.email}
                      </td>
                      <td className="py-4 px-6">
                        <select
                          value={member.role}
                          onChange={(e) =>
                            changeRole(
                              member.user.id,
                              e.target.value as 'ADMIN' | 'CAPTAIN' | 'MEMBER'
                            )
                          }
                          className="p-2 border border-gray-300 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-200 focus:outline-none"
                          disabled={loading}
                        >
                          <option value="ADMIN">Admin</option>
                          <option value="CAPTAIN">Captain</option>
                          <option value="MEMBER">Member</option>
                        </select>
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {new Date(member.joinedAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => removeMember(member.user.id)}
                          disabled={loading}
                          className="font-semibold text-red-500 hover:text-red-700 disabled:text-red-300 disabled:cursor-not-allowed transition duration-300 ease-in-out transform hover:scale-105 disabled:hover:scale-100"
                        >
                          {loading ? 'Removing...' : 'Remove'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {teamData.members.map((member) => (
                <div
                  key={member.id}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
                >
                  {/* Member Header */}
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-violet-200 flex items-center justify-center mr-4 overflow-hidden">
                      {member.user?.avatarUrl ? (
                        <Image
                          src={member.user.avatarUrl}
                          alt={member.user.username}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <span className="font-semibold text-violet-700 text-lg">
                          {member.user?.username.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">
                        {member.user?.username}
                      </h4>
                      <div
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(
                          member.role
                        )}`}
                      >
                        {getRoleIcon(member.role)}
                        {member.role}
                      </div>
                    </div>
                  </div>

                  {/* Member Details */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{member.user?.email}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Role Selector */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Role
                      </label>
                      <select
                        value={member.role}
                        onChange={(e) =>
                          changeRole(
                            member.user.id,
                            e.target.value as 'ADMIN' | 'CAPTAIN' | 'MEMBER'
                          )
                        }
                        className="w-full p-2 border border-gray-300 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-200 focus:outline-none text-sm"
                        disabled={loading}
                      >
                        <option value="ADMIN">Admin</option>
                        <option value="CAPTAIN">Captain</option>
                        <option value="MEMBER">Member</option>
                      </select>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeMember(member.user.id)}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 disabled:text-red-300 disabled:cursor-not-allowed font-semibold rounded-lg transition duration-300 ease-in-out transform hover:scale-[1.02] disabled:hover:scale-100 border border-red-200"
                    >
                      <Trash2 className="h-4 w-4" />
                      {loading ? 'Removing...' : 'Remove Member'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
