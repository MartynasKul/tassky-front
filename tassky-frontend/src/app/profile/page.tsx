'use client';

import EditProfileModal from '../components/ui/EditProfileModal';
import { usersApi } from '@/utils/api';
import { useRouter } from 'next/navigation';
import React from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  xpPoints: number;
  level: number;
  streakDays?: number;
}

export default function ProfilePage() {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    async function loadUser() {
      try {
        setIsLoading(true);
        const userData = await usersApi.getCurrentUser();

        if (!userData) {
          router.push('/login');
          return;
        }

        setUser(userData);
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, [router]);

  const handleUpdateSuccess = (updatedUser: User) => {
    setUser(updatedUser);
    setIsModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl">User not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Profile</h1>

      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-semibold">Information about user</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="rounded-full px-10 py-2 bg-violet-400 hover:bg-violet-500 text-white font-semibold shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            Edit profile
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-gray-600 mb-1">Username</p>
            <p className="text-lg font-medium">{user.username}</p>
          </div>

          <div>
            <p className="text-gray-600 mb-1">Email</p>
            <p className="text-lg font-medium">{user.email}</p>
          </div>

          <div>
            <p className="text-gray-600 mb-1">First Name</p>
            <p className="text-lg font-medium">{user.firstName || 'Not set'}</p>
          </div>

          <div>
            <p className="text-gray-600 mb-1">Last Name</p>
            <p className="text-lg font-medium">{user.lastName || 'Not set'}</p>
          </div>

          <div>
            <p className="text-gray-600 mb-1">Level</p>
            <p className="text-lg font-medium">{user.level}</p>
          </div>

          <div>
            <p className="text-gray-600 mb-1">XP Points</p>
            <p className="text-lg font-medium">{user.xpPoints}</p>
          </div>

          {user.streakDays !== undefined && (
            <div>
              <p className="text-gray-600 mb-1">Streak Days</p>
              <p className="text-lg font-medium">{user.streakDays}</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <EditProfileModal
          user={user}
          onClose={() => setIsModalOpen(false)}
          onUpdateSuccess={handleUpdateSuccess}
        />
      )}
    </div>
  );
}
