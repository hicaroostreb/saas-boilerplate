'use client';

import { routes } from '@lib/constants/routes';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
// ✅ IMPORT CORRETO: caminho relativo
import type { NavItem } from '../../../types/marketing.types';

interface NavigationMenuProps {
  items?: NavItem[];
  className?: string;
}

const defaultItems: NavItem[] = [
  {
    label: 'Product',
    children: [
      { label: 'Features', href: '/features' },
      { label: 'API', href: '/api' },
    ],
  },
  { label: 'Pricing', href: routes.marketing.pricing },
  { label: 'Blog', href: routes.marketing.blog },
];

export const NavigationMenu = ({
  items = defaultItems,
  className = '',
}: NavigationMenuProps) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <nav className={`flex items-center space-x-1 ${className}`}>
      {items.map(item => (
        <div key={item.label}>
          {item.children ? (
            <div className="relative">
              <button
                onClick={() =>
                  setOpenDropdown(
                    openDropdown === item.label ? null : item.label
                  )
                }
                className="flex items-center px-4 py-2 text-sm hover:bg-accent rounded-xl"
              >
                {item.label}
                <ChevronDown className="ml-1 size-3" />
              </button>

              {openDropdown === item.label && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-background border rounded-md shadow-lg">
                  {item.children.map(child => (
                    <Link
                      key={child.label}
                      href={child.href ?? '#'}
                      className="block px-4 py-2 text-sm hover:bg-accent"
                      onClick={() => setOpenDropdown(null)}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Link
              href={item.href ?? '#'}
              className="px-4 py-2 text-sm hover:bg-accent rounded-xl"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
};
