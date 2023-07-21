import { type NextRequest } from "next/server";
import { z } from "zod";

import { SubredditValidator } from "~/lib/validators/subreddit";
import { getServerAuthSession } from "~/server/auth";
import { prisma } from "~/server/db";

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
    const subredditExists = await prisma.subreddit.findFirst({
      where: { name },
    });

    if (subredditExists) {
      return new Response("Subreddit already exists", { status: 409 });
    }

    // Else, create subreddit and associate it with the user
    const subreddit = await prisma.subreddit.create({
      data: {
        name,
        creatorId: session.user.id,
      },
    });

    // Subscribe creator to be the subreddit they create
    await prisma.subscription.create({
      data: {
        userId: session.user.id,
        subredditId: subreddit.id,
      },
    });

    return new Response(subreddit.name);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 });
    }

    return new Response("Could not create subreddit. Please try again later.", {
      status: 500,
    });
  }
}
