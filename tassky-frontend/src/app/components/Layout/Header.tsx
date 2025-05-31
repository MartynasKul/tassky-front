'use client';

import Pic from '@/app/components/Photos/TasskyTextLess.jpeg';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { isLoggedIn, logout } = useAuth();
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Close menu on escape key
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="bg-white border-gray-200 relative z-40">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center justify-between w-full">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Image
              className="rounded"
              src={Pic}
              width={50}
              height={50}
              alt="Tassky Logo"
            />
            <Link
              href={isLoggedIn ? '/dashboard' : '/'}
              className="text-3xl font-bold text-gray-800 hover:text-gray-600 transition-colors"
            >
              Tassky
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-2">
            {isLoggedIn ? (
              // Logged in navigation
              <>
                <Link
                  href="/dashboard"
                  className="rounded-full px-10 py-2 bg-violet-400 hover:bg-violet-500 text-white font-semibold shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
                >
                  Dashboard
                </Link>

                <Link
                  href="/about"
                  className="rounded-full px-10 py-2 bg-violet-400 hover:bg-violet-500 text-white font-semibold shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
                >
                  About
                </Link>
                <Link
                  href="/profile"
                  className="rounded-full px-10 py-2 bg-violet-400 hover:bg-violet-500 text-white font-semibold shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
                >
                  Profile
                </Link>
                <Link
                  onClick={() => {
                    logout();
                  }}
                  href="/"
                  className="rounded-full px-10 py-2 bg-violet-400 hover:bg-violet-500 text-white font-semibold shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
                >
                  Log Out
                </Link>
              </>
            ) : (
              // Guest navigation
              <>
                <Link
                  href="/about"
                  className="rounded-full px-10 py-2 bg-violet-400 hover:bg-violet-500 text-white font-semibold shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
                >
                  About
                </Link>
                <Link
                  href="/login"
                  className="rounded-full px-10 py-2 bg-violet-400 hover:bg-violet-500 text-white font-semibold shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
                >
                  Signin
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 focus:outline-none p-2 hover:bg-gray-100 rounded transition-all duration-300 ease-in-out relative z-50"
              ref={menuRef}
            >
              <div className="relative w-6 h-6 flex flex-col justify-center items-center">
                <span
                  className={`absolute w-5 h-0.5 bg-gray-700 transition-all duration-300 ease-in-out ${
                    isMenuOpen ? 'rotate-45 top-3' : 'top-1.5'
                  }`}
                />
                <span
                  className={`absolute w-5 h-0.5 bg-gray-700 transition-all duration-300 ease-in-out ${
                    isMenuOpen ? 'opacity-0' : 'opacity-100 top-3'
                  }`}
                />
                <span
                  className={`absolute w-5 h-0.5 bg-gray-700 transition-all duration-300 ease-in-out ${
                    isMenuOpen ? '-rotate-45 top-3' : 'top-4.5'
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Overlay - Fixed positioning */}
        <div
          className={`fixed top-20 right-4 w-64 transition-all duration-300 ease-in-out transform z-50 md:hidden ${
            isMenuOpen
              ? 'opacity-100 scale-100 translate-y-0'
              : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
          }`}
        >
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            <nav className="flex flex-col p-4 space-y-3">
              {isLoggedIn ? (
                // Mobile logged in navigation
                <>
                  <Link
                    href="/dashboard"
                    className={`rounded-full px-6 py-2 bg-violet-300 hover:bg-violet-400 text-white text-center font-semibold shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 ${
                      isMenuOpen
                        ? 'opacity-100 translate-x-0 delay-100'
                        : 'opacity-0 translate-x-4'
                    }`}
                    onClick={closeMenu}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/about"
                    className={`rounded-full px-6 py-2 bg-violet-300 hover:bg-violet-400 text-white text-center font-semibold shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 ${
                      isMenuOpen
                        ? 'opacity-100 translate-x-0 delay-150'
                        : 'opacity-0 translate-x-4'
                    }`}
                    onClick={closeMenu}
                  >
                    About
                  </Link>
                  <Link
                    href="/profile"
                    className={`rounded-full px-6 py-2 bg-violet-300 hover:bg-violet-400 text-white text-center font-semibold shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 ${
                      isMenuOpen
                        ? 'opacity-100 translate-x-0 delay-200'
                        : 'opacity-0 translate-x-4'
                    }`}
                    onClick={closeMenu}
                  >
                    Profile
                  </Link>
                  <Link
                    onClick={() => {
                      logout();
                      closeMenu();
                    }}
                    href="/"
                    className={`rounded-full px-6 py-2 bg-violet-400 hover:bg-violet-500 text-white text-center font-semibold shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 ${
                      isMenuOpen
                        ? 'opacity-100 translate-x-0 delay-300'
                        : 'opacity-0 translate-x-4'
                    }`}
                  >
                    Log Out
                  </Link>
                </>
              ) : (
                // Mobile guest navigation
                <>
                  <Link
                    href="/explore"
                    className={`rounded-full px-6 py-2 bg-violet-300 hover:bg-violet-400 text-white text-center font-semibold shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 ${
                      isMenuOpen
                        ? 'opacity-100 translate-x-0 delay-100'
                        : 'opacity-0 translate-x-4'
                    }`}
                    onClick={closeMenu}
                  >
                    Explore
                  </Link>
                  <Link
                    href="/about"
                    className={`rounded-full px-6 py-2 bg-violet-300 hover:bg-violet-400 text-white text-center font-semibold shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 ${
                      isMenuOpen
                        ? 'opacity-100 translate-x-0 delay-150'
                        : 'opacity-0 translate-x-4'
                    }`}
                    onClick={closeMenu}
                  >
                    About
                  </Link>
                  <Link
                    href="/login"
                    className={`rounded-full px-6 py-2 bg-violet-300 hover:bg-violet-400 text-white text-center font-semibold shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 ${
                      isMenuOpen
                        ? 'opacity-100 translate-x-0 delay-200'
                        : 'opacity-0 translate-x-4'
                    }`}
                    onClick={closeMenu}
                  >
                    Signin
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
