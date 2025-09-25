import { requireAuth } from "@workspace/auth";
import { signOutAction } from "../actions/auth/sign-out";

export default async function DashboardHome() {
  const session = await requireAuth();
  
  // Safe action wrapper para form
  async function handleSignOut() {
    "use server";
    await signOutAction({}); // Passar objeto vazio (schema vazio)
  }
  
  return (
    <main className="container mx-auto py-8">
      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session.user?.name ?? session.user?.email}!
          </p>
        </header>
        
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Session Info</h2>
          <div className="space-y-2 text-sm">
            <p><strong>User ID:</strong> {session.user?.id}</p>
            <p><strong>Email:</strong> {session.user?.email}</p>
            <p><strong>Name:</strong> {session.user?.name}</p>
            <p><strong>Role:</strong> {session.user?.role ?? 'user'}</p>
          </div>
        </div>
        
        <form action={handleSignOut}>
          <button 
            type="submit"
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
          >
            Sign Out
          </button>
        </form>
      </div>
    </main>
  );
}
