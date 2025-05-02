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
    <div className=" bg-violet-600  py-4 text-center">
      <p className="font-semibold text-white">Tassky {year}</p>
    </div>
  );
}
