import { InvitationForm } from '@/components/organizations/InvitationForm';
import { MembersList } from '@/components/organizations/MembersList';

interface MembersPageProps {
  params: {
    slug: string;
  };
}

export default function MembersPage({ params }: MembersPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
        <p className="text-gray-600">
          Manage your organization members and invite new people.
        </p>
      </div>

      <InvitationForm organizationSlug={params.slug} />
      <MembersList organizationSlug={params.slug} />
    </div>
  );
}
