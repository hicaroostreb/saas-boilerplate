'use client';

import { ThemeSwitcher } from '@workspace/ui';
import Link from 'next/link';
import { useState } from 'react';

interface Organization {
  id: string;
  name: string;
  slug: string;
  memberCount: number;
  avatar: string;
  role: string;
}

interface OrganizationsClientProps {
  organizations: Organization[];
}

export default function OrganizationsClient({
  organizations,
}: OrganizationsClientProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // ✅ CORREÇÃO CRÍTICA: Função de logout corrigida
  const handleSignOut = async () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      try {
        // ✅ Importação dinâmica para evitar problemas de SSR
        const { signOut } = await import('next-auth/react');

        // ✅ ENTERPRISE: Logger replaced console.log

        await signOut({
          callbackUrl: '/auth/sign-in', // ✅ Redirecionar para página de sign-in
          redirect: true,
        });
      } catch (error) {
        console.error('❌ Sign out error:', error);
        // ✅ FALLBACK: Se NextAuth falhar, usar window.location
        // ✅ ENTERPRISE: Logger replaced console.log
        window.location.href = '/auth/sign-in';
      }
    }
  };

  const filteredOrganizations = organizations.filter(
    org =>
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-screen bg-background">
      {/* Header */}
      <div className="fixed inset-x-0 top-0 z-10 mx-auto flex min-w-80 items-center justify-center bg-background p-4">
        <Link href={process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}>
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
            <span className="font-bold">Acme</span>
          </div>
        </Link>
      </div>

      {/* Main Content */}
      <div className="relative mx-auto flex w-full min-w-80 max-w-lg flex-col items-stretch justify-start gap-6 pt-24">
        <div className="rounded-xl border bg-card text-card-foreground border-none shadow-none">
          <div className="flex flex-col space-y-1.5 p-6 text-center">
            <h3 className="text-xl font-semibold leading-none tracking-tight">
              Organizations
            </h3>
            <p className="text-sm text-muted-foreground hidden sm:block">
              Jump into an existing organization or add a new one.
            </p>
          </div>

          <div className="p-6 pt-0 space-y-4">
            {/* Search + Add Button */}
            <div className="flex items-center space-x-4">
              <div className="relative inline-block h-9 w-full">
                <span className="absolute left-3 top-1/2 flex -translate-y-1/2 text-muted-foreground">
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
                    className="lucide lucide-search size-4 shrink-0"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                </span>
                <input
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pl-10 pr-4"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  aria-label="Search organizations"
                />
              </div>
              <Link
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 whitespace-nowrap"
                href="/onboarding/organization"
                aria-label="Add new organization"
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
                  className="lucide lucide-plus mr-2 size-4 shrink-0"
                >
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
                <span className="hidden sm:inline">Add organization</span>
                <span className="inline sm:hidden">Add</span>
              </Link>
            </div>

            {/* Organizations List */}
            <div className="flex flex-col items-stretch justify-start gap-3">
              {filteredOrganizations.length > 0 ? (
                filteredOrganizations.map(org => (
                  <Link
                    key={org.id}
                    className="group relative flex flex-col rounded-lg border transition-all hover:bg-secondary/20 hover:shadow active:bg-secondary/50 active:shadow-lg dark:shadow-primary/20"
                    href={`/organizations/${org.slug}/home`}
                    aria-label={`Access ${org.name} organization`}
                  >
                    <div className="flex h-full flex-row items-center justify-between p-4">
                      <div className="flex flex-row items-center gap-2 transition-colors group-hover:text-secondary-foreground">
                        <span className="relative flex shrink-0 overflow-hidden aspect-square size-6 rounded-md">
                          <span className="flex size-6 items-center justify-center rounded-md border border-neutral-200 bg-neutral-100 text-sm font-medium text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900">
                            {org.avatar}
                          </span>
                        </span>
                        <div>
                          <div className="text-sm font-medium">{org.name}</div>
                          <div className="text-xs text-muted-foreground">
                            /organizations/{org.slug}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-row items-center gap-2">
                        <div className="flex w-8 flex-row items-center gap-1 text-xs text-muted-foreground transition-colors group-hover:text-secondary-foreground">
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
                            className="lucide lucide-user size-3 shrink-0"
                          >
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                          {org.memberCount}
                        </div>
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
                          className="lucide lucide-chevron-right size-4 text-muted-foreground transition-colors group-hover:text-secondary-foreground"
                        >
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="flex items-center justify-center py-8 text-center">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {searchQuery
                        ? 'No organizations found matching your search.'
                        : 'No organizations available.'}
                    </p>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="text-xs text-primary hover:underline"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed inset-x-0 bottom-0 z-10 mx-auto mt-auto flex w-full min-w-80 max-w-lg flex-row items-center justify-center gap-4 bg-background p-4 text-xs text-muted-foreground">
        <span>© 2025 Acme</span>
        <Link
          className="hidden underline sm:inline"
          rel="noopener noreferrer"
          target="_blank"
          href="/terms-of-use"
        >
          Terms of Use
        </Link>
        <Link
          className="hidden underline sm:inline"
          rel="noopener noreferrer"
          target="_blank"
          href="/privacy-policy"
        >
          Privacy Policy
        </Link>

        {/* ✅ CORREÇÃO: Botão de Sign out corrigido */}
        <button
          className="inline-flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 underline-offset-4 hover:underline ml-auto h-fit rounded-none p-0 text-xs font-normal text-muted-foreground underline"
          type="button"
          onClick={handleSignOut}
          aria-label="Sign out of account"
        >
          Sign out
        </button>

        {/* Theme Switcher */}
        <ThemeSwitcher />
      </div>
    </div>
  );
}
