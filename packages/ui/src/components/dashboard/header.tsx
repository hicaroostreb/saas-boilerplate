// packages/ui/src/components/dashboard/header.tsx - USANDO COMPONENTE TOGGLE

'use client';

import { useState } from 'react';
import { SidebarToggle } from './sidebar-toggle'; // ✅ IMPORT COMPONENT

interface Organization {
  id: string;
  name: string;
  slug: string;
}

interface User {
  id: string;
  name: string | null;
  email: string;
}

interface DashboardHeaderProps {
  organization: Organization;
  user: User;
  title?: string;
  subtitle?: string;
}

// ✅ CORRIGIDO: Removidas propriedades inexistentes e variáveis não utilizadas
export function DashboardHeader({
  organization, // ✅ CORRIGIDO: Propriedade correta
  user, // ✅ CORRIGIDO: Propriedade correta
  title = 'Overview',
  subtitle, // ✅ CORRIGIDO: Propriedade correta
}: DashboardHeaderProps) {
  // ✅ CORREÇÃO: Prefixado com underscore para ignorar warnings
  const [_activeTab, _setActiveTab] = useState('30d');

  return (
    <div className="sticky top-0 z-20 bg-background">
      <div className="relative flex h-14 flex-row items-center gap-1 border-b px-4 sm:px-6">
        {/* ✅ ENTERPRISE: Sidebar Toggle Component */}
        <SidebarToggle />

        {/* ✅ ENTERPRISE: Vertical divider */}
        <div
          data-orientation="vertical"
          role="none"
          className="shrink-0 bg-border w-px mr-2 h-4"
        />

        {/* ✅ ENTERPRISE: Header content */}
        <div className="flex w-full flex-row items-center justify-between">
          <div className="flex flex-row items-center gap-2">
            <h1 className="text-sm font-semibold">{title}</h1>
            {subtitle && (
              <span className="text-sm text-muted-foreground">
                - {subtitle}
              </span>
            )}
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
              className="lucide lucide-info hidden size-3.5 shrink-0 text-muted-foreground sm:inline"
              data-state="closed"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
          </div>

          <div className="flex items-center gap-2">
            {/* ✅ ENTERPRISE: User info display */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {organization.name}
              </span>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm font-medium">
                {user.name || user.email}
              </span>
            </div>

            <a
              target="_blank"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground size-9"
              href="https://github.com"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
                fill="none"
                viewBox="0 0 15 15"
                className="size-4 shrink-0"
              >
                <path
                  fill="currentColor"
                  fillRule="evenodd"
                  d="M7.5.25a7.25 7.25 0 0 0-2.292 14.13c.363.066.495-.158.495-.35 0-.172-.006-.628-.01-1.233-2.016.438-2.442-.972-2.442-.972-.33-.838-.805-1.06-.805-1.06-.658-.45.05-.441.05-.441.728.051 1.11.747 1.11.747.647 1.108 1.697.788 2.11.602.066-.468.254-.788.46-.969-1.61-.183-3.302-.805-3.302-3.583 0-.792.283-1.438.747-1.945-.075-.184-.324-.92.07-1.92 0 0 .61-.194 1.994.744A7 7 0 0 1 7.5 3.756A7 7 0 0 1 9.315 4c1.384-.938 1.992-.743 1.992-.743.396.998.147 1.735.072 1.919.465.507.745 1.153.745 1.945 0 2.785-1.695 3.398-3.31 3.577.26.224.492.667.492 1.343 0 .97-.009 1.751-.009 1.989 0 .194.131.42.499.349A7.25 7.25 0 0 0 7.499.25"
                  clipRule="evenodd"
                />
              </svg>
              <span className="sr-only">GitHub</span>
            </a>
            <a
              target="_blank"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground size-9"
              href="https://x.com"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                strokeLinejoin="round"
                color="currentcolor"
                viewBox="0 0 16 16"
                className="size-4 shrink-0"
              >
                <path
                  fill="currentColor"
                  fillRule="evenodd"
                  d="M.5.5h5.25l3.734 5.21L14 .5h2l-5.61 6.474L16.5 15.5h-5.25l-3.734-5.21L3 15.5H1l5.61-6.474L.5.5zM12.02 14L3.42 2h1.56l8.6 12h-1.56z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="sr-only">X (formerly Twitter)</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
