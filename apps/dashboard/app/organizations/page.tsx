"use client";

import { useState } from "react";
import Link from "next/link";

export default function OrganizationsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - hardcoded para testar
  const mockOrganizations = [
    {
      id: "pablo",
      name: "Pablo",
      slug: "pablo", 
      memberCount: 1,
      avatar: "P"
    }
  ];

  const handleSignOut = () => {
    // ✅ Melhor UX - confirmar antes de fazer logout
    if (window.confirm("Tem certeza que deseja sair?")) {
      window.location.href = "/auth/signin";
    }
  };

  // ✅ Filtro de organizações baseado na busca
  const filteredOrganizations = mockOrganizations.filter(org =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-screen bg-background">
      {/* Header */}
      <div className="fixed inset-x-0 top-0 z-10 mx-auto flex min-w-80 items-center justify-center bg-background p-4">
        <Link href="/">
          <div className="flex items-center space-x-2">
            <div className="flex size-9 items-center justify-center p-1">
              <div className="flex size-7 items-center justify-center rounded-md border text-primary-foreground bg-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g>
                    <path d="M7.81815 8.36373L12 0L24 24H15.2809L7.81815 8.36373Z" fill="currentColor"/>
                    <path d="M4.32142 15.3572L8.44635 24H-1.14809e-06L4.32142 15.3572Z" fill="currentColor"/>
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
          {/* Header */}
          <div className="flex flex-col space-y-1.5 p-6 text-center">
            <h3 className="text-xl font-semibold leading-none tracking-tight">
              Organizations
            </h3>
            <p className="text-sm text-muted-foreground hidden sm:block">
              Jump into an existing organization or add a new one.
            </p>
          </div>

          {/* Content */}
          <div className="p-6 pt-0 space-y-4">
            {/* Search + Add Button */}
            <div className="flex items-center space-x-4">
              <div className="relative inline-block h-9 w-full">
                <span className="absolute left-3 top-1/2 flex -translate-y-1/2 text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search size-4 shrink-0">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                </span>
                <input 
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pl-10 pr-4" 
                  placeholder="Search organizations..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search organizations"
                />
              </div>
              <button 
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 whitespace-nowrap"
                aria-label="Add new organization"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus mr-2 size-4 shrink-0">
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
                <span className="hidden sm:inline">Add organization</span>
                <span className="inline sm:hidden">Add</span>
              </button>
            </div>

            {/* Organizations List */}
            <div className="relative max-h-[calc(100svh-18rem)] overflow-y-auto">
              <div className="flex flex-col items-stretch justify-start gap-3">
                {filteredOrganizations.length > 0 ? (
                  filteredOrganizations.map((org) => (
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
                            <div className="text-xs text-muted-foreground">/organizations/{org.slug}</div>
                          </div>
                        </div>
                        <div className="flex flex-row items-center gap-2">
                          <div className="flex w-8 flex-row items-center gap-1 text-xs text-muted-foreground transition-colors group-hover:text-secondary-foreground">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user size-3 shrink-0">
                              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                            {org.memberCount}
                          </div>
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right size-4 text-muted-foreground transition-colors group-hover:text-secondary-foreground">
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
                        {searchQuery ? "No organizations found matching your search." : "No organizations available."}
                      </p>
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
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
      </div>

      {/* Footer */}
      <div className="fixed inset-x-0 bottom-0 z-10 mx-auto mt-auto flex w-full min-w-80 max-w-lg flex-row items-center justify-center gap-4 bg-background p-4 text-xs text-muted-foreground">
        <span>© 2025 Acme</span>
        <Link className="hidden underline sm:inline hover:text-foreground transition-colors" href="/terms" target="_blank" rel="noopener noreferrer">
          Terms of Use
        </Link>
        <Link className="hidden underline sm:inline hover:text-foreground transition-colors" href="/privacy" target="_blank" rel="noopener noreferrer">
          Privacy Policy
        </Link>
        <button 
          className="inline-flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 underline-offset-4 hover:underline ml-auto h-fit rounded-none p-0 text-xs font-normal text-muted-foreground underline" 
          type="button"
          onClick={handleSignOut}
          aria-label="Sign out of account"
        >
          Sign out
        </button>

        {/* Theme Switcher */}
        <div className="flex w-fit rounded-full border bg-background p-0.5">
          <span className="h-full">
            <input className="peer sr-only" id="theme-switch-system" type="radio" value="system" name="theme" />
            <label htmlFor="theme-switch-system" className="flex size-6 cursor-pointer items-center justify-center rounded-full text-muted-foreground peer-checked:bg-accent peer-checked:text-foreground transition-colors hover:bg-accent/50" aria-label="System theme">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-laptop size-4 shrink-0">
                <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
              </svg>
            </label>
          </span>
          <span className="h-full">
            <input className="peer sr-only" id="theme-switch-light" type="radio" value="light" name="theme" />
            <label htmlFor="theme-switch-light" className="flex size-6 cursor-pointer items-center justify-center rounded-full text-muted-foreground peer-checked:bg-accent peer-checked:text-foreground transition-colors hover:bg-accent/50" aria-label="Light theme">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sun size-4 shrink-0">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="m4.93 4.93 1.41 1.41" />
                <path d="m17.66 17.66 1.41 1.41" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
                <path d="m6.34 17.66-1.41 1.41" />
                <path d="m19.07 4.93-1.41 1.41" />
              </svg>
            </label>
          </span>
          <span className="h-full">
            <input className="peer sr-only" id="theme-switch-dark" type="radio" value="dark" name="theme" defaultChecked />
            <label htmlFor="theme-switch-dark" className="flex size-6 cursor-pointer items-center justify-center rounded-full text-muted-foreground peer-checked:bg-accent peer-checked:text-foreground transition-colors hover:bg-accent/50" aria-label="Dark theme">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-moon size-4 shrink-0">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            </label>
          </span>
        </div>
      </div>
    </div>
  );
}
