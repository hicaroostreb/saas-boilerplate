// packages/ui/src/components/dashboard/sidebar.tsx - ENTERPRISE SIDEBAR COMPLETA

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSidebar } from "./sidebar-provider";
import { OrganizationSwitcher } from "./organization-switcher";
import { UserMenu } from "./user-menu";

interface Organization {
  id: string;
  name: string;
  slug: string;
  image: string | null;
}

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

interface Membership {
  role: string;
  isActive: boolean;
}

interface DashboardSidebarProps {
  organization: Organization;
  user: User;
  membership: Membership;
}

// ✅ ENTERPRISE: Navigation items configuration
const navigationItems = [
  {
    href: '/home',
    label: 'Home',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-house size-4 shrink-0">
        <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path>
        <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      </svg>
    ),
  },
  {
    href: '/contacts',
    label: 'Contacts',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users size-4 shrink-0">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    ),
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings size-4 shrink-0">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
    ),
    requireRole: ['owner', 'admin'],
  },
];

// ✅ ENTERPRISE: Mock favorites data (seguindo o modelo exato)
const mockFavorites = [
  {
    id: 'f0687c1f-a7ea-4103-90e0-f5ed68ceb8a8',
    name: 'Airbnb',
    avatar: '/api/contact-images/f0687c1f-a7ea-4103-90e0-f5ed68ceb8a8',
    href: '/contacts/f0687c1f-a7ea-4103-90e0-f5ed68ceb8a8',
  },
  {
    id: 'd598c973-0caa-4cbe-b9eb-c5683f4d1514', 
    name: 'Google',
    avatar: '/api/contact-images/d598c973-0caa-4cbe-b9eb-c5683f4d1514',
    href: '/contacts/d598c973-0caa-4cbe-b9eb-c5683f4d1514',
  },
  {
    id: '7895901a-4f02-454a-839b-cd14911c0a9f',
    name: 'Microsoft',
    avatar: '/api/contact-images/7895901a-4f02-454a-839b-cd14911c0a9f',
    href: '/contacts/7895901a-4f02-454a-839b-cd14911c0a9f',
  },
];

