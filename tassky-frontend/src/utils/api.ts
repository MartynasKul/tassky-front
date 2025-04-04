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
  console.log('Sending request with token:', token); // Debugging log
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

  // Delete a team
  deleteTeam: async (id: string) => {
    await api.delete(`/teams/${id}`);
    return true;
  },
};

export default api;
