import { tasksApi } from '@/utils/api';
import {
  format,
  endOfWeek,
  parseISO,
  isWithinInterval,
  isAfter,
  eachWeekOfInterval,
} from 'date-fns';
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

interface Task {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  deadline: string;
  startedAt?: string;
  completedAt?: string;
  xpRewarded: number;
  teamId: string;
  assignedToId: string;
  assignedTo: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  team: {
    id: string;
    name: string;
  };
}

interface Team {
  id: string;
  name: string;
  totalXp?: number;
  totalTasks?: number;
  weeklyProgress?: { week: string; xp: number; tasks: number }[];
}

interface WeekData {
  weekLabel: string;
  startDate: Date;
  endDate: Date;
  teams: {
    [teamId: string]: {
      xp: number;
      tasks: number;
      name: string;
    };
  };
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
  const [weeksMap, setWeeksMap] = React.useState<WeekData[]>([]);

  // Fetch tasks data for all teams
  React.useEffect(() => {
    const fetchTasksData = async () => {
      setLoading(true);
      try {
        const allTasksPromises = userTeams.map((team) =>
          tasksApi.getTasksByTeam(team.id)
        );

        const allTeamTasks = await Promise.all(allTasksPromises);
        const allTasks = allTeamTasks.flat();

        // Filter to only completed tasks
        const completedTasks = allTasks.filter(
          (task) => task.status === 'COMPLETED' && task.completedAt
        );

        // Process tasks into weekly data
        processWeeklyData(completedTasks);
      } catch (error) {
        console.error('Failed to fetch tasks data', error);
      } finally {
        setLoading(false);
      }
    };

    if (userTeams.length > 0) {
      fetchTasksData();
    }
  }, [userTeams]);

  // Process task data into weekly buckets
  const processWeeklyData = (tasks: Task[]) => {
    if (tasks.length === 0) {
      setWeeklyData([]);
      setWeeksMap([]);
      return;
    }

    // Find the date range for all completed tasks
    const completionDates = tasks
      .filter((task) => task.completedAt)
      .map((task) => parseISO(task.completedAt!));

    if (completionDates.length === 0) {
      setWeeklyData([]);
      setWeeksMap([]);
      return;
    }

    const earliestDate = new Date(
      Math.min(...completionDates.map((date) => date.getTime()))
    );
    const latestDate = new Date(
      Math.max(...completionDates.map((date) => date.getTime()))
    );

    // Make sure the range includes the current week
    const today = new Date();
    const adjustedLatestDate = isAfter(today, latestDate) ? today : latestDate;

    // Get all weeks in the range
    const weekStarts = eachWeekOfInterval(
      { start: earliestDate, end: adjustedLatestDate },
      { weekStartsOn: 1 } // Monday as week start
    );

    // Create weekly data structure
    const weeks: WeekData[] = weekStarts.map((weekStart) => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      return {
        weekLabel: `${format(weekStart, 'MMM d')} - ${format(
          weekEnd,
          'MMM d, yyyy'
        )}`,
        startDate: weekStart,
        endDate: weekEnd,
        teams: {},
      };
    });

    // Initialize team data for each week
    weeks.forEach((week) => {
      userTeams.forEach((team) => {
        week.teams[team.id] = {
          xp: 0,
          tasks: 0,
          name: team.name,
        };
      });
    });

    // Assign tasks to weeks
    tasks.forEach((task) => {
      if (!task.completedAt) return;

      const completionDate = parseISO(task.completedAt);

      // Find which week this task belongs to
      const weekIndex = weeks.findIndex((week) =>
        isWithinInterval(completionDate, {
          start: week.startDate,
          end: week.endDate,
        })
      );

      if (weekIndex >= 0) {
        const week = weeks[weekIndex];
        if (week.teams[task.teamId]) {
          week.teams[task.teamId].xp += task.xpRewarded || 0;
          week.teams[task.teamId].tasks += 1;
        }
      }
    });

