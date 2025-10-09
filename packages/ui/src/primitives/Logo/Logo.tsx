'use client';

import Link from 'next/link';
import { cn } from '../../utils/cn';

export interface LogoProps {
  href?: string;
  text?: string;
  showText?: boolean;
  className?: string;
}

export function Logo({
  href = '/',
  text = 'Acme',
  showText = false,
  className,
}: LogoProps) {
  const logoContent = (
    <div className={cn('flex items-center space-x-2', className)}>
      <div className="h-6 w-6 rounded bg-primary">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-6 w-6 text-primary-foreground"
        >
          <path
            d="M12 2L2 7V17L12 22L22 17V7L12 2Z"
            fill="currentColor"
            fillOpacity="0.5"
          />
          <path d="M12 2L22 7L12 12L2 7L12 2Z" fill="currentColor" />
        </svg>
      </div>
      {showText && (
        <span className="font-bold text-xl text-foreground">{text}</span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="transition-opacity hover:opacity-75">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}
