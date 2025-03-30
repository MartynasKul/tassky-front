import { cn } from '@/lib/utils';
import React from 'react';

interface WaveDecorationProps extends React.HTMLAttributes<HTMLDivElement> {
  side: 'left' | 'right';
  count?: number;
}

export default function WaveDecoration({
  side,
  count = 6,
  className,
  ...props
}: WaveDecorationProps) {
  return (
    <div
      className={cn(
        'absolute top-0 bottom-0 flex flex-col justify-center space-y-8',
        side === 'left' ? 'left-6' : 'right-6',
        className
      )}
      {...props}
    >
      {Array.from({ length: count }).map((_, i) => (
        <svg
          key={i}
          width="80"
          height="24"
          viewBox="0 0 80 24"
          className="text-gray-500"
        >
          <path
            d="M0 12 Q20 5, 40 12 Q60 20, 80 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      ))}
    </div>
  );
}
