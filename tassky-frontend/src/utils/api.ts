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

  getTeam: async (id: string) => {
    const response = await api.get(`/teams/${id}`);
    return response.data;
  },

  createTeam: async (teamData: { name: string; description?: string }) => {
    const response = await api.post('/teams', teamData);
    return response.data;
  },

  joinTeam: async (inviteCode: string) => {
    const response = await api.post('/teams/join', { inviteCode });
    return response.data;
  },

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

  deleteTeam: async (id: string) => {
    await api.delete(`/teams/${id}`);
    return true;
  },

  removeMember: async (teamId: string, memberId: string) => {
    const response = await api.delete(`/teams/${teamId}/members/${memberId}`);
    return response.status === 204;
  },

  changeRole: async (teamId: string, memberId: string, role: string) => {
    const userString = localStorage.getItem('user');
    let userId;

    if (userString) {
      const user = JSON.parse(userString);
      userId = user.id;
    } else {
      console.error('User ID not found in localStorage');
      return null;
    }

    const response = await api.patch(
      `/teams/${teamId}/members/${memberId}/role`,
      {
        role,
        userId,
      }
    );
    return response.data;
  },

  inviteMember: async (
    teamId: string,
    inviteData: { userId?: string; email?: string }
  ) => {
    const response = await api.post(`/teams/${teamId}/invite`, inviteData);
    return response.data;
  },

  refreshInviteCode: async (teamId: string) => {
    const response = await api.post(`/teams/${teamId}/refresh-invite`);
    return response.data;
  },
};

export const tasksApi = {
  // Get all tasks with optional filtering
  getTasks: async (filter = {}, page = 1, limit = 10) => {
    const queryParams = new URLSearchParams();

    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());

    Object.entries(filter).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString());
    });

    const response = await api.get(`/tasks?${queryParams.toString()}`);
    return response.data;
  },

  getTasksByTeam: async (teamId: string) => {
    const response = await api.get(`/tasks/team/${teamId}`);
    return response.data;
  },

  getTasksByStatus: async (status: string, teamId?: string) => {
    const url = teamId
      ? `/tasks/status/${status}?teamId=${teamId}`
      : `/tasks/status/${status}`;
    const response = await api.get(url);
    return response.data;
  },

  createTask: async (taskData: {
    title: string;
    description?: string;
    teamId: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    assignedToId?: string;
    deadline?: Date;
  }) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  updateTask: async (id: string, taskData: unknown) => {
    const response = await api.patch(`/tasks/${id}`, taskData);
    return response.data;
  },

  updateTaskStatus: async (id: string, status: string) => {
    const response = await api.patch(`/tasks/${id}/status`, { status });
    return response.data;
  },

  assignTask: async (id: string, userId: string) => {
    const response = await api.post(`/tasks/${id}/assign`, { userId });
    return response.data;
  },

  unassignTask: async (id: string) => {
    const response = await api.post(`/tasks/${id}/unassign`);
    return response.data;
  },

  deleteTask: async (id: string) => {
    await api.delete(`/tasks/${id}`);
    return true;
  },

  getTaskComments: async (id: string) => {
    const response = await api.get(`/tasks/${id}/comments`);
    return response.data;
  },

  addTaskComment: async (id: string, content: string) => {
    const response = await api.post(`/tasks/${id}/comments`, { content });
    return response.data;
  },
};

export const usersApi = {
  getCurrentUser: async () => {
    const userString = localStorage.getItem('user');
    if (!userString) {
      return null;
    }
    const user = JSON.parse(userString);
    return user;
  },

  getUserProfile: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  updateUserProfile: async (
    id: string,
    userData: {
      email?: string;
      username?: string;
      password?: string;
      firstName?: string;
      lastName?: string;
      avatarUrl?: string;
    }
  ) => {
    const response = await api.patch(`/users/${id}`, userData);

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const updatedUser = { ...currentUser, ...response.data };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return response.data;
  },

  getUserAchievements: async (id: string) => {
    const response = await api.get(`/users/${id}/achievements`);
    return response.data;
  },

  getUserTeams: async (id: string) => {
    const response = await api.get(`/users/${id}/teams`);
    return response.data;
  },

  getUserTasks: async (id: string) => {
    const response = await api.get(`/users/${id}/tasks`);
    return response.data;
  },
};

export const commentsApi = {
  getTaskComments: async (taskId: string) => {
    const response = await api.get(`/comments?taskId=${taskId}`);
    return response.data;
  },

  addComment: async (content: string, taskId: string) => {
    const response = await api.post('/comments', {
      content,
      taskId,
    });
    return response.data;
  },

  deleteComment: async (commentId: string) => {
    await api.delete(`/comments/${commentId}`);
    return true;
  },

  updateComment: async (commentId: string, content: string) => {
    const response = await api.patch(`/comments/${commentId}`, { content });
    return response.data;
  },

  getUserComments: async () => {
    const response = await api.get('comments/me');
    return response.data;
  },
};

export default api;
