import { Button } from '@workspace/ui';
import Link from 'next/link';
import { OrganizationCard } from '../../components/organizations/OrganizationCard';

export default function OrganizationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Your Organizations</h1>
        <Link href="/onboarding/organization">
          <Button>Create Organization</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Organizations will be loaded here */}
        <OrganizationCard
          name="Example Org"
          slug="example-org"
          memberCount={5}
        />
      </div>
    </div>
  );
}
