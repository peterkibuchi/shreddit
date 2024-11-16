import { z } from "zod";

import { CommentValidator } from "~/lib/validators/comment";
import { getServerAuthSession } from "~/server/auth";
import { prisma } from "~/server/db";

export async function PATCH(req: Request) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const body = await req.json();

    const { postId, text, replyToId } = CommentValidator.parse(body);

    const session = await getServerAuthSession();

    // Check if user is signed in
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Create a new vote
    await prisma.comment.create({
      data: {
        postId,
        text,
        authorId: session.user.id,
        replyToId,
      },
    });

    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 400 });
    }

    return new Response(
      "Could not create your comment at this time. Please try again later",
      { status: 500 },
    );
  }
}
