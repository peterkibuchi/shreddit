import { type NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { SubredditSubscriptionValidator } from "~/lib/validators/subreddit";
import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";
import { subscriptions } from "~/server/db/schema";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerAuthSession();

    // Check if user is signed in
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const body = await req.json();
    const { subredditId } = SubredditSubscriptionValidator.parse(body);

    // Check if user is already subscribed to subreddit
    const subscriptionExists = await db.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.subredditId, subredditId),
        eq(subscriptions.userId, session.user.id),
      ),
    });

    if (subscriptionExists) {
      return new Response("You've already subscribed to this subreddit", {
        status: 400,
      });
    }

    // Else, create subscription and associate it with the user
    await db.insert(subscriptions).values({
      subredditId,
      userId: session.user.id,
    });

    return new Response(subredditId);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 400 });
    }

    return new Response(
      "Could not subscribe to subreddit at this time. Please try again later",
      { status: 500 },
    );
  }
}
