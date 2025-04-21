import { teamsApi } from '@/utils/api';
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
    try {
      setLoading(true);
      const updatedTeam = await teamsApi.updateTeam(team.id, {
        name: nameInput,
        description: descriptionInput,
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

  return (
    <div className=" absolute inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 -z-10 bg-black opacity-50"
        onClick={onClose}
      ></div>
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-gradient-to-b from-white to-violet-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Team Admin Panel</h2>
          <div className="flex justify-center items-center mx-4">
            <button
              onClick={onTeamDelete}
              className="rounded-xl px-5 py-2 bg-red-300 hover:bg-red-500 text-white font-semibold shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
            >
              Delete Team
            </button>
            <button
              onClick={onClose}
              className="rounded-xl px-10 py-2 mx-2 bg-violet-400 hover:bg-violet-500 text-white font-semibold shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
            >
              Close
            </button>
          </div>
        </div>

        {/* Team Information Section */}
        <div className="mb-8 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Team Information</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Team Name
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-xl  bg-white transition duration-300 ease-in-out hover:scale-101"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={descriptionInput}
                onChange={(e) => setDescriptionInput(e.target.value)}
                className="w-full p-2 border bg-white border-gray-300 rounded-xl h-24 transition duration-300 ease-in-out hover:scale-101"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invite Code
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={teamData.inviteCode}
                  readOnly
                  className="w-full p-2 border border-gray-300 rounded-xl  bg-white transition duration-300 ease-in-out hover:scale-101"
                />
                <button
                  onClick={refreshInviteCode}
                  disabled={loading}
                  className="rounded-xl ml-2 px-4 py-2 bg-violet-400 hover:bg-violet-500 text-white font-semibold shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
                >
                  Refresh
                </button>
              </div>
            </div>
            <div className="text-right">
              <button
                onClick={updateTeamInfo}
                disabled={loading}
                className="rounded-xl px-4 py-2 bg-violet-400 hover:bg-violet-500 text-white font-semibold shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* Team Members Section */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-4">Team Members</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b text-left">User</th>
                  <th className="py-2 px-4 border-b text-left">Email</th>
                  <th className="py-2 px-4 border-b text-left">Role</th>
                  <th className="py-2 px-4 border-b text-left">Joined</th>
                  <th className="py-2 px-4 border-b text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teamData.members.map((member) => (
                  <tr
                    key={member.id}
                    className="hover:bg-gray-100 transition duration-300 ease-in-out transform "
                  >
                    <td className="py-2 px-4 border-b">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-violet-200 flex items-center justify-center mr-2">
                          {member.user?.avatarUrl ? (
                            <Image
                              src={member.user.avatarUrl}
                              alt={member.user.username}
                              width={32}
                              height={32}
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <span>
                              {member.user?.username.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <span>{member.user?.username}</span>
                      </div>
                    </td>
                    <td className="py-2 px-4 border-b">{member.user?.email}</td>
                    <td className="py-2 px-4 border-b">
                      <select
                        value={member.role}
                        onChange={(e) =>
                          changeRole(
                            member.user.id,
                            e.target.value as 'ADMIN' | 'CAPTAIN' | 'MEMBER'
                          )
                        }
                        className="p-1 border border-gray-300 rounded"
                        disabled={loading}
                      >
                        <option value="ADMIN">Admin</option>
                        <option value="CAPTAIN">Captain</option>
                        <option value="MEMBER">Member</option>
                      </select>
                    </td>
                    <td className="py-2 px-4 border-b">
                      {new Date(member.joinedAt).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-4 border-b">
                      <button
                        onClick={() => removeMember(member.user.id)}
                        disabled={loading}
                        className="font-bold text-red-500 hover:text-red-700 transition duration-300 ease-in-out transform hover:scale-105"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
