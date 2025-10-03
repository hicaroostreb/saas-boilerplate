// packages/ui/src/components/dashboard/favorites-section.tsx

'use client';

import Link from 'next/link';
import { useState } from 'react';

interface Organization {
  id: string;
  name: string;
  slug: string;
}

interface FavoritesSectionProps {
  organization: Organization;
  collapsed: boolean;
}

// ✅ ENTERPRISE: Mock favorites data (seguindo o modelo)
const mockFavorites = [
  {
    id: '1',
    name: 'Emma Johnson',
    role: 'Designer',
    avatar: 'EJ',
    href: '/contacts/emma-johnson',
  },
  {
    id: '2',
    name: 'Liam Wilson',
    role: 'Developer',
    avatar: 'LW',
    href: '/contacts/liam-wilson',
  },
  {
    id: '3',
    name: 'Olivia Brown',
    role: 'Manager',
    avatar: 'OB',
    href: '/contacts/olivia-brown',
  },
  {
    id: '4',
    name: 'Noah Jones',
    role: 'Analyst',
    avatar: 'NJ',
    href: '/contacts/noah-jones',
  },
  {
    id: '5',
    name: 'Ava Davis',
    role: 'Coordinator',
    avatar: 'AD',
    href: '/contacts/ava-davis',
  },
];

export function FavoritesSection({
  organization,
  collapsed,
}: FavoritesSectionProps) {
  const [favoritesExpanded, setFavoritesExpanded] = useState(true);

  if (collapsed) {
    return null; // ✅ Hide favorites when sidebar is collapsed
  }

  return (
    <div className="relative flex w-full min-w-0 flex-col p-3 pt-0">
      {/* ✅ ENTERPRISE: Favorites Header */}
      <div className="flex items-center justify-between py-2">
        <button
          onClick={() => setFavoritesExpanded(!favoritesExpanded)}
          className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`size-3 transition-transform duration-200 ${favoritesExpanded ? 'rotate-90' : ''}`}
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
          Favorites
        </button>
      </div>

      {/* ✅ ENTERPRISE: Favorites List */}
      {favoritesExpanded && (
        <ul className="flex w-full min-w-0 flex-col gap-1">
          {mockFavorites.map(favorite => (
            <li key={favorite.id} className="group/menu-item relative">
              <Link
                href={`/organizations/${organization.slug}${favorite.href}`}
                className="peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2.5 text-left outline-none ring-sidebar-ring transition-[width,height,padding] focus-visible:ring-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-9 text-sm"
              >
                <span className="relative flex shrink-0 overflow-hidden size-5 rounded-full">
                  <span className="flex size-5 items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 text-xs font-medium text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900">
                    {favorite.avatar}
                  </span>
                </span>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="truncate text-xs font-medium text-foreground">
                    {favorite.name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {favorite.role}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
