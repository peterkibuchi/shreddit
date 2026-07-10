"use client";

import { usePathname, useRouter } from "next/navigation";
import { type Session } from "next-auth";

import { Icons } from "~/components/icons";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { UserAvatar } from "~/components/user-avatar";

interface MiniCreatePostProps {
  session: Session | null;
}

export function MiniCreatePost({ session }: MiniCreatePostProps) {
  const router = useRouter();
  const pathname = usePathname();

  const navToCreatePostPage = () => router.push(pathname + "/submit");

  return (
    <div className="bg overflow-hidden rounded-md bg-secondary shadow-sm">
      <div className="flex h-full justify-between gap-6 px-6 py-4">
        <div className="relative">
          <UserAvatar
            user={{
              name: session?.user.name ?? null,
              image: session?.user.image ?? null,
            }}
          />

          <span className="absolute right-0 bottom-0 h-3 w-3 rounded-full bg-green-500 outline-2 outline-secondary outline-solid" />
        </div>

        <Input
          onClick={navToCreatePostPage}
          readOnly
          placeholder="Create post..."
        />

        <Button onClick={navToCreatePostPage} variant="ghost">
          <Icons.media />
        </Button>
        <Button onClick={navToCreatePostPage} variant="ghost">
          <Icons.link />
        </Button>
      </div>
    </div>
  );
}
