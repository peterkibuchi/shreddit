import { notFound } from "next/navigation";
import type { Post, Vote } from "@prisma/client";

import { PostVoteClient } from "~/components/post-vote/post-vote-client";
import { getServerAuthSession } from "~/server/auth";

interface PostVoteServerProps {
  postId: string;
  initialVoteCount?: number;
  initialVote?: Vote["type"] | null;
  getData?: () => Promise<(Post & { votes: Vote[] }) | null>;
}

export async function PostVoteServer({
  getData,
  postId,
  initialVote,
  initialVoteCount,
}: PostVoteServerProps) {
  const session = await getServerAuthSession();

  let voteCount: number = 0;
  let currentVote: Vote["type"] | null | undefined = undefined;

  if (getData) {
    // Fetch post data in component
    const post = await getData();
    if (!post) return notFound();

    voteCount = post.votes.reduce((acc, vote) => {
      if (vote.type === "UP") return acc + 1;
      if (vote.type === "DOWN") return acc - 1;
      return acc;
    }, 0);

    currentVote = post.votes.find(
      (vote) => vote.userId === session?.user?.id,
    )?.type;
  } else {
    // Passed as props if we already have the data, otherwise
    // the `getData` function is passed and invoked above
    voteCount = initialVoteCount!;
    currentVote = initialVote;
  }

  return (
    <PostVoteClient
      postId={postId}
      initialVote={currentVote}
      initialVoteCount={voteCount}
    />
  );
}
