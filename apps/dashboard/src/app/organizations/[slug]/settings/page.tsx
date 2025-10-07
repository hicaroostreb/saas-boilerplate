interface SettingsPageProps {
  params: {
    slug: string;
  };
}

export default function SettingsPage({ params }: SettingsPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Organization Settings</h1>
        <p className="text-gray-600">Manage your organization settings and preferences.</p>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">General Settings</h2>
        <p className="text-gray-600">Organization settings for {params.slug}</p>
      </div>
    </div>
  );
}
