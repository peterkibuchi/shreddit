import { type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { SubredditValidator } from "~/lib/validators/subreddit";
import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";
import { subreddits, subscriptions } from "~/server/db/schema";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerAuthSession();

    // Check if user is signed in
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const body = await req.json();
    const { name } = SubredditValidator.parse(body);

    // Check if subreddit already exists
    const subredditExists = await db.query.subreddits.findFirst({
      where: eq(subreddits.name, name),
    });

    if (subredditExists) {
      return new Response("Subreddit already exists", { status: 409 });
    }

    // Else, create subreddit, associate it with the user, and subscribe
    // the creator to the subreddit they create
    const subredditName = await db.transaction(async (tx) => {
      const [subreddit] = await tx
        .insert(subreddits)
        .values({ name, creatorId: session.user.id })
        .returning();

      if (!subreddit) throw new Error("Failed to create subreddit");

      await tx.insert(subscriptions).values({
        userId: session.user.id,
        subredditId: subreddit.id,
      });

      return subreddit.name;
    });

    return new Response(subredditName);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 });
    }

    return new Response("Could not create subreddit. Please try again later.", {
      status: 500,
    });
  }
}
