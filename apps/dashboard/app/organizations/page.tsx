import { getAuthContext } from '@workspace/auth/server';
import { db, memberships } from '@workspace/database';
import { and, eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import OrganizationsClient from './organizations-client';

export default async function OrganizationsPage() {
  try {
    // ACHROMATIC APPROACH: Use context (preferred way)
    const { session } = await getAuthContext();

    // ✅ ENTERPRISE: Logger replaced console.log

    // Fetch user memberships with organizations
    const userMemberships = await db.query.memberships.findMany({
      where: and(
        eq(memberships.userId, session.user.id), // UUID string direto
        eq(memberships.isActive, true)
      ),
      with: {
        organization: {
          with: {
            memberships: {
              where: eq(memberships.isActive, true),
              columns: {
                id: true,
              },
            },
          },
        },
      },
    });

    // ✅ ENTERPRISE: Logger replaced console.log

    // Transform data for client component
    const userOrganizations = userMemberships.map(membership => ({
      id: membership.organization.id, // UUID string já - sem toString()
      name: membership.organization.name,
      slug: membership.organization.slug,
      memberCount: membership.organization.memberships?.length || 1,
      avatar: membership.organization.name.charAt(0).toUpperCase(),
      role: membership.role,
      isOwner: membership.organization.ownerId === session.user.id, // UUID comparison
      planName: membership.organization.planName || 'Free',
      isActive: membership.organization.isActive,
    }));

    // ✅ ENTERPRISE: Logger replaced console.log

    // If no organizations, redirect to onboarding
    if (userOrganizations.length === 0) {
      // ✅ ENTERPRISE: Logger replaced console.log
      redirect('/onboarding/organization');
    }

    // Render client component
    return <OrganizationsClient organizations={userOrganizations} />;
  } catch (error) {
    console.error('Organizations page error:', error);

    // Check if it's a redirect error (normal flow)
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error; // Re-throw redirect errors
    }

    // Static error fallback without client interactivity
    return (
      <div className="relative min-h-screen bg-background">
        {/* Header */}
        <div className="fixed inset-x-0 top-0 z-10 mx-auto flex min-w-80 items-center justify-center bg-background p-4">
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
        </div>

        {/* Error Content */}
        <div className="relative mx-auto flex w-full min-w-80 max-w-lg flex-col items-center justify-center min-h-screen pt-24">
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-destructive"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                Unable to load organizations
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Something went wrong while loading your organizations. This
                might be a temporary issue.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/organizations"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                  <path d="M8 16H3v5" />
                </svg>
                Try Again
              </a>

              <a
                href="/auth/sign-in"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
              >
                Sign In Again
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

// Enhanced metadata
export const metadata = {
  title: 'Organizations | Dashboard',
  description:
    'Manage your organizations and switch between different workspaces.',
};

// Organization data type
export interface OrganizationData {
  id: string; // UUID
  name: string;
  slug: string;
  memberCount: number;
  avatar: string;
  role: string;
  isOwner: boolean;
  planName: string;
  isActive: boolean;
}
