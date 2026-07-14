import { LogoutButton } from "@/components/logout-button";
import { getCurrentUser, verifySession } from "@/lib/auth/dal";

export default async function DashboardPage() {
  await verifySession();
  const user = await getCurrentUser();

  return (
    <main className="mx-auto w-full max-w-screen-2xl px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-2xl">
            Welcome{user?.name ? `, ${user.name}` : ""}
          </h1>
          <p className="text-muted-foreground text-sm">
            You are signed in as {user?.email}.
          </p>
        </div>
        <LogoutButton />
      </div>
    </main>
  );
}
