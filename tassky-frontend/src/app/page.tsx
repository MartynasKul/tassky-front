'use client';

import WaveDecoration from './components/ui/waves';
import { Button } from '@/app/components/ui/button';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center flex-col w-full h-full ">
      {/* Main content section */}
      {/* <main className="flex-grow px-4 py-8"> */}
      {/* Hero section with rounded corners matching your wireframe */}
      <div className="max-w-4xl w-full mx-auto bg-violet-50 rounded-[40px] overflow-hidden shadow-2xl">
        <div className="flex flex-col items-center justify-center p-10 py-16 relative">
          {/* Decorative wave lines on left side */}
          <div className="absolute left-6 top-0 bottom-0 flex flex-col justify-center space-y-8">
            <WaveDecoration side={'left'} />
          </div>

          {/* Decorative wave lines on right side */}
          <div className="absolute right-6 top-0 bottom-0 flex flex-col justify-center space-y-8">
            <WaveDecoration side={'right'} />
          </div>

          <h1 className="text-4xl font-bold mb-6 text-center text-black">
            Welcome to Tassky
          </h1>

          <p className="text-xl text-center font-medium text-wrap w-2xs text-gray-700 mb-10">
            Your ultimate task management solution. Organize, prioritize, and
            conquer your tasks with ease.
          </p>

          {/* Call to action button using shadcn Button component */}
          <Button
            variant="default"
            size="lg"
            onClick={() => router.push('/register')}
            className="rounded-full px-10 bg-violet-400 hover:bg-violet-500 text-white font-semibold shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            Get started
          </Button>
        </div>
      </div>
      {/* </main> */}
    </div>
  );
}
