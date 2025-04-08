import axios from 'axios';

export const apiLocal = axios.create({
  baseURL: 'http://localhost:4200/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = axios.create({
  baseURL: 'https://tassky-back.vercel.app/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  // console.log('Sending request with token:', token); // Debugging log
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const teamsApi = {
  getTeams: async (page = 1, limit = 10) => {
    const response = await api.get(`/teams?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get a specific team
  getTeam: async (id: string) => {
    const response = await api.get(`/teams/${id}`);
    return response.data;
  },

  // Create a new team
  createTeam: async (teamData: { name: string; description?: string }) => {
    const response = await api.post('/teams', teamData);
    return response.data;
  },

  // Join a team with invite code
  joinTeam: async (inviteCode: string) => {
    const response = await api.post('/teams/join', { inviteCode });
    return response.data;
  },

  // Update team details
  updateTeam: async (
    id: string,
    teamData: { name?: string; description?: string }
  ) => {
    const response = await api.patch(`/teams/${id}`, teamData);
    return response.data;
  },

  getTeamWithMembers: async (id: string) => {
    const response = await api.get(`/teams/${id}`);
    return response.data;
  },

  // Delete a team
  deleteTeam: async (id: string) => {
    await api.delete(`/teams/${id}`);
    return true;
  },

  // Remove a team member
  removeMember: async (teamId: string, memberId: string) => {
    const response = await api.delete(`/teams/${teamId}/members/${memberId}`);
    return response.status === 204;
  },

  // Change a member's role
  // changeRole: async (teamId: string, memberId: string, role: string) => {
  //   const response = await api.patch(
  //     `/teams/${teamId}/members/${memberId}/role`,
  //     { role }
  //   );
  //   return response.data;
  // },
  // Update this function in api.ts
  changeRole: async (teamId: string, memberId: string, role: string) => {
    // Get the current user ID from localStorage or another source
    const userString = localStorage.getItem('user');
    let userId;

    if (userString) {
      const user = JSON.parse(userString);
      userId = user.id; // Assuming the user object has an 'id' property
    } else {
      console.error('User ID not found in localStorage');
      return null; // Handle the case where user ID is not found
    }

    const response = await api.patch(
      `/teams/${teamId}/members/${memberId}/role`,
      {
        role,
        userId, // Explicitly send the user ID
      }
    );
    return response.data;
  },

  // Invite a member to the team
  inviteMember: async (
    teamId: string,
    inviteData: { userId?: string; email?: string }
  ) => {
    const response = await api.post(`/teams/${teamId}/invite`, inviteData);
    return response.data;
  },

  // Refresh team invite code
  refreshInviteCode: async (teamId: string) => {
    const response = await api.post(`/teams/${teamId}/refresh-invite`);
    return response.data;
  },

  // // Get current user information
  // getCurrentUser: async () => {
  //   const response = await api.get('/users/me');
  //   return response.data;
  // },
};

export default api;
