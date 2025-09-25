"use client";

import { useState, useEffect } from "react"; // ✅ CORREÇÃO: import useEffect diretamente
import Link from "next/link";

interface DashboardHomeProps {
  params: Promise<{ slug: string }>;
}

export default function DashboardHomePage({ params }: DashboardHomeProps) {
  // ✅ Removido 'async' - React Hook fix aplicado
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("30d");
  const [slug, setSlug] = useState("");

  // ✅ CORREÇÃO: useEffect importado diretamente, não React.useEffect
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setSlug(resolvedParams.slug);
    };
    getParams();
  }, [params]);

  return (
    <div className="flex flex-col size-full overflow-hidden">
      <div className="group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar">
        {/* Sidebar */}
        <div className={`group peer hidden md:block text-sidebar-foreground transition-all duration-200 ${sidebarCollapsed ? 'w-[4rem]' : 'w-[15rem]'}`}>
          <div className="fixed inset-y-0 z-40 hidden h-svh transition-[left,right,width] ease-linear md:flex left-0 border-r bg-sidebar">
            <div className="flex h-full w-full flex-col">
              {/* Sidebar Header */}
              <div className="gap-2 p-3 flex h-14 flex-row items-center py-0">
                <div className="flex w-full min-w-0 flex-col gap-1">
                  <div className="group/menu-item relative">
                    <button className="peer/menu-button flex items-center gap-2 overflow-hidden rounded-md p-2.5 text-left outline-none ring-sidebar-ring transition-[width,height,padding] focus-visible:ring-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-9 text-sm w-full px-1.5">
                      <span className="relative flex shrink-0 overflow-hidden aspect-square size-6 rounded-md">
                        <span className="flex size-6 items-center justify-center rounded-md border border-neutral-200 bg-neutral-100 font-medium text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900">
                          {slug.charAt(0).toUpperCase()}
                        </span>
                      </span>
                      {!sidebarCollapsed && (
                        <div className="flex flex-1 flex-row items-center gap-1 overflow-hidden">
                          <span className="truncate text-sm font-semibold leading-tight">
                            {slug.charAt(0).toUpperCase() + slug.slice(1)}
                          </span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevrons-up-down ml-auto size-4 shrink-0 text-muted-foreground">
                            <path d="m7 15 5 5 5-5"></path>
                            <path d="m7 9 5-5 5 5"></path>
                          </svg>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Sidebar Content */}
              <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
                <div className="relative h-full overflow-hidden">
                  <div className="size-full overflow-y-auto">
                    {/* Main Navigation */}
                    <div className="relative flex w-full min-w-0 flex-col p-3">
                      <ul className="flex w-full min-w-0 flex-col gap-1">
                        <li className="group/menu-item relative">
                          <Link href={`/organizations/${slug}/home`} className="peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2.5 text-left outline-none ring-sidebar-ring transition-[width,height,padding] focus-visible:ring-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-9 text-sm bg-sidebar-accent font-medium text-sidebar-accent-foreground">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-house size-4 shrink-0 text-foreground">
                              <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path>
                              <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            </svg>
                            {!sidebarCollapsed && <span>Home</span>}
                          </Link>
                        </li>
                        <li className="group/menu-item relative">
                          <Link href={`/organizations/${slug}/contacts`} className="peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2.5 text-left outline-none ring-sidebar-ring transition-[width,height,padding] focus-visible:ring-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-9 text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users size-4 shrink-0 text-muted-foreground">
                              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                              <circle cx="9" cy="7" r="4"></circle>
                              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                            {!sidebarCollapsed && <span className="text-muted-foreground">Contacts</span>}
                          </Link>
                        </li>
                        <li className="group/menu-item relative">
                          <Link href={`/organizations/${slug}/settings`} className="peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2.5 text-left outline-none ring-sidebar-ring transition-[width,height,padding] focus-visible:ring-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-9 text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings size-4 shrink-0 text-muted-foreground">
                              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            {!sidebarCollapsed && <span className="text-muted-foreground">Settings</span>}
                          </Link>
                        </li>
                      </ul>
                    </div>

                    {/* Footer Actions */}
                    <div className="relative flex w-full min-w-0 flex-col p-3 mt-auto pb-0">
                      <ul className="flex w-full min-w-0 flex-col gap-1">
                        <li className="group/menu-item relative">
                          <button className="peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2.5 text-left outline-none ring-sidebar-ring transition-[width,height,padding] focus-visible:ring-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-9 text-sm text-muted-foreground">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus size-4 shrink-0">
                              <path d="M5 12h14"></path>
                              <path d="M12 5v14"></path>
                            </svg>
                            {!sidebarCollapsed && <span>Invite member</span>}
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Footer */}
              <div className="flex flex-col gap-2 p-3 h-14">
                <div className="relative flex w-full min-w-0 flex-col p-0">
                  <ul className="flex w-full min-w-0 flex-col gap-1">
                    <li className="group/menu-item relative">
                      <button className="peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2.5 text-left outline-none ring-sidebar-ring focus-visible:ring-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-9 text-sm group/navuser -ml-1.5 transition-none">
                        <span className="relative flex shrink-0 overflow-hidden size-7 rounded-full">
                          <span className="flex size-7 items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 text-sm font-medium text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900">
                            {slug.charAt(0).toUpperCase()}
                          </span>
                        </span>
                        {!sidebarCollapsed && (
                          <div className="flex w-full flex-col truncate text-left">
                            <span className="truncate text-sm font-semibold">
                              {slug.charAt(0).toUpperCase() + slug.slice(1)} User
                            </span>
                          </div>
                        )}
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="relative flex min-h-svh flex-1 flex-col bg-background size-full">
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-background">
              <div className="relative flex h-14 flex-row items-center gap-1 border-b px-4 sm:px-6">
                <button 
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground size-8 sm:-ml-2 px-1.5"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="cursor-pointer transition-transform duration-300 ease-in-out text-muted-foreground">
                    <path fillRule="evenodd" clipRule="evenodd" d="M5.57527 0.78924L10.4219 0.78924C11.1489 0.78924 11.7271 0.78923 12.1935 0.82734C12.6712 0.86637 13.0785 0.94801 13.4514 1.13802C14.0535 1.44481 14.5431 1.93435 14.8499 2.53646C15.0399 2.90935 15.1215 3.31669 15.1606 3.79435C15.1986 4.26079 15.1986 4.83895 15.1986 5.56591V10.4341C15.1986 11.1611 15.1986 11.7392 15.1606 12.2057C15.1215 12.6833 15.0399 13.0907 14.8499 13.4635C14.5431 14.0657 14.0535 14.5552 13.4514 14.862C13.0785 15.052 12.6712 15.1336 12.1935 15.1727C11.7271 15.2108 11.1489 15.2108 10.4219 15.2108H5.57529C4.84833 15.2108 4.27017 15.2108 3.80373 15.1727C3.32607 15.1336 2.91873 15.052 2.54584 14.862C1.94373 14.5552 1.45419 14.0657 1.1474 13.4635C0.957392 13.0907 0.875752 12.6833 0.836725 12.2057C0.798715 11.7392 0.798718 11.1611 0.798723 10.4341L0.798723 5.5659C0.798718 4.83894 0.798715 4.26079 0.836725 3.79435C0.875752 3.31669 0.957392 2.90935 1.1474 2.53646C1.45419 1.93435 1.94373 1.44481 2.54584 1.13802C2.91873 0.94801 3.32607 0.86637 3.80373 0.82734C4.27017 0.78923 4.84833 0.78924 5.57527 0.78924Z" fill="currentColor" />
                    <path fillRule="evenodd" clipRule="evenodd" d="M6.29583 14.7329L6.29583 1.21743H7.56139L7.56139 14.7329H6.29583Z" fill="currentColor" className="transition-opacity duration-200 ease-in-out opacity-100 translate-x-[-5%]" />
                  </svg>
                </button>
                <div className="shrink-0 bg-border w-px mr-2 h-4"></div>
                <div className="flex w-full flex-row items-center justify-between">
                  <div className="flex flex-row items-center gap-2">
                    <h1 className="text-sm font-semibold">Overview</h1>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info hidden size-3.5 shrink-0 text-muted-foreground sm:inline">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M12 16v-4"></path>
                      <path d="M12 8h.01"></path>
                    </svg>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link target="_blank" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground size-9" href="https://github.com">
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 15 15" className="size-4 shrink-0">
                        <path fill="currentColor" fillRule="evenodd" d="M7.5.25a7.25 7.25 0 0 0-2.292 14.13c.363.066.495-.158.495-.35 0-.172-.006-.628-.01-1.233-2.016.438-2.442-.972-2.442-.972-.33-.838-.805-1.06-.805-1.06-.658-.45.05-.441.05-.441.728.051 1.11.747 1.11.747.647 1.108 1.697.788 2.11.602.066-.468.254-.788.46-.969-1.61-.183-3.302-.805-3.302-3.583 0-.792.283-1.438.747-1.945-.075-.184-.324-.92.07-1.92 0 0 .61-.194 1.994.744A7 7 0 0 1 7.5 3.756A7 7 0 0 1 9.315 4c1.384-.938 1.992-.743 1.992-.743.396.998.147 1.735.072 1.919.465.507.745 1.153.745 1.945 0 2.785-1.695 3.398-3.31 3.577.26.224.492.667.492 1.343 0 .97-.009 1.751-.009 1.989 0 .194.131.42.499.349A7.25 7.25 0 0 0 7.499.25" clipRule="evenodd"></path>
                      </svg>
                    </Link>
                    <Link target="_blank" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground size-9" href="https://x.com">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" strokeLinejoin="round" color="currentcolor" viewBox="0 0 16 16" className="size-4 shrink-0">
                        <path fill="currentColor" fillRule="evenodd" d="M.5.5h5.25l3.734 5.21L14 .5h2l-5.61 6.474L16.5 15.5h-5.25l-3.734-5.21L3 15.5H1l5.61-6.474L.5.5zM12.02 14L3.42 2h1.56l8.6 12h-1.56z" clipRule="evenodd"></path>
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Sub Header with Tabs */}
              <div className="relative flex h-12 items-center justify-between gap-2 border-b px-4 sm:px-6">
                <div className="flex flex-row items-center gap-4">
                  <div className="hidden sm:flex -ml-2">
                    <div className="inline-flex items-center justify-start text-muted-foreground h-12 max-h-12 min-h-12 gap-x-2 border-none">
                      {["1d", "3d", "7d", "30d", "Custom"].map((tab) => (
                        <button 
                          key={tab}
                          type="button"
                          onClick={() => setActiveTab(tab)}
                          className={`group relative inline-flex h-12 items-center justify-center whitespace-nowrap rounded-none border-b border-b-transparent bg-transparent py-1 pb-3 pt-2 text-sm text-muted-foreground shadow-none ring-offset-background transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 mx-0 border-t-4 border-t-transparent ${activeTab === tab ? 'border-b-primary font-medium text-foreground' : ''}`}
                        >
                          <div className="rounded-md px-2 py-1 hover:bg-accent">{tab}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <button className="inline-flex items-center rounded-md text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 w-[260px] justify-start text-left font-normal">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar mr-2 size-4 shrink-0">
                        <path d="M8 2v4"></path>
                        <path d="M16 2v4"></path>
                        <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                        <path d="M3 10h18"></path>
                      </svg>
                      Aug 25, 2025 - Sep 24, 2025
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area - BLANK as requested */}
            <div className="grow overflow-hidden">
              <div className="relative h-full overflow-y-auto">
                <div className="mx-auto max-w-6xl space-y-2 p-2 sm:space-y-8 sm:p-6">
                  {/* Content placeholder - deixado em branco conforme solicitado */}
                  <div className="flex items-center justify-center h-64 border-2 border-dashed border-muted rounded-lg">
                    <p className="text-muted-foreground">Main Content Area - Ready for implementation</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
