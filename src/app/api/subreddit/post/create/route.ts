/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { type NextRequest } from "next/server";
import { z } from "zod";

import { PostValidator } from "~/lib/validators/post";
import { getServerAuthSession } from "~/server/auth";
import { prisma } from "~/server/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { content, subredditId, title } = PostValidator.parse(body);

    const session = await getServerAuthSession();

    // Check if user is signed in
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Verify that user is subscribed to passed subreddit id
    const subscription = await prisma.subscription.findFirst({
      where: {
        subredditId,
        userId: session.user.id,
      },
    });

    if (!subscription) {
      return new Response(
        "You need to be a member of this Community to post here",
        { status: 403 },
      );
    }

    await prisma.post.create({
      data: {
        authorId: session.user.id,
        content,
        subredditId,
        title,
      },
    });

    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 400 });
    }

    return new Response("Could not post to subreddit. Please try again later", {
      status: 500,
    });
  }
}
