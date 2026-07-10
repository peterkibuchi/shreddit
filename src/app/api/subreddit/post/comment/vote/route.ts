import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { CommentVoteValidator } from "~/lib/validators/vote";
import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";
import { commentVotes } from "~/server/db/schema";

export async function PATCH(req: Request) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const body = await req.json();

    const { commentId, voteType } = CommentVoteValidator.parse(body);

    const session = await getServerAuthSession();

    // Check if user is signed in
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Check if user has already voted on this comment
    const existingVote = await db.query.commentVotes.findFirst({
      where: and(
        eq(commentVotes.userId, session.user.id),
        eq(commentVotes.commentId, commentId),
      ),
    });

    if (existingVote) {
      // If vote type is the same as existing vote, delete the vote
      if (existingVote.type === voteType) {
        await db
          .delete(commentVotes)
          .where(
            and(
              eq(commentVotes.userId, session.user.id),
              eq(commentVotes.commentId, commentId),
            ),
          );

        return new Response("OK");
      } else {
        // If vote type is different, update the vote
        await db
          .update(commentVotes)
          .set({ type: voteType })
          .where(
            and(
              eq(commentVotes.userId, session.user.id),
              eq(commentVotes.commentId, commentId),
            ),
          );

        return new Response("OK");
      }
    }

    // If no existing vote, create a new vote
    await db.insert(commentVotes).values({
      type: voteType,
      userId: session.user.id,
      commentId,
    });

    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 400 });
    }

    return new Response(
      "Could not create your vote at this time. Please try again later",
      { status: 500 },
    );
  }
}
