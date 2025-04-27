'use client';

import { TaskType } from '@/app/board/page';
import { tasksApi } from '@/utils/api';
import Image from 'next/image';
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface User {
  id: string;
  username: string;
  avatarUrl?: string;
  totalXp?: number;
  totalTasks?: number;
}

interface UserLeaderboardModalProps {
  onClose: () => void;
  teamId: string;
}

export default function TeamLeaderboardModal({
  onClose,
  teamId,
}: UserLeaderboardModalProps) {
  const [activeTab, setActiveTab] = React.useState<'xp' | 'tasks'>('xp');
  const [loading, setLoading] = React.useState(true);
  const [users, setUsers] = React.useState<User[]>([]);
  const [tasks, setTasks] = React.useState<TaskType[]>([]);

  React.useEffect(() => {
    async function fetchTasks() {
      setLoading(true);
      const tasks = await tasksApi.getTasksByStatus('COMPLETED', teamId);
      if (tasks) {
        setTasks(tasks);
      }
      setLoading(false);
    }

    fetchTasks();
  }, [teamId]);

  // Calculate user stats from tasks
  React.useEffect(() => {
    // Extract unique users from tasks
    const userMap = new Map<string, User>();

    tasks.forEach((task) => {
      if (task.assignedToId && task.assignedTo) {
        if (!userMap.has(task.assignedToId)) {
          userMap.set(task.assignedToId, {
            id: task.assignedToId,
            username: task.assignedTo.username,
            avatarUrl: task.assignedTo.avatarUrl,
            totalXp: 0,
            totalTasks: 0,
          });
        }

        const user = userMap.get(task.assignedToId)!;

        // Calculate XP based on task priority and status
        let xpValue = 0;
        if (task.status === 'COMPLETED') {
          switch (task.priority) {
            case 'LOW':
              xpValue = 10;
              break;
            case 'MEDIUM':
              xpValue = 20;
              break;
            case 'HIGH':
              xpValue = 30;
              break;
            case 'URGENT':
              xpValue = 50;
              break;
            default:
              xpValue = 10;
          }

          user.totalXp! += xpValue;
          user.totalTasks! += 1;
        }
      }
    });

    // Convert map to array and sort by XP (descending)
    setUsers(
      Array.from(userMap.values()).sort(
        (a, b) => (b.totalXp || 0) - (a.totalXp || 0)
      )
    );
    setLoading(false);
  }, [tasks]);

  // Prepare data for bar chart
  const prepareBarChartData = () => {
    return users
      .slice(0, 10) // Limit to top 10 users for better visualization
      .map((user) => ({
        name: user.username,
        [activeTab === 'xp' ? 'XP' : 'Tasks']:
          activeTab === 'xp' ? user.totalXp : user.totalTasks,
      }));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black opacity-50 -z-10"
        onClick={onClose}
      ></div>
      <div className="bg-white rounded-lg w-4/5 max-w-5xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-violet-800">
            User Leaderboard
          </h2>
          <button
            onClick={onClose}
            className="rounded-xl px-10 py-2 mx-2 bg-violet-400 hover:bg-violet-500 text-white font-semibold shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            Close
          </button>
        </div>

        {/* Tabs */}
        <div className="flex mb-6">
          <button
            className={`px-4 py-2 ${
              activeTab === 'xp'
                ? 'bg-violet-600 text-white'
                : 'bg-gray-200 text-gray-800'
            } rounded-l-lg transition-colors`}
            onClick={() => setActiveTab('xp')}
          >
            XP Performance
          </button>
          <button
            className={`px-4 py-2 ${
              activeTab === 'tasks'
                ? 'bg-violet-600 text-white'
                : 'bg-gray-200 text-gray-800'
            } rounded-r-lg transition-colors`}
            onClick={() => setActiveTab('tasks')}
          >
            Tasks Completed
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-80">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Bar Chart Overview */}
            {users.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-3">
                  Performance Overview
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={prepareBarChartData()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={70}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey={activeTab === 'xp' ? 'XP' : 'Tasks'}
                        fill="#8884d8"
                        animationDuration={1500}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {users.length > 10 && (
                  <p className="text-sm text-gray-500 text-center mt-2">
                    * Showing top 10 users only
                  </p>
                )}
              </div>
            )}

            {/* User Rankings List */}
            <div>
              <h3 className="text-xl font-semibold mb-3">Current Rankings</h3>
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {activeTab === 'xp' ? 'Total XP' : 'Tasks Completed'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progress
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users
                      .sort((a, b) =>
                        activeTab === 'xp'
                          ? (b.totalXp || 0) - (a.totalXp || 0)
                          : (b.totalTasks || 0) - (a.totalTasks || 0)
                      )
                      .map((user, index) => (
                        <tr
                          key={user.id}
                          className={
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                {user.avatarUrl ? (
                                  <Image
                                    className="h-10 w-10 rounded-full"
                                    src={user.avatarUrl}
                                    alt={user.username}
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-violet-300 flex items-center justify-center text-white">
                                    {user.username.charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.username}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {activeTab === 'xp'
                              ? `${user.totalXp} XP`
                              : `${user.totalTasks} Tasks`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className="bg-violet-600 h-2.5 rounded-full"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    (((activeTab === 'xp'
                                      ? user.totalXp
                                      : user.totalTasks) || 0) /
                                      (activeTab === 'xp'
                                        ? users[0]?.totalXp || 100
                                        : users[0]?.totalTasks || 10)) *
                                      100
                                  )}%`,
                                }}
                              ></div>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary & Insights */}
            <div>
              <h3 className="text-xl font-semibold mb-3">Insights</h3>
              <div className="bg-violet-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  {users.length > 0 ? (
                    <>
                      The top performer is{' '}
                      <span className="font-bold">{users[0]?.username}</span>{' '}
                      with{' '}
                      {activeTab === 'xp'
                        ? `${users[0]?.totalXp} XP`
                        : `${users[0]?.totalTasks} completed tasks`}
                      .
                      {users.length > 1 && (
                        <>
                          {' '}
                          The runner-up{' '}
                          <span className="font-bold">
                            {users[1]?.username}
                          </span>{' '}
                          is{' '}
                          {Math.round(
                            ((activeTab === 'xp'
                              ? // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
                                users[0]?.totalXp! - users[1]?.totalXp!
                              : // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
                                users[0]?.totalTasks! - users[1]?.totalTasks!) /
                              (activeTab === 'xp'
                                ? // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
                                  users[0]?.totalXp!
                                : // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
                                  users[0]?.totalTasks!)) *
                              100
                          )}
                          % behind.
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      No users have completed any tasks yet. Start assigning and
                      completing tasks to see the leaderboard in action!
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
