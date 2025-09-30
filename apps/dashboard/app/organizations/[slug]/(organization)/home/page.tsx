// apps/dashboard/app/organizations/[slug]/(organization)/home/page.tsx - CORRECTED HOME PAGE

import { getAuthOrganizationContext } from '@workspace/auth/server';
import Link from 'next/link';

interface DashboardHomeProps {
  params: Promise<{ slug: string }>;
}

export default async function DashboardHomePage({
  params,
}: DashboardHomeProps) {
  const { slug } = await params;
  const { session, organization, membership } =
    await getAuthOrganizationContext(slug);

  // ✅ Calculate dashboard data
  const isOwner = organization.ownerId === session.user.id;

  return (
    <div className="mx-auto max-w-6xl space-y-2 p-2 sm:space-y-8 sm:p-6">
      {/* ✅ ENTERPRISE: Organization Overview */}
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">
              {organization.name}
            </h2>
            <p className="text-muted-foreground">
              {organization.description ||
                'Organization overview and management'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-primary/10 text-primary capitalize">
              {membership.role}
            </span>
            {isOwner && (
              <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-100 dark:border-yellow-800">
                Owner
              </span>
            )}
          </div>
        </div>

        {/* Stats Grid - ✅ CORRIGIDO */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Members Card */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="text-sm font-medium">Total Members</div>
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
                className="lucide lucide-users size-4 text-muted-foreground"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold">
                {organization.currentMembers || 1}
              </div>
              <p className="text-xs text-muted-foreground">
                Active organization members
              </p>
            </div>
          </div>

          {/* Current Plan Card */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="text-sm font-medium">Current Plan</div>
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
                className="lucide lucide-credit-card size-4 text-muted-foreground"
              >
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <line x1="2" x2="22" y1="10" y2="10" />
              </svg>
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold capitalize">
                {organization.planName || 'Free'}
              </div>
              <p className="text-xs text-muted-foreground capitalize">
                {organization.subscriptionStatus || 'Active'}
              </p>
            </div>
          </div>

          {/* Projects Card - ✅ MUDANÇA: Status → Projects */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="text-sm font-medium">Projects</div>
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
                className="lucide lucide-briefcase size-4 text-muted-foreground"
              >
                <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2-2v16" />
              </svg>
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {organization.currentProjects || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                of {organization.maxProjects || 5} available
              </p>
            </div>
          </div>

          {/* Storage Card - ✅ CORRIGIDO */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="text-sm font-medium">Storage</div>
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
                className="lucide lucide-hard-drive size-4 text-muted-foreground"
              >
                <line x1="22" x2="2" y1="12" y2="12" />
                <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
                <line x1="6" x2="6.01" y1="16" y2="16" />
                <line x1="10" x2="10.01" y1="16" y2="16" />
              </svg>
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold">
                {Math.round(
                  ((organization.currentStorage || 0) / 1024 / 1024) * 100
                ) / 100}
                MB
              </div>
              <p className="text-xs text-muted-foreground">
                of{' '}
                {Math.round(
                  ((organization.maxStorage || 1073741824) /
                    1024 /
                    1024 /
                    1024) *
                    100
                ) / 100}
                GB limit
              </p>
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="rounded-lg border bg-muted/50 p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold">
                Welcome to {organization.name}!
                {isOwner && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    (You&apos;re the owner)
                  </span>
                )}
              </h3>
              <p className="text-sm text-muted-foreground">
                Get started by exploring your organization dashboard. You can
                manage members, update settings, and track your
                organization&apos;s progress from here.
              </p>
              <div className="flex items-center space-x-2 pt-2">
                <Link
                  href={`/organizations/${organization.slug}/contacts`}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
                >
                  View Contacts
                </Link>
                {(membership.role === 'owner' ||
                  membership.role === 'admin') && (
                  <Link
                    href={`/organizations/${organization.slug}/settings`}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                  >
                    Settings
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ✅ Metadata
export async function generateMetadata({ params }: DashboardHomeProps) {
  try {
    const { slug } = await params;
    const { organization } = await getAuthOrganizationContext(slug);

    return {
      title: `${organization.name} | Dashboard`,
      description: `Manage and overview ${organization.name}.`,
    };
  } catch {
    return {
      title: 'Dashboard | Organization',
      description: 'Organization dashboard and management.',
    };
  }
}
