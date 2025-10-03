// packages/ui/src/components/dashboard/organization-switcher.tsx

'use client';

interface Organization {
  id: string;
  name: string;
  slug: string;
  image: string | null;
}

interface OrganizationSwitcherProps {
  organization: Organization;
  collapsed: boolean;
}

export function OrganizationSwitcher({
  organization,
  collapsed,
}: OrganizationSwitcherProps) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-1">
      <div className="group/menu-item relative">
        <button className="peer/menu-button flex items-center gap-2 overflow-hidden rounded-md p-2.5 text-left outline-none ring-sidebar-ring transition-[width,height,padding] focus-visible:ring-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-9 text-sm w-full px-1.5">
          <span className="relative flex shrink-0 overflow-hidden aspect-square size-6 rounded-md">
            {organization.image ? (
              <img
                src={organization.image}
                alt={organization.name}
                className="size-6 rounded-md object-cover"
              />
            ) : (
              <span className="flex size-6 items-center justify-center rounded-md border border-neutral-200 bg-neutral-100 font-medium text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900">
                {organization.name.charAt(0).toUpperCase()}
              </span>
            )}
          </span>
          {!collapsed && (
            <div className="flex flex-1 flex-row items-center gap-1 overflow-hidden transition-opacity duration-200">
              <span className="truncate text-sm font-semibold leading-tight">
                {organization.name}
              </span>
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
                className="lucide lucide-chevrons-up-down ml-auto size-4 shrink-0 text-muted-foreground"
              >
                <path d="m7 15 5 5 5-5" />
                <path d="m7 9 5-5 5 5" />
              </svg>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
