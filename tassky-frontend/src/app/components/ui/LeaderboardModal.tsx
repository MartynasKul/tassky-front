// import { teamsApi } from '@/utils/api';
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts';

interface Team {
  id: string;
  name: string;
  totalXp?: number;
  totalTasks?: number;
  weeklyProgress?: { week: string; xp: number; tasks: number }[];
}

interface LeaderboardModalProps {
  onClose: () => void;
  userTeams: Team[];
}

export default function LeaderboardModal({
  onClose,
  userTeams,
}: LeaderboardModalProps) {
  const [activeTab, setActiveTab] = React.useState<'xp' | 'tasks'>('xp');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [weeklyData, setWeeklyData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  //Simulated fetch of weekly data
  React.useEffect(() => {
    const fetchWeeklyData = async () => {
      setLoading(true);
      try {
        // "Getting" mock data and setting that data
        const simulatedData = generateWeeklyData(userTeams);
        setWeeklyData(simulatedData);
      } catch (error) {
        console.error('Failed to fetch weekly data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyData();
  }, [userTeams]);

  // Generating example weekly data, will add real values at a later date
  const generateWeeklyData = (teams: Team[]) => {
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];

    return weeks.map((week) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const weekData: any = { name: week };

      teams.forEach((team) => {
        // Generate random values between 50-200 for XP and 5-20 for tasks
        weekData[`${team.name} XP`] = Math.floor(Math.random() * 150) + 50;
        weekData[`${team.name} Tasks`] = Math.floor(Math.random() * 15) + 5;
      });

      return weekData;
    });
  };

  // Prepare data for the bar chart
  const prepareBarChartData = () => {
    return userTeams.map((team) => ({
      name: team.name,
      xp: team.totalXp || 0,
      tasks: team.totalTasks || 0,
    }));
  };

  // Get color for each team (to keep consistent colors across charts)
  const getTeamColor = (index: number) => {
    const colors = [
      '#8884d8',
      '#82ca9d',
      '#ffc658',
      '#ff8042',
      '#0088fe',
      '#00C49F',
    ];
    return colors[index % colors.length];
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
            Team Leaderboard
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
            {/* Current Standing */}
            <div>
              <h3 className="text-xl font-semibold mb-3">Current Standing</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={prepareBarChartData()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey={activeTab === 'xp' ? 'xp' : 'tasks'}
                      name={activeTab === 'xp' ? 'Total XP' : 'Total Tasks'}
                      fill="#8884d8"
                      animationDuration={1500}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Weekly Progress */}
            <div>
              <h3 className="text-xl font-semibold mb-3">
                Weekly Progress *WIP*
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={weeklyData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {userTeams.map((team, index) => (
                      <Line
                        key={team.id}
                        type="monotone"
                        dataKey={`${team.name} ${
                          activeTab === 'xp' ? 'XP' : 'Tasks'
                        }`}
                        stroke={getTeamColor(index)}
                        activeDot={{ r: 8 }}
                        animationDuration={1500}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Insights Section */}
            <div>
              <h3 className="text-xl font-semibold mb-3">Insights</h3>
              <div className="bg-violet-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  {activeTab === 'xp' ? (
                    <>
                      The team with the highest XP is{' '}
                      <span className="font-bold">
                        {
                          userTeams.reduce((prev, current) =>
                            (prev.totalXp || 0) > (current.totalXp || 0)
                              ? prev
                              : current
                          ).name
                        }
                      </span>
                      . Keep encouraging your teams to complete tasks to earn
                      more XP!
                    </>
                  ) : (
                    <>
                      The team with the most completed tasks is{' '}
                      <span className="font-bold">
                        {
                          userTeams.reduce((prev, current) =>
                            (prev.totalTasks || 0) > (current.totalTasks || 0)
                              ? prev
                              : current
                          ).name
                        }
                      </span>
                      . Consider challenging your lower-performing teams to
                      increase their task completion rate.
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
