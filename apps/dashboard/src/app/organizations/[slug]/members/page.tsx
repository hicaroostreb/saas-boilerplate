import { InvitationForm } from '@/components/organizations/InvitationForm';
import { MembersList } from '@/components/organizations/MembersList';

interface MembersPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function MembersPage({ params }: MembersPageProps) {
  const { slug } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
        <p className="text-gray-600">
          Manage your organization members and invite new people.
        </p>
      </div>

      <InvitationForm organizationSlug={slug} />
      <MembersList organizationSlug={slug} />
    </div>
  );
}
