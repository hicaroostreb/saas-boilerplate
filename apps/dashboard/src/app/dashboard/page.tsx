import { requireAuth, signOutAction } from '@workspace/auth/server';

export default async function DashboardPage() {
  const session = await requireAuth();

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <form action={signOutAction}>
          <button
            type="submit"
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Sign Out
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">
            Welcome, {session.user?.name ?? session.user?.email}
          </h2>
          <p className="text-gray-600">
            You&aposre successfully authenticated!
          </p>
        </div>
      </div>
    </div>
  );
}
