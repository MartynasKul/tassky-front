/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { usersApi } from '@/utils/api';
import { useState } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  xpPoints: number;
  level: number;
}

interface EditProfileModalProps {
  user: User;
  onClose: () => void;
  onUpdateSuccess: (updatedUser: User) => void;
}

export default function EditProfileModal({
  user,
  onClose,
  onUpdateSuccess,
}: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    username: user.username || '',
    email: user.email || '',
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      // Prepare data for API (only include fields that changed)
      const updateData: any = {};

      if (formData.username !== user.username) {
        updateData.username = formData.username;
      }

      if (formData.email !== user.email) {
        updateData.email = formData.email;
      }

      if (formData.firstName !== user.firstName) {
        updateData.firstName = formData.firstName || null;
      }

      if (formData.lastName !== user.lastName) {
        updateData.lastName = formData.lastName || null;
      }

      if (formData.password) {
        updateData.password = formData.password;
      }

      // Only make API call if there are changes
      if (Object.keys(updateData).length > 0) {
        const updatedUser = await usersApi.updateUserProfile(
          user.id,
          updateData
        );
        onUpdateSuccess(updatedUser);
      } else {
        onClose();
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);

      // Handle API errors
      if (error.response?.data?.message) {
        if (typeof error.response.data.message === 'string') {
          setErrors({ form: error.response.data.message });
        } else if (Array.isArray(error.response.data.message)) {
          // Handle validation errors from NestJS
          const newErrors: Record<string, string> = {};
          error.response.data.message.forEach((err: any) => {
            newErrors[err.property] =
              err.constraints[Object.keys(err.constraints)[0]];
          });
          setErrors(newErrors);
        }
      } else {
        setErrors({ form: 'An error occurred. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0  flex items-center justify-center z-50 p-4">
      <div
        className="absolute inset-0 bg-black opacity-50 -z-10"
        onClick={onClose}
      ></div>
      <div className="bg-white bg-gradient-to-b from-white to-violet-300 rounded-lg p-6 w-full max-w-md">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>

          {errors.form && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="username"
                className="block text-gray-700 font-medium mb-1"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`w-full p-2 border-b-4 rounded-xl bg-white transition duration-300 hover:scale-102 ${
                  errors.username ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.username && (
                <p className="mt-1 text-red-500 text-sm">{errors.username}</p>
              )}
            </div>

            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-gray-700 font-medium mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full p-2 border-b-4 rounded-xl bg-white transition duration-300 hover:scale-102 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-red-500 text-sm">{errors.email}</p>
              )}
            </div>

            <div className="mb-4">
              <label
                htmlFor="firstName"
                className="block text-gray-700 font-medium mb-1"
              >
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full p-2 border-b-4 rounded-xl bg-white transition duration-300 hover:scale-102"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="lastName"
                className="block text-gray-700 font-medium mb-1"
              >
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full p-2 border-b-4 rounded-xl bg-white transition duration-300 hover:scale-102"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-gray-700 font-medium mb-1"
              >
                New Password (leave blank to keep current)
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full p-2 border-b-4 rounded-xl bg-white transition duration-300 hover:scale-102 ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.password && (
                <p className="mt-1 text-red-500 text-sm">{errors.password}</p>
              )}
            </div>

            <div className="mb-6">
              <label
                htmlFor="confirmPassword"
                className="block text-gray-700 font-medium mb-1"
              >
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full p-2 border-b-4 rounded-xl bg-white transition duration-300 hover:scale-102 ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={!formData.password}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-red-500 text-sm">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-5 py-2 bg-red-300 hover:bg-red-500 text-white font-semibold shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl px-6 py-2 bg-violet-400 hover:bg-violet-500 text-white font-semibold shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
                disabled={isLoading}
              >
                {isLoading ? 'Updating...' : 'Update'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
