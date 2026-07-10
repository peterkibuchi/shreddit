import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { and, eq } from "drizzle-orm";

import { JoinLeaveToggle, ToFeedButton } from "~/components";
import { buttonVariants } from "~/components/ui/button";
import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";
import { subreddits, subscriptions } from "~/server/db/schema";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function Layout({ children, params }: LayoutProps) {
  const { slug } = await params;

  const session = await getServerAuthSession();

  const subreddit = await db.query.subreddits.findFirst({
    where: eq(subreddits.name, slug),
  });

  if (!subreddit) return notFound();

  const subscription = !session?.user
    ? undefined
    : await db.query.subscriptions.findFirst({
        where: and(
          eq(subscriptions.subredditId, subreddit.id),
          eq(subscriptions.userId, session.user.id),
        ),
      });

  const isSubscribed = !!subscription;

  const memberCount = await db.$count(
    subscriptions,
    eq(subscriptions.subredditId, subreddit.id),
  );

  return (
    <div className="mx-auto h-full max-w-7xl pt-12 sm:container">
      <div>
        <ToFeedButton />

        <div className="grid grid-cols-1 gap-y-4 py-6 md:grid-cols-3 md:gap-x-4">
          <ul className="col-span-2 flex flex-col space-y-6">{children}</ul>

          {/* Info Sidebar */}
          <div className="order-first h-fit overflow-hidden rounded-lg border border-secondary text-gray-500 md:order-last dark:text-gray-400">
            <div className="bg-secondary px-6 py-4">
              <p className="py-3 font-semibold text-secondary-foreground">
                About r/{subreddit.name}
              </p>
            </div>

            <dl className="divide-y divide-secondary px-6 py-4 text-sm leading-6">
              <div className="flex justify-between gap-x-4 py-3">
                <dt>Created</dt>
                <dd>
                  <time dateTime={subreddit.createdAt.toDateString()}>
                    {format(subreddit.createdAt, "MMMM d, yyyy")}
                  </time>
                </dd>
              </div>

              <div className="flex justify-between gap-x-4 py-3">
                <dt>Members</dt>
                <dd className="flex items-start gap-x-2">
                  <div>{memberCount}</div>
                </dd>
              </div>

              {subreddit.creatorId === session?.user?.id ? (
                <div className="flex justify-between gap-x-4 py-3">
                  <dt>You created this community</dt>
                </div>
              ) : null}

              {subreddit.creatorId !== session?.user?.id ? (
                <JoinLeaveToggle
                  isSubscribed={isSubscribed}
                  subredditId={subreddit.id}
                  subredditName={subreddit.name}
                />
              ) : null}

              <Link
                href={`${slug}/submit`}
                className={buttonVariants({
                  variant: "secondary",
                  className:
                    "mb-8 w-full text-secondary-foreground hover:backdrop-brightness-100",
                })}
              >
                Create Post
              </Link>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
