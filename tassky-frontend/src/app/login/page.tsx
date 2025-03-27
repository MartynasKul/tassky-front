'use client';

import { LoginDto } from '@/types/auth';
// import { apiLocal } from '@/utils/api';
import { api } from '@/utils/api';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginDto>({
    username: '',
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
      const response = await api.post('auth/login', formData);
      // const response = await apiLocal.post('auth/login', formData);

      // Successful login
      if (response.status === 200) {
        // Store token in client-side storage
        console.log(response.data);
        localStorage.setItem('access_token', response.data);

        // Redirect to dashboard or home
        router.push('/');
      }
    } catch (err: unknown) {
      const error = err as AxiosError;
      if (error.response) {
        // Handle specific error responses
        switch (error.response.status) {
          case 401:
            setError('Invalid email or password');
            break;
          case 403:
            setError('Account locked. Please contact support.');
            break;
          default:
            setError('Login failed. Please try again.');
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
          Login
        </h1>
        {error && <p className="text-red-600 italic">{error}</p>}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center justify-center p-5"
        >
          <input
            type="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username"
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
            Login
          </button>
        </form>
      </view>
    </div>
  );
}
