import { type NextRequest } from "next/server";
import { desc, eq, inArray, type SQL } from "drizzle-orm";
import { z } from "zod";

import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";
import { posts, subreddits, subscriptions } from "~/server/db/schema";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);

  const session = await getServerAuthSession();

  let joinedCommunitiesIds: string[] = [];

  if (session) {
    const joinedCommunities = await db.query.subscriptions.findMany({
      where: eq(subscriptions.userId, session.user.id),
    });

    joinedCommunitiesIds = joinedCommunities.map((sub) => sub.subredditId);
  }

  try {
    const { limit, page, subredditName } = z
      .object({
        limit: z.string(),
        page: z.string(),
        subredditName: z.string().nullish().optional(),
      })
      .parse({
        subredditName: url.searchParams.get("subredditName"),
        limit: url.searchParams.get("limit"),
        page: url.searchParams.get("page"),
      });

    let whereClause: SQL | undefined = undefined;

    // Check if user is browsing a specific subreddit, and if not, whether
    // they're logged in (show custom feed) or not (show generic feed)
    if (subredditName) {
      const subreddit = await db.query.subreddits.findFirst({
        where: eq(subreddits.name, subredditName),
      });

      if (!subreddit) return new Response(JSON.stringify([]));

      whereClause = eq(posts.subredditId, subreddit.id);
    } else if (session) {
      if (joinedCommunitiesIds.length === 0) {
        return new Response(JSON.stringify([]));
      }

      whereClause = inArray(posts.subredditId, joinedCommunitiesIds);
    }

    const results = await db.query.posts.findMany({
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit), // Skip should start from 0 for page 1
      orderBy: desc(posts.createdAt),
      with: {
        subreddit: true,
        votes: true,
        author: {
          // Never expose author email/emailVerified to the client
          columns: { id: true, name: true, username: true, image: true },
        },
        comments: true,
      },
      where: whereClause,
    });

    return new Response(JSON.stringify(results));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 400 });
    }

    return new Response("Could not fetch posts. Please try again later", {
      status: 500,
    });
  }
}
