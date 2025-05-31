'use client';

import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { RegisterDto } from '@/types/auth';
import { api } from '@/utils/api';
import { AxiosError } from 'axios';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { FcGoogle } from 'react-icons/fc';

interface FieldErrors {
  username?: string;
  email?: string;
  password?: string;
}

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = React.useState<RegisterDto>({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [showSuccess, setShowSuccess] = React.useState<boolean>(false);

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'username':
        if (!value.trim()) return 'Username is required';
        if (value.length < 2) return 'Username must be at least 2 characters';
        if (value.length > 20) return 'Username must be at most 20 characters';
        if (!/^[a-zA-z0-9_-]+/.test(value))
          return 'Username can only contain letters, numbers, underscores, and hyphens';
        break;
      case 'email':
        if (!value.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Invalid email format';
        break;
      case 'password':
        if (!value.trim()) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
        }
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

    //clear errors on user typing
    if (fieldErrors[name as keyof FieldErrors]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
    // clear general error when user modifies form
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setShowSuccess(false);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post('auth/register', formData);

      if (response.status === 201) {
        //localStorage.setItem('access_token', response.data.token);
        setShowSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 2000); // Show success message for 2 seconds
      }
    } catch (e: unknown) {
      const error = e as AxiosError;
      if (error.response) {
        switch (error.response.status) {
          case 400:
            setError('Invalid registration details');
            break;
          case 409:
            // Handle conflicts based on the error message
            const errorMessage = error.response.data?.message || '';
            const conflictErrors: FieldErrors = {};
            let generalError = '';

            if (
              errorMessage.toLowerCase().includes('username') &&
              errorMessage.toLowerCase().includes('email')
            ) {
              // Both username and email conflict
              conflictErrors.username = 'This username is already taken';
              conflictErrors.email = 'This email is already registered';
              generalError =
                'Both username and email are already in use. Please try different ones.';
            } else if (errorMessage.toLowerCase().includes('username')) {
              // Username conflict only
              conflictErrors.username = 'This username is already taken';
              generalError =
                'Username is already in use. Please choose a different username.';
            } else if (errorMessage.toLowerCase().includes('email')) {
              // Email conflict only
              conflictErrors.email = 'This email is already registered';
              generalError =
                'Email is already registered. Please use a different email or try logging in.';
            } else {
              // Generic conflict message
              conflictErrors.username = 'This username may already be taken';
              conflictErrors.email = 'This email may already be registered';
              generalError =
                'An account with this email or username already exists.';
            }

            setFieldErrors(conflictErrors);
            setError(generalError);
            break;
          case 422:
            // Handle validation errors from server
            const validationErrors = error.response.data?.errors || {};
            const fieldValidationErrors: FieldErrors = {};

            if (validationErrors.username) {
              fieldValidationErrors.username = Array.isArray(
                validationErrors.username
              )
                ? validationErrors.username[0]
                : validationErrors.username;
            }
            if (validationErrors.email) {
              fieldValidationErrors.email = Array.isArray(
                validationErrors.email
              )
                ? validationErrors.email[0]
                : validationErrors.email;
            }
            if (validationErrors.password) {
              fieldValidationErrors.password = Array.isArray(
                validationErrors.password
              )
                ? validationErrors.password[0]
                : validationErrors.password;
            }

            if (Object.keys(fieldValidationErrors).length > 0) {
              setFieldErrors(fieldValidationErrors);
              setError('Please fix the validation errors below.');
            } else {
              setError('Please check that all fields meet the requirements.');
            }
            break;
          default:
            setError('Registration failed. Please try again later');
        }
        //console.error(error);
      } else {
        setError('Network error. Please check your connection.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrength = (
    password: string
  ): { strength: number; color: string; text: string } => {
    if (!password) return { strength: 0, color: 'bg-gray-200', text: '' };
    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 2)
      return { strength: score, color: 'bg-red-400', text: 'Weak' };
    if (score <= 3)
      return { strength: score, color: 'bg-yellow-400', text: 'Fair' };
    if (score <= 4)
      return { strength: score, color: 'bg-blue-400', text: 'Good' };
    return { strength: score, color: 'bg=green-400', text: 'Strong' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="max-w-md w-full bg-white rounded-[40px] overflow-hidden shadow-2xl">
        <div className="flex flex-col items-center justify-center p-10 py-12 relative">
          <h1 className="text-3xl font-bold mb-8 text-center text-black">
            Register
          </h1>

          {/* Success Message */}
          <div
            className={`w-full transition-all duration-500 ease-in-out overflow-hidden ${
              showSuccess
                ? 'max-h-20 mb-6 opacity-100 scale-100'
                : 'max-h-0 mb-0 opacity-0 scale-95'
            }`}
          >
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 transform transition-transform duration-300 ease-out">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 animate-bounce" />
              <p className="text-green-700 text-sm">
                Account created successfully! Redirecting to login...
              </p>
            </div>
          </div>

          {/* General Error Display */}
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
                className={`w-full rounded-lg border px-4 py-3 transition-all duration-300 ease-in-out transform ${
                  fieldErrors.username
                    ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200 shadow-sm shadow-red-100 scale-[1.01]'
                    : 'border-gray-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 hover:border-gray-400'
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
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full rounded-lg border px-4 py-3 transition-all duration-300 ease-in-out transform ${
                  fieldErrors.email
                    ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200 shadow-sm shadow-red-100 scale-[1.01]'
                    : 'border-gray-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 hover:border-gray-400'
                }`}
                required
              />
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  fieldErrors.email
                    ? 'max-h-10 mt-2 opacity-100'
                    : 'max-h-0 mt-0 opacity-0'
                }`}
              >
                <p className="text-sm text-red-600 flex items-center gap-1 animate-in slide-in-from-top-1">
                  <AlertCircle className="h-4 w-4 animate-pulse" />
                  {fieldErrors.email}
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
              {/* Password Strength Indicator */}
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  formData.password
                    ? 'max-h-8 mt-2 opacity-100'
                    : 'max-h-0 mt-0 opacity-0'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ease-out ${passwordStrength.color}`}
                      style={{
                        width: `${(passwordStrength.strength / 5) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 transition-colors duration-300">
                    {passwordStrength.text}
                  </span>
                </div>
              </div>

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
                disabled={isSubmitting || showSuccess}
                // disabled={true}
                className="rounded-full px-10 py-2 bg-violet-400 hover:bg-violet-500 disabled:bg-violet-300 disabled:cursor-not-allowed text-white font-semibold shadow-ld transition duration-300 ease-in-out transform hover:scale-105 disabled:hover:scale-100"
              >
                {isSubmitting
                  ? 'Creating Account...'
                  : showSuccess
                  ? 'Success!'
                  : 'Register'}
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting || showSuccess}
                // disabled={true}
                className="rounded-full px-5 py-2 border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700 font-semibold shadow-sm flex items-center justify-center gap-2 transition duration-200 ease-in-out hover:scale-105 disabled:hover:scale-100"
                //onClick={() => console.log('Google Sign In')}
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
              *Google sign-in temporarily disabled*
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
