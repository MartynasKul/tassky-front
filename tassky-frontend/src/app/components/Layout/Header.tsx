'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* LOGO */}
        <Link
          href="/"
          className="text-2xl font-bold text-blue-600 hover:text-blue-800 transition-colors"
        >
          Tassky
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6">
          <Link
            href="/explore"
            className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
          >
            Explore
          </Link>
          <Link
            href="/about"
            className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
          >
            About
          </Link>
          <Link
            href="/login"
            className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Sign Up
          </Link>
        </nav>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-700 focus:outline-none"
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white shadow-md md:hidden">
            <nav className="flex flex-col p-4 space-y-2">
              <Link
                href="/explore"
                className="text-gray-700 hover:bg-gray-100 p-2 rounded"
                onClick={() => setIsMenuOpen(false)}
              >
                Explore
              </Link>
              <Link
                href="/about"
                className="text-gray-700 hover:bg-gray-100 p-2 rounded"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/login"
                className="text-gray-700 hover:bg-gray-100 p-2 rounded"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign Up
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
