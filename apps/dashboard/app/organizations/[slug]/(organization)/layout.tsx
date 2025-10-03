// apps/dashboard/app/organizations/[slug]/(organization)/layout.tsx - ENTERPRISE DASHBOARD LAYOUT

import { getAuthOrganizationContext } from '@workspace/auth/server';
import {
  DashboardHeader,
  DashboardSidebar,
  SidebarProvider,
} from '@workspace/ui';

interface OrganizationLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function OrganizationLayout({
  children,
  params,
}: OrganizationLayoutProps) {
  const { slug } = await params;

  // ✅ Get organization context with user membership
  const { session, organization, membership } =
    await getAuthOrganizationContext(slug);

  return (
    <SidebarProvider>
      <div className="flex flex-col size-full overflow-hidden">
        <div className="group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar">
          {/* ✅ ENTERPRISE: Modular Sidebar */}
          <DashboardSidebar
            organization={organization}
            user={session.user}
            membership={membership}
          />

          {/* ✅ ENTERPRISE: Main Content Area */}
          <main className="relative flex min-h-svh flex-1 flex-col bg-background size-full">
            <div className="flex h-full flex-col">
              {/* ✅ ENTERPRISE: Modular Header */}
              <DashboardHeader
                organization={organization}
                user={session.user}
              />

              {/* ✅ ENTERPRISE: Page Content */}
              <div className="grow overflow-hidden">
                <div className="relative h-full overflow-y-auto">
                  {children}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
