'use client';

import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { LoginDto } from '@/types/auth';
import { api } from '@/utils/api';
import { AxiosError } from 'axios';
import { AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { FcGoogle } from 'react-icons/fc';

interface FieldErrors {
  username?: string;
  password?: string;
}

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = React.useState<LoginDto>({
    username: '',
    password: '',
  });
  const { login } = useAuth();
  const [error, setError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'username':
        if (!value.trim()) return 'Username is required';
        if (value.length < 2) return 'Username must be at least 2 characters';
        break;
      case 'password':
        if (!value.trim()) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        break;
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const errors: FieldErrors = {};
    let isValid = true;

    Object.entries(formData).forEach(([key, value]) => {
      const error = validateField(key, value);
      if (error) {
        errors[key as keyof FieldErrors] = error;
        isValid = false;
      }
    });

    setFieldErrors(errors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    //clears errors on user typing
    if (fieldErrors[name as keyof FieldErrors]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }

    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

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
            setFieldErrors({
              username: 'Check your username',
              password: 'Check your password',
            });
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="max-w-md w-full bg-white rounded-[40px] overflow-hidden shadow-2xl">
        <div className="flex flex-col items-center justify-center p-10 py-12 relative">
          <h1 className="text-3xl font-bold mb-8 text-center text-black">
            Login
          </h1>

          {/*Generic error display*/}
          <div
            className={`w-full transition-all duration-300 ease-in-out overflow-hidden ${
              error ? 'max-h-20 mb-6 opacity-100' : 'max-h-0 mb-0 opacity-0'
            }`}
          >
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 transform transition-transform duration-300 ease-out">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 animate-pulse" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-6">
            <div>
              <Input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                className={` w-full rounded-lg border px-4 py-3 transition-colors  ${
                  fieldErrors.username
                    ? `border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200`
                    : `border-gray-300 focus:border-violet-500 focus:ring-violet-200`
                }`}
                required
              />
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  fieldErrors.username
                    ? 'max-h-10 mt-2 opacity-100'
                    : 'max-h-0 mt-0 opacity-0'
                }`}
              >
                <p className="text-sm text-red-600 flex items-center gap-1 animate-in slide-in-from-top-1">
                  <AlertCircle className="h-4 w-4 animate-pulse" />
                  {fieldErrors.username}
                </p>
              </div>
            </div>

            <div>
              <Input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full rounded-lg border px-4 py-3 transition-all duration-300 ease-in-out transform ${
                  fieldErrors.password
                    ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200 shadow-sm shadow-red-100 scale-[1.01]'
                    : 'border-gray-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 hover:border-gray-400'
                }`}
                required
              />
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  fieldErrors.password
                    ? 'max-h-10 mt-2 opacity-100'
                    : 'max-h-0 mt-0 opacity-0'
                }`}
              >
                <p className="text-sm text-red-600 flex items-center gap-1 animate-in slide-in-from-top-1">
                  <AlertCircle className="h-4 w-4 animate-pulse" />
                  {fieldErrors.password}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
              <Button
                type="submit"
                variant="default"
                disabled={isSubmitting}
                className="rounded-full px-10 py-2 bg-violet-400 hover:bg-violet-500 disabled:bg-violet-300 disabled:cursor-not-allowed text-white font-semibold shadow-ld transition duration-300 ease-in-out transform hover:scale-105 disabled:hover:scale-100"
              >
                {isSubmitting ? 'Logging in...' : 'Log In'}
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                className="rounded-full px-5 py-2 border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700 font-semibold shadow-sm flex items-center justify-center gap-2 transition duration-200 ease-in-out hover:scale-105 disabled:hover:scale-100"
                //onClick={() => console.log('Google Sign In')}
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
          </div>
        </div>
      </div>
    </div>
  );
}
