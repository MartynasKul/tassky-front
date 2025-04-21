'use client';

import { api } from '@/utils/api';
import { jwtDecode } from 'jwt-decode';
import { useRouter, usePathname } from 'next/navigation';
import React from 'react';

interface DecodedToken {
  exp: number;
  [key: string]: unknown;
}

interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (token: string, user: string) => void;
  logout: () => void;
  checkAuthStatus: () => void;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Route protection For loggedIn/ not loggedIn
  const protectedRoutes = [
    '/profile',
    '/dashboard',
    '/tasks',
    '/board',
    '/Board',
    '/achievements',
  ];
  const publicOnlyRoutes = ['/login', '/register', '/forgotPassword'];

  React.useEffect(() => {
    checkAuthStatus();
  }, []);

  React.useEffect(() => {
    if (!isLoading) {
      if (
        !isLoggedIn &&
        protectedRoutes.some((route) => pathname.startsWith(route))
      ) {
        router.push('/');
      }

      if (isLoggedIn && publicOnlyRoutes.includes(pathname)) {
        router.push('/dashboard');
      }
    }
  }, [pathname, isLoggedIn, isLoading, router]);

  async function tryRefreshToken() {
    try {
      const res = await api.post('/auth/refresh');

      /*  const res = await fetch('/api/auth/refresh',{
        method: POST,
        headers: {
          'Auhtorization': `Bearer ${localStorage.getItem('access_token')}`;
        },
        });*/

      if (!res) throw new Error('Refresh failed');

      const data = await res.data;

      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return true;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  }
  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token');

        if (token) {
          const decoded: DecodedToken = jwtDecode(token);
          const currentTime = Math.floor(Date.now() / 1000);

          if (decoded.exp && decoded.exp > currentTime) {
            setIsLoggedIn(true);
          } else {
            const refreshed = await tryRefreshToken();

            logout();
            setIsLoggedIn(refreshed);
          }
        }
        setIsLoggedIn(!!token);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (token: string, user: string) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('user', JSON.stringify(user)); // Store user data if needed
    setIsLoggedIn(true);
    router.push('/dashboard'); // Redirect to dashboard
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user'); // Clear user data if needed
    setIsLoggedIn(false);
    router.push('/');
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, isLoading, login, logout, checkAuthStatus }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
