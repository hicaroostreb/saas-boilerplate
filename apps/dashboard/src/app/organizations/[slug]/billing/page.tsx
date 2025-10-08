import { BillingSettings } from '@/components/organizations/BillingSettings';

interface BillingPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function BillingPage({ params }: BillingPageProps) {
  const { slug } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Billing & Subscription
        </h1>
        <p className="text-gray-600">
          Manage your subscription and billing information.
        </p>
      </div>

      <BillingSettings organizationSlug={slug} />
    </div>
  );
}
