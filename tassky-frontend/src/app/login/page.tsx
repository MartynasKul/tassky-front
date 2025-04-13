'use client';

import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { LoginDto } from '@/types/auth';
// import { apiLocal } from '@/utils/api';
import { api } from '@/utils/api';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginDto>({
    username: '',
    password: '',
  });

  const { login } = useAuth();
  const [, setError] = useState<string | null>(null);

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
      if (response.status === 200) {
        login(response.data.access_token, response.data.user);
      }
    } catch (err: unknown) {
      const error = err as AxiosError;
      if (error.response) {
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
    <div className="flex items-center justify-center w-full h-full">
      <div className="max-w-md w-full bg-white rounded-[40px] overflow-hidden shadow-2xl">
        <div className="flex flex-col items-center justify-center p-10 py-12 relative">
          <h1 className="text-3xl font-bold mb-8 text-center text-black">
            Login
          </h1>

          <form onSubmit={handleSubmit} className="w-full space-y-6">
            <div>
              <Input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
                required
              />
            </div>

            <div>
              <Input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
              <Button
                type="submit"
                variant="default"
                className="rounded-full px-10 py-2 bg-violet-400 hover:bg-violet-500 text-white font-semibold shadow-ld transition duration-300 ease-in-out transform hover:scale-105"
              >
                Log In
              </Button>

              <Button
                type="button"
                variant="outline"
                className="rounded-full px-5 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold shadow-sm flex items-center justify-center gap-2 transition duration-200 ease-in-out hover:scale-105"
                onClick={() => console.log('Google Sign In')}
              >
                <FcGoogle className="text-xl" />
                Sign in with Google
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Dont have an account?{' '}
            <button
              onClick={() => router.push('/register')}
              className="text-violet-500 hover:text-violet-600 font-medium underline hover:scale-105"
            >
              Register
            </button>
            <div className="font-semibold underline">
              *Sign in with Google temporarily disabled*
            </div>
            <div className="absolute p-2 rounded-2xl b-4 left-0 right-0 text-center">
              demo creds: demo | demo1234
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
