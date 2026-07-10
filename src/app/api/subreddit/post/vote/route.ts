import { type NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { redis } from "~/lib/redis";
import { PostVoteValidator } from "~/lib/validators/vote";
import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";
import { posts, votes, type Vote } from "~/server/db/schema";
import { type CachedPost } from "~/types/redis";

const TRIGGER_CACHE_UPVOTE_THRESHOLD = 1;

function countVotes(postVotes: Vote[]) {
  return postVotes.reduce((acc, vote) => {
    if (vote.type === "UP") return acc + 1;
    if (vote.type === "DOWN") return acc - 1;
    return acc;
  }, 0);
}

export async function PATCH(req: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const body = await req.json();

    const { postId, voteType } = PostVoteValidator.parse(body);

    const session = await getServerAuthSession();

    // Check if user is signed in
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Check if user has already voted on this post
    const existingVote = await db.query.votes.findFirst({
      where: and(eq(votes.userId, session.user.id), eq(votes.postId, postId)),
    });

    const post = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
      with: {
        author: true,
        votes: true,
      },
    });

    if (!post) {
      return new Response("Post not found", { status: 404 });
    }

    const cachePost = async (currentVote: CachedPost["currentVote"]) => {
      // Recount the votes
      const votesAmt = countVotes(post.votes);

      if (votesAmt >= TRIGGER_CACHE_UPVOTE_THRESHOLD) {
        const cachePayload: CachedPost = {
          authorUsername: post.author.username ?? "",
          content: JSON.stringify(post.content),
          id: post.id,
          title: post.title,
          currentVote,
          createdAt: post.createdAt,
        };

        await redis.hset(`post:${postId}`, cachePayload); // Store the post data as a hash
      }
    };

    if (existingVote) {
      // If vote type is the same as existing vote, delete the vote
      if (existingVote.type === voteType) {
        await db
          .delete(votes)
          .where(
            and(eq(votes.userId, session.user.id), eq(votes.postId, postId)),
          );

        await cachePost(null);

        return new Response("OK");
      }

      // If vote type is different, update the vote
      await db
        .update(votes)
        .set({ type: voteType })
        .where(
          and(eq(votes.userId, session.user.id), eq(votes.postId, postId)),
        );

      await cachePost(voteType);

      return new Response("OK");
    }

    // If no existing vote, create a new vote
    await db.insert(votes).values({
      type: voteType,
      userId: session.user.id,
      postId,
    });

    await cachePost(voteType);

    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 400 });
    }

    return new Response(
      "Could not post your vote at this time. Please try again later",
      { status: 500 },
    );
  }
}
