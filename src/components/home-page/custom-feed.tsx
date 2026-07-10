import { notFound } from "next/navigation";
import { desc, eq, inArray } from "drizzle-orm";

import { PostFeed } from "~/components/post/post-feed";
import { INFINITE_SCROLL_PAGINATION_RESULTS } from "~/config";
import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";
import { posts as postsTable, subscriptions } from "~/server/db/schema";

export async function CustomFeed() {
  const session = await getServerAuthSession();

  // Only rendered if session exists, so this will not happen
  if (!session) return notFound();

  const followedCommunities = await db.query.subscriptions.findMany({
    where: eq(subscriptions.userId, session.user.id),
  });

  const followedCommunityIds = followedCommunities.map(
    (sub) => sub.subredditId,
  );

  const posts =
    followedCommunityIds.length === 0
      ? []
      : await db.query.posts.findMany({
          where: inArray(postsTable.subredditId, followedCommunityIds),
          orderBy: desc(postsTable.createdAt),
          with: {
            votes: true,
            author: true,
            comments: true,
            subreddit: true,
          },
          limit: INFINITE_SCROLL_PAGINATION_RESULTS,
        });

  return <PostFeed initialPosts={posts} />;
}