export function DashboardSidebar({ organization, user, membership }: DashboardSidebarProps) {
  const { collapsed } = useSidebar();
  const pathname = usePathname();
  const [favoritesExpanded, setFavoritesExpanded] = useState(true);

  // ✅ Filter navigation based on user role
  const filteredNavigation = navigationItems.filter(item => {
    if (!item.requireRole) return true;
    return item.requireRole.includes(membership.role);
  });

  return (
    <div 
      className="group peer hidden md:block text-sidebar-foreground" 
      data-state={collapsed ? "collapsed" : "expanded"}
      data-collapsible={collapsed ? "icon" : "expanded"} 
      data-variant="sidebar" 
      data-side="left"
    >
      {/* ✅ ENTERPRISE: Sidebar backdrop/spacer */}
      <div className={`duration-200 relative h-svh bg-transparent transition-[width] ease-linear ${collapsed ? 'w-[--sidebar-width-icon]' : 'w-[--sidebar-width]'}`} />

      {/* ✅ ENTERPRISE: Fixed sidebar */}
      <div className={`duration-200 fixed inset-y-0 z-40 hidden h-svh transition-[left,right,width] ease-linear md:flex left-0 border-r ${collapsed ? 'w-[--sidebar-width-icon]' : 'w-[--sidebar-width]'}`}>
        <div 
          data-sidebar="sidebar"
          className="flex h-full w-full flex-col bg-sidebar"
        >
          {/* ✅ ENTERPRISE: Header */}
          <div data-sidebar="header" className="gap-2 p-3 flex h-14 flex-row items-center py-0">
            <ul data-sidebar="menu" className="flex w-full min-w-0 flex-col gap-1">
              <li data-sidebar="menu-item" className="group/menu-item relative">
                <OrganizationSwitcher 
                  organization={organization}
                  collapsed={collapsed}
                />
              </li>
            </ul>
          </div>

          {/* ✅ ENTERPRISE: Content */}
          <div 
            data-sidebar="content" 
            className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden"
          >
            <div className="relative h-full overflow-hidden">
              <div className="size-full overflow-y-auto rounded-[inherit]">
                <div style={{ minWidth: '100%', display: 'table' }}>
                  
                  {/* ✅ ENTERPRISE: Main Navigation */}
                  <div data-sidebar="group" className="relative flex w-full min-w-0 flex-col p-3">
                    <ul data-sidebar="menu" className="flex w-full min-w-0 flex-col gap-1">
                      {filteredNavigation.map((item) => {
                        const href = `/organizations/${organization.slug}${item.href}`;
                        const isActive = pathname === href;
                        
                        return (
                          <li key={item.href} data-sidebar="menu-item" className="group/menu-item relative">
                            <Link 
                              href={href}
                              data-sidebar="menu-button"
                              data-size="default"
                              data-active={isActive}
                              className={`peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2.5 text-left outline-none ring-sidebar-ring transition-[width,height,padding] focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-9 group-data-[collapsible=icon]:!p-2.5 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-9 text-sm ${
                                isActive 
                                  ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground' 
                                  : ''
                              }`}
                            >
                              <span className={isActive ? 'text-foreground' : 'text-muted-foreground'}>
                                {item.icon}
                              </span>
                              {!collapsed && (
                                <span className={`dark:text-foreground ${
                                  isActive ? 'dark:text-foreground' : 'dark:text-muted-foreground'
                                }`}>
                                  {item.label}
                                </span>
                              )}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* ✅ ENTERPRISE: Favorites Section */}
                  {!collapsed && (
                    <div 
                      data-sidebar="group" 
                      className="relative flex w-full min-w-0 flex-col p-3 group/collapsible"
                      data-state={favoritesExpanded ? "open" : "closed"}
                    >
                      <button 
                        type="button" 
                        onClick={() => setFavoritesExpanded(!favoritesExpanded)}
                        className="flex h-9 shrink-0 items-center rounded-md px-2.5 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opa] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0 group-data-[collapsible=icon]:opacity-0 group/label hover:bg-sidebar-accent group-data-[collapsible=icon]:mt-0 group-data-[collapsible=icon]:invisible"
                        data-sidebar="group-label"
                      >
                        <span className="text-sm text-muted-foreground">Favorites</span>
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
                          className={`lucide lucide-chevron-right ml-auto transition-transform duration-200 opacity-60 ${favoritesExpanded ? 'rotate-90' : ''}`}
                        >
                          <path d="m9 18 6-6-6-6"></path>
                        </svg>
                      </button>
                      
                      {favoritesExpanded && (
                        <div 
                          data-state="open"
                          className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down"
                        >
                          <div data-sidebar="group-content" className="w-full text-sm mt-2">
                            <ul data-sidebar="menu" className="flex w-full min-w-0 flex-col gap-1">
                              {mockFavorites.map((favorite) => (
                                <li 
                                  key={favorite.id}
                                  data-sidebar="menu-item" 
                                  className="group/menu-item relative group/fav-item" 
                                  role="button" 
                                  tabIndex={0} 
                                  aria-disabled="false" 
                                  aria-roledescription="sortable"
                                >
                                  <Link 
                                    href={`/organizations/${organization.slug}${favorite.href}`}
                                    className="peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2.5 text-left outline-none ring-sidebar-ring transition-[width,height,padding] focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-9 group-data-[collapsible=icon]:!p-2.5 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-9 text-sm relative"
                                  >
                                    {/* ✅ ENTERPRISE: Drag handle */}
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
                                      className="lucide lucide-grip-vertical pointer-events-none absolute -left-0.5 top-3 z-20 !size-3 shrink-0 opacity-0 group-hover/fav-item:opacity-60"
                                    >
                                      <circle cx="9" cy="12" r="1"></circle>
                                      <circle cx="9" cy="5" r="1"></circle>
                                      <circle cx="9" cy="19" r="1"></circle>
                                      <circle cx="15" cy="12" r="1"></circle>
                                      <circle cx="15" cy="5" r="1"></circle>
                                      <circle cx="15" cy="19" r="1"></circle>
                                    </svg>

                                    {/* ✅ ENTERPRISE: Contact avatar */}
                                    <span className="relative flex overflow-hidden size-4 flex-none shrink-0 rounded-md">
                                      <img 
                                        className="aspect-square size-full" 
                                        alt={favorite.name}
                                        src={favorite.avatar} 
                                        onError={(e) => {
                                          // Fallback to initials
                                          e.currentTarget.style.display = 'none';
                                          (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'flex';
                                        }}
                                      />
                                      <span 
                                        className="hidden size-4 items-center justify-center rounded-md border border-neutral-200 bg-neutral-100 text-xs font-medium text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900"
                                      >
                                        {favorite.name.charAt(0).toUpperCase()}
                                      </span>
                                    </span>

                                    <span className="backface-hidden ml-0.5 truncate text-sm font-normal will-change-transform">
                                      {favorite.name}
                                    </span>

                                    {/* ✅ ENTERPRISE: Unfavorite button */}
                                    <button 
                                      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground -mr-1 ml-auto size-6 p-0 text-muted-foreground opacity-0 group-hover/fav-item:opacity-60"
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        // TODO: Remove from favorites
                                      }}
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
                                        className="lucide lucide-star-off size-3.5 shrink-0"
                                      >
                                        <path d="M8.34 8.34 2 9.27l5 4.87L5.82 21 12 17.77 18.18 21l-.59-3.43"></path>
                                        <path d="M18.42 12.76 22 9.27l-6.91-1L12 2l-1.44 2.91"></path>
                                        <line x1="2" x2="22" y1="2" y2="22"></line>
                                      </svg>
                                    </button>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ✅ ENTERPRISE: Footer Actions */}
                  <div data-sidebar="group" className="relative flex w-full min-w-0 flex-col p-3 mt-auto pb-0">
                    <ul data-sidebar="menu" className="flex w-full min-w-0 flex-col gap-1">
                      {/* ✅ Invite member */}
                      {(membership.role === 'owner' || membership.role === 'admin') && (
                        <li data-sidebar="menu-item" className="group/menu-item relative">
                          <button 
                            data-sidebar="menu-button"
                            data-size="default"
                            data-active="false"
                            className="peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2.5 text-left outline-none ring-sidebar-ring transition-[width,height,padding] focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-9 group-data-[collapsible=icon]:!p-2.5 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-9 text-sm text-muted-foreground"
                            type="button"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus size-4 shrink-0">
                              <path d="M5 12h14"></path>
                              <path d="M12 5v14"></path>
                            </svg>
                            {!collapsed && <span>Invite member</span>}
                          </button>
                        </li>
                      )}

                      {/* ✅ ENTERPRISE: Feedback button */}
                      <li data-sidebar="menu-item" className="group/menu-item relative">
                        <button 
                          data-sidebar="menu-button"
                          data-size="default"
                          data-active="false"
                          className="peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2.5 text-left outline-none ring-sidebar-ring transition-[width,height,padding] focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-9 group-data-[collapsible=icon]:!p-2.5 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-9 text-sm text-muted-foreground"
                          type="button"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle size-4 shrink-0">
                            <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>
                          </svg>
                          {!collapsed && <span>Feedback</span>}
                        </button>
                      </li>
                    </ul>
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* ✅ ENTERPRISE: Footer with User Menu */}
          <div data-sidebar="footer" className="flex flex-col gap-2 p-3 h-14">
            <UserMenu 
              user={user}
              membership={membership}
              collapsed={collapsed}
            />
          </div>

          {/* ✅ ENTERPRISE: Rail (restore button) */}
          <button 
            data-sidebar="rail"
            aria-label="Click to restore sidebar"
            tabIndex={-1}
            title="Click to restore sidebar"
            className="absolute cursor-col-resize inset-y-0 z-50 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex [[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-sidebar [[data-side=left][data-collapsible=offcanvas]_&]:-right-2 [[data-side=right][data-collapsible=offcanvas]_&]:-left-2"
          />
        </div>
      </div>
    </div>
  );
}
