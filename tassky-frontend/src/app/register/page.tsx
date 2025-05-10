'use client';

import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { RegisterDto } from '@/types/auth';
import { api } from '@/utils/api';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import React from 'react';
import { FcGoogle } from 'react-icons/fc';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = React.useState<RegisterDto>({
    username: '',
    email: '',
    password: '',
  });
  const [, setError] = React.useState<string | null>(null);

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

      if (response.status === 201) {
        localStorage.setItem('access_token', response.data.token);

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

        console.error(error);
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
            Register
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
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
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
                type="button"
                variant="default"
                className="rounded-full px-10 py-2 bg-violet-400 hover:bg-violet-500 text-white font-semibold shadow-ld transition duration-300 ease-in-out transform hover:scale-105"
              >
                Register
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
            Already have an account?{' '}
            <button
              onClick={() => router.push('/login')}
              className="text-violet-500 hover:text-violet-600 font-medium underline hover:scale-105"
            >
              Log in
            </button>
            <div className="font-semibold underline">
              *Registration temporarily disabled*
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
