import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";

import { MiniCreatePost, PostFeed } from "~/components";
import { INFINITE_SCROLL_PAGINATION_RESULTS } from "~/config";
import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";
import { posts, subreddits } from "~/server/db/schema";

interface SubredditPageProps {
  params: Promise<{ slug: string }>;
}

export default async function SubredditPage({ params }: SubredditPageProps) {
  const { slug } = await params;

  const session = await getServerAuthSession();

  const subreddit = await db.query.subreddits.findFirst({
    where: eq(subreddits.name, slug),
    with: {
      posts: {
        with: {
          author: {
            // Never expose author email/emailVerified to the client
            columns: { id: true, name: true, username: true, image: true },
          },
          comments: true,
          subreddit: true,
          votes: true,
        },
        orderBy: desc(posts.createdAt),
        limit: INFINITE_SCROLL_PAGINATION_RESULTS,
      },
    },
  });

  if (!subreddit) return notFound();

  return (
    <>
      <h1 className="h-14 text-3xl font-bold md:text-4xl">
        r/{subreddit.name}
      </h1>
      <MiniCreatePost session={session} />
      <PostFeed initialPosts={subreddit.posts} subredditName={subreddit.name} />
    </>
  );
}
