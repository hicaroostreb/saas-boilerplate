'use client';

import Link from 'next/link';

interface LogoProps {
  href?: string;
  className?: string;
  showText?: boolean;
  text?: string;
}

export const Logo = ({
  href = '/',
  className = '',
  showText = true,
  text = 'Acme',
}: LogoProps) => {
  return (
    <Link href={href} className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center space-x-2">
        <div className="flex size-9 items-center justify-center p-1">
          <div className="flex size-7 items-center justify-center rounded-md border text-primary-foreground bg-primary">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g>
                <path
                  d="M7.81815 8.36373L12 0L24 24H15.2809L7.81815 8.36373Z"
                  fill="currentColor"
                />
                <path
                  d="M4.32142 15.3572L8.44635 24H-1.14809e-06L4.32142 15.3572Z"
                  fill="currentColor"
                />
              </g>
            </svg>
          </div>
        </div>
        {showText && <span className="font-bold">{text}</span>}
      </div>
    </Link>
  );
};
