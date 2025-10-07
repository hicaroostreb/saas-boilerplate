interface SettingsPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { slug } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Organization Settings
        </h1>
        <p className="text-gray-600">
          Manage your organization settings and preferences.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          General Settings
        </h2>
        <p className="text-gray-600">Organization settings for {slug}</p>
      </div>
    </div>
  );
}
