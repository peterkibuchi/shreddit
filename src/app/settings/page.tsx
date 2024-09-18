import { redirect } from "next/navigation";

import { UsernameForm } from "~/components";
import { authOptions, getServerAuthSession } from "~/server/auth";

export const metadata = {
  description: "Manage account and website settings.",
};

export default async function SettingsPage() {
  const session = await getServerAuthSession();

  if (!session?.user) {
    redirect(authOptions?.pages?.signIn ?? "/login");
  }

  return (
    <div className="mx-auto max-w-4xl py-12">
      <div className="grid items-start gap-8">
        <h1 className="text-3xl font-bold md:text-4xl">Settings</h1>

        <div className="grid gap-10">
          <UsernameForm
            user={{
              id: session.user.id,
              username: session.user.username ?? "",
            }}
          />
        </div>
      </div>
    </div>
  );
}
