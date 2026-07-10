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

    // Check if user is subscribed or not
    const subscriptionExists = await db.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.subredditId, subredditId),
        eq(subscriptions.userId, session.user.id),
      ),
    });

    if (!subscriptionExists) {
      return new Response(
        "You've not been subscribed to this subreddit, yet.",
        {
          status: 400,
        },
      );
    }

    // If subscribed, unsubscribe user from subreddit
    await db
      .delete(subscriptions)
      .where(
        and(
          eq(subscriptions.subredditId, subredditId),
          eq(subscriptions.userId, session.user.id),
        ),
      );

    return new Response(subredditId);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 400 });
    }

    return new Response(
      "Could not unsubscribe from subreddit at this time. Please try again later",
      { status: 500 },
    );
  }
}