    // Sort weeks chronologically (oldest to newest)
    weeks.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    // Save the weeks map for reference
    setWeeksMap(weeks);

    // Transform data for Recharts
    const chartsData = weeks.map((week) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const weekData: any = {
        name: format(week.startDate, 'MMM d'),
      };

      Object.entries(week.teams).forEach(([, teamData]) => {
        weekData[`${teamData.name} XP`] = teamData.xp;
        weekData[`${teamData.name} Tasks`] = teamData.tasks;
      });

      return weekData;
    });

    setWeeklyData(chartsData);
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

  // Calculate top performing team for insights
  const getTopPerformingTeam = () => {
    if (activeTab === 'xp') {
      return userTeams.reduce((prev, current) =>
        (prev.totalXp || 0) > (current.totalXp || 0) ? prev : current
      ).name;
    } else {
      return userTeams.reduce((prev, current) =>
        (prev.totalTasks || 0) > (current.totalTasks || 0) ? prev : current
      ).name;
    }
  };

  // Calculate most improved team based on weekly progress
  const getMostImprovedTeam = () => {
    if (weeklyData.length < 2) return null;

    const improvements: { [key: string]: number } = {};

    userTeams.forEach((team) => {
      // Get the first and last week's values
      const firstWeekData = weeklyData[0];
      const lastWeekData = weeklyData[weeklyData.length - 1];

      const firstValue =
        firstWeekData[`${team.name} ${activeTab === 'xp' ? 'XP' : 'Tasks'}`] ||
        0;
      const lastValue =
        lastWeekData[`${team.name} ${activeTab === 'xp' ? 'XP' : 'Tasks'}`] ||
        0;

      improvements[team.name] = lastValue - firstValue;
    });

    // Find the team with the biggest improvement
    let mostImproved = '';
    let highestImprovement = -Infinity;

    Object.entries(improvements).forEach(([teamName, improvement]) => {
      if (improvement > highestImprovement) {
        mostImproved = teamName;
        highestImprovement = improvement;
      }
    });

    return mostImproved;
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
              <h3 className="text-xl font-semibold mb-3">Weekly Progress</h3>
              {weeklyData.length > 0 ? (
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
              ) : (
                <div className="bg-violet-50 p-6 rounded-lg text-center h-80 flex items-center justify-center">
                  <p className="text-gray-700">
                    No completed tasks data available for weekly progress yet.
                  </p>
                </div>
              )}
            </div>

            {/* Insights Section */}
            <div>
              <h3 className="text-xl font-semibold mb-3">Insights</h3>
              <div className="bg-violet-50 p-4 rounded-lg">
                {userTeams.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      <span className="font-bold">Top Performer:</span> The team
                      with the highest{' '}
                      {activeTab === 'xp' ? 'XP' : 'completed tasks'} is{' '}
                      <span className="font-bold">
                        {getTopPerformingTeam()}
                      </span>
                      .
                    </p>

                    {getMostImprovedTeam() && (
                      <p className="text-gray-700">
                        <span className="font-bold">Most Improved:</span>{' '}
                        {getMostImprovedTeam()} has shown the most improvement
                        in{' '}
                        {activeTab === 'xp' ? 'XP gained' : 'task completion'}{' '}
                        over time.
                      </p>
                    )}

                    {weeksMap.length > 0 && (
                      <p className="text-gray-700">
                        <span className="font-bold">Latest Activity:</span> In
                        the week of{' '}
                        {format(
                          weeksMap[weeksMap.length - 1].startDate,
                          'MMM d'
                        )}
                        , teams completed a total of{' '}
                        {Object.values(
                          weeksMap[weeksMap.length - 1].teams
                        ).reduce((sum, team) => sum + team.tasks, 0)}{' '}
                        tasks and earned{' '}
                        {Object.values(
                          weeksMap[weeksMap.length - 1].teams
                        ).reduce((sum, team) => sum + team.xp, 0)}{' '}
                        XP.
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-700">
                    No team data available for insights.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
