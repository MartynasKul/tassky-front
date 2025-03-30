'use client';

import React from 'react';

export default function Footer() {
  const [year, setYear] = React.useState(new Date().getFullYear());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setYear(new Date().getFullYear());
    }, 1000);

    return () => clearInterval(interval);
  }, []);
  return (
    <div className=" bg-violet-50 border-t border-gray-200 py-4 text-center">
      <p className="font-semibold text-gray-600">Tassky &copy;{year}</p>
    </div>
  );
}
