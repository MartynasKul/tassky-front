'use client';

import { RegisterDto } from '@/types/auth';
// import { apiLocal } from '@/utils/api';
import { api } from '@/utils/api';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterDto>({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await api.post('auth/register', formData);
      // const response = await apiLocal.post('auth/register', formData);

      // Successful registration
      if (response.status === 201) {
        localStorage.setItem('access_token', response.data.token);

        // Redirect to login
        router.push('/login');
      }
    } catch (e: unknown) {
      const error = e as AxiosError;
      if (error.response) {
        switch (error.response.status) {
          case 400:
            setError('Invalid registration details');
            break;
          case 409:
            setError('User with email or username already exists');
            break;
          default:
            setError('Registration failed. Please try again later');
        }
      } else {
        setError('Network error. Please check your connection.');
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      <view className="bg-blue-800 justify-center shadow-xl p-4 rounded-lg ">
        <h1 className="font-bold text-2xl justify-center items-center">
          {/* {' '} */}
          Register
        </h1>
        {error && <p className="text-red-600 italic">{error}</p>}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center justify-center p-5"
        >
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username"
            required
            className="border border-blue-300 p-2 rounded mb-2 bg-white text-black"
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            required
            className="border border-blue-300 p-2 rounded mb-2 bg-white text-black"
          />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            required
            className="border border-blue-300 p-2 rounded mb-2 bg-white text-black"
          />
          <button
            type="submit"
            className="bg-blue-400 rounded-2xl p-3 text-white hover:bg-blue-500 font-bold shadow-2xl"
          >
            Register
          </button>
        </form>
      </view>
    </div>
  );
}
