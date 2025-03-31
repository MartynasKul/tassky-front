'use client';

import Pic from '@/app/components/Photos/TasskyTextLess.jpeg';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white border-gray-200">
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
              href="/"
              className="text-3xl font-bold text-gray-800 hover:text-gray-600 transition-colors"
            >
              Tassky
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-2">
            <Link
              href="/explore"
              // className="px-4 py-2 rounded-md border-2 border-gray-800 text-gray-800 font-medium hover:bg-gray-100 transition-colors"
              className="rounded-full px-10 py-2 bg-violet-400 hover:bg-violet-500 text-white font-semibold shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
            >
              Explore
            </Link>
            <Link
              href="/about"
              // className="px-4 py-2 rounded-md border-2 border-gray-800 text-gray-800 font-medium hover:bg-gray-100 transition-colors"
              className="rounded-full px-10 py-2 bg-violet-400 hover:bg-violet-500 text-white font-semibold shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
            >
              About
            </Link>
            <Link
              href="/register"
              // className="px-4 py-2 rounded-md border-2 border-gray-800 text-gray-800 font-medium hover:bg-gray-100 transition-colors"
              className="rounded-full px-10 py-2 bg-violet-400 hover:bg-violet-500 text-white font-semibold shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
            >
              Signin
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
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="mt-2 md:hidden">
            <nav className="flex flex-col p-2 space-y-2">
              <Link
                href="/explore"
                // className="px-4 py-2 rounded-md border-2 border-gray-800 text-gray-800 text-center font-medium hover:bg-gray-100 transition-colors"
                className="rounded-full px-10 py-2 bg-violet-300 hover:bg-violet-400 text-white text-center font-semibold shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
                onClick={() => setIsMenuOpen(false)}
              >
                Explore
              </Link>
              <Link
                href="/about"
                // className="px-4 py-2 rounded-md border-2 border-gray-800 text-gray-800 text-center font-medium hover:bg-gray-100 transition-colors"
                className="rounded-full px-10 py-2 bg-violet-300 hover:bg-violet-400 text-white text-center font-semibold shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/register"
                // className="px-4 py-2 rounded-md border-2 border-gray-800 text-gray-800 text-center font-medium hover:bg-gray-100 transition-colors"
                className="rounded-full px-10 py-2 bg-violet-300 hover:bg-violet-400 text-white text-center font-semibold shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
                onClick={() => setIsMenuOpen(false)}
              >
                Signin
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
