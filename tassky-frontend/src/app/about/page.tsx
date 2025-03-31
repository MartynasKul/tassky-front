'use client';

import React from 'react';

export default function About() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-4">
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-md w-full">
        <h1 className="text-black bg-violet-100 rounded-4xl text-center text-2xl font-bold mb-4 shadow-xl">
          About Us
        </h1>
        <p className="text-gray-700 mb-4">
          Welcome to Tassky. We are dedicated to providing the best project
          management experience for our users. Our team is committed to
          continuous improvement and innovation. We believe in the power of
          collaboration and strive to create a platform that meets the needs of
          our users.
        </p>
        <h2 className="text-black bg-violet-100 text-center rounded-4xl text-xl font-semibold mb-4 shadow-xl">
          Our Mission
        </h2>
        <p className="text-gray-700 mb-4">
          Our mission is to empower users with the tools they need to succeed.
          We strive to create a user-friendly platform that meets the needs of
          our diverse user base. We believe in transparency, integrity, and
          collaboration.
        </p>
        <h2 className="text-black bg-violet-100 text-center rounded-4xl text-xl font-semibold mb-4 shadow-xl">
          Contact Us
        </h2>
        <p className="text-gray-700 mb-4">
          If you have any questions, suggestions, or feedback, please hesitate
          to contact us at martiss200@gmail.com
        </p>
      </div>
    </div>
  );
}
