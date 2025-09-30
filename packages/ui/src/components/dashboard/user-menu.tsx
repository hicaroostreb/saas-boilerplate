// packages/ui/src/components/dashboard/user-menu.tsx

'use client';

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

interface UserMenuProps {
  user: User;
  membership: Membership;
  collapsed: boolean;
}

export function UserMenu({ user, membership, collapsed }: UserMenuProps) {
  return (
    <div className="relative flex w-full min-w-0 flex-col p-0">
      <ul className="flex w-full min-w-0 flex-col gap-1">
        <li className="group/menu-item relative">
          <button className="peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2.5 text-left outline-none ring-sidebar-ring focus-visible:ring-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-9 text-sm group/navuser -ml-1.5 transition-none">
            <span className="relative flex shrink-0 overflow-hidden size-7 rounded-full">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name ?? user.email} // ✅ CORREÇÃO: || → ||
                  className="size-7 rounded-full object-cover"
                />
              ) : (
                <span className="flex size-7 items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 text-sm font-medium text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900">
                  {(user.name ?? user.email).charAt(0).toUpperCase()}{' '}
                  {/* ✅ CORREÇÃO: || → || */}
                </span>
              )}
            </span>
            {!collapsed && (
              <div className="flex w-full flex-col truncate text-left transition-opacity duration-200">
                <span className="truncate text-sm font-semibold">
                  {user.name ?? user.email} {/* ✅ CORREÇÃO: || → || */}
                </span>
                <span className="truncate text-xs text-muted-foreground capitalize">
                  {membership.role}
                </span>
              </div>
            )}
          </button>
        </li>
      </ul>
    </div>
  );
}
