"use client";

import { type Session } from "next-auth";
import { usePathname, useRouter } from "next/navigation";

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

  return (
    <div className="bg overflow-hidden rounded-md bg-secondary shadow">
      <div className="flex h-full justify-between gap-6 px-6 py-4">
        <div className="relative">
          <UserAvatar
            user={{
              name: session?.user.name || null,
              image: session?.user.image || null,
            }}
          />

          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 outline outline-2 outline-secondary" />
        </div>

        <Input
          onClick={() => router.push(pathname + "/submit")}
          readOnly
          placeholder="Create post..."
        />
        <Button
          onClick={() => router.push(pathname + "/submit")}
          variant="ghost"
        >
          <Icons.media />
        </Button>
        <Button
          onClick={() => router.push(pathname + "/submit")}
          variant="ghost"
        >
          <Icons.link />
        </Button>
      </div>
    </div>
  );
}
