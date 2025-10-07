import Link from 'next/link';
import { Button } from '@workspace/ui';

interface OrganizationCardProps {
  name: string;
  slug: string;
  memberCount: number;
  description?: string;
}

export function OrganizationCard({ name, slug, memberCount, description }: OrganizationCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
          <p className="text-sm text-gray-500 mt-2">
            {memberCount} {memberCount === 1 ? 'member' : 'members'}
          </p>
        </div>
      </div>
      
      <div className="mt-4 flex space-x-2">
        <Link href={`/organizations/${slug}`}>
          <Button variant="outline" size="sm">
            View Details
          </Button>
        </Link>
        <Link href={`/organizations/${slug}/members`}>
          <Button variant="outline" size="sm">
            Members
          </Button>
        </Link>
      </div>
    </div>
  );
}
