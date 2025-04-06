'use client';

import { useRouter, usePathname } from 'next/navigation';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (token: string, user: string) => void;
  logout: () => void;
  checkAuthStatus: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Protected routes configuration
  const protectedRoutes = ['/profile', '/dashboard', '/tasks', '/kanbanBoard'];
  const publicOnlyRoutes = ['/login', '/register', '/forgotPassword'];

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Route protection logic
  useEffect(() => {
    if (!isLoading) {
      // If user is not logged in and trying to access protected route
      if (
        !isLoggedIn &&
        protectedRoutes.some((route) => pathname.startsWith(route))
      ) {
        router.push('/');
      }

      // If user is logged in and trying to access public-only routes
      if (isLoggedIn && publicOnlyRoutes.includes(pathname)) {
        router.push('/dashboard');
      }
    }
  }, [pathname, isLoggedIn, isLoading, router]);

  const checkAuthStatus = () => {
    setIsLoading(true);
    try {
      // Check if window is available (for Next.js)
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token');
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
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
