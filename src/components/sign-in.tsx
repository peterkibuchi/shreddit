import Link from "next/link";

import { Icons } from "~/components/icons";
import { UserAuthForm } from "~/components/user-auth-form";

export function SignIn() {
  return (
    <div className="container mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
      <div className="flex flex-col space-y-2 text-center">
        <Icons.logo className="mx-auto h-6 w-6" />
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mx-auto max-w-xs text-sm">Pick up where you left off.</p>
      </div>

      <UserAuthForm />

      <p className="px-8 text-center text-sm text-muted-foreground">
        New to Shreddit?{" "}
        <Link
          href="/register"
          className="hover:text-brand text-sm underline underline-offset-4"
        >
          Sign Up
        </Link>
      </p>
    </div>
  );
}
