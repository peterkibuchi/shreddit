import { desc } from "drizzle-orm";

import { PostFeed } from "~/components/post/post-feed";
import { INFINITE_SCROLL_PAGINATION_RESULTS } from "~/config";
import { db } from "~/server/db";
import { posts } from "~/server/db/schema";

export async function GeneralFeed() {
  const initialPosts = await db.query.posts.findMany({
    orderBy: desc(posts.createdAt),
    with: {
      votes: true,
      author: true,
      comments: true,
      subreddit: true,
    },
    limit: INFINITE_SCROLL_PAGINATION_RESULTS, // 4 to demonstrate infinite scroll, should be higher in production
  });

  return <PostFeed initialPosts={initialPosts} />;
}
