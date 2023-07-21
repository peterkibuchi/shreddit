import Link from "next/link";

import { Icons } from "~/components/icons";
import { ModeToggle } from "~/components/mode-toggle";
import { buttonVariants } from "~/components/ui/button";
import { UserAccountNav } from "~/components/user-account-nav";
import { getServerAuthSession } from "~/server/auth";

export async function Navbar() {
  const session = await getServerAuthSession();

  return (
    <div className="fixed inset-x-0 top-0 z-[10] h-fit border-b bg-inherit py-2">
      <div className="container mx-auto flex h-full max-w-7xl items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-2">
          <Icons.logo className="h-8 w-8 sm:h-6 sm:w-6" />
          <span className="hidden text-sm font-medium md:block">Shreddit</span>
        </Link>

        <div className="flex justify-between gap-2">
          <ModeToggle />

          {session?.user ? (
            <UserAccountNav user={session.user} />
          ) : (
            <Link href="/login" className={buttonVariants()}>
              Sign In
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
