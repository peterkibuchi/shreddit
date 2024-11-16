import Link from "next/link";

import { CustomFeed, GeneralFeed, Icons } from "~/components";
import { buttonVariants } from "~/components/ui/button";
import { getServerAuthSession } from "~/server/auth";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function Home() {
  const session = await getServerAuthSession();

  return (
    <>
      <h1 className="text-3xl font-bold md:text-4xl">Your feed</h1>
      <div className="grid grid-cols-1 gap-y-4 py-6 md:grid-cols-3 md:gap-x-4">
        {session ? <CustomFeed /> : <GeneralFeed />}

        {/* Shreddit Sidebar */}
        <div className="order-first h-fit overflow-hidden rounded-lg border border-secondary md:order-last">
          <div className="bg-secondary px-6 py-4">
            <p className="flex items-center gap-1.5 py-3 font-semibold">
              <Icons.home className="h-4 w-4" />
              Home
            </p>
          </div>
          <dl className="-my-3 divide-y divide-gray-100 px-6 py-4 text-sm leading-6">
            <div className="flex justify-between gap-x-4 py-3">
              <p className="text-zinc-500">
                Your personal Shreddit frontpage. Come here to check in with
                your favourite communities.
              </p>
            </div>

            <Link
              href={`/r/create`}
              className={buttonVariants({
                className: "mb-6 mt-4 w-full",
              })}
            >
              Create Community
            </Link>
          </dl>
        </div>
      </div>
    </>
  );
}
