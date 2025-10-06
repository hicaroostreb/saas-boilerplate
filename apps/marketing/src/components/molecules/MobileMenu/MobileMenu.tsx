'use client';

import Link from 'next/link';
import { useState } from 'react';
// ✅ USAR import local ao invés do workspace
import { routes } from '@lib/constants/routes';

interface MobileMenuProps {
  className?: string;
}

export const MobileMenu = ({ className = '' }: MobileMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`lg:hidden ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-sm transition-colors hover:bg-accent hover:text-accent-foreground size-9 flex rounded-full"
      >
        ☰
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-background border-t shadow-lg">
          <div className="container py-4">
            <nav className="flex flex-col space-y-2">
              <Link
                href={routes.marketing.pricing}
                className="px-4 py-2 text-sm hover:bg-accent rounded-md"
                onClick={() => setIsOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href={routes.marketing.blog}
                className="px-4 py-2 text-sm hover:bg-accent rounded-md"
                onClick={() => setIsOpen(false)}
              >
                Blog
              </Link>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};
