import { CreateComment } from "~/components/comments/create-comment";
import { PostComment } from "~/components/comments/post-comment";
import { getServerAuthSession } from "~/server/auth";
import { prisma } from "~/server/db";

interface CommentsSectionProps {
  postId: string;
}

export async function CommentSection({ postId }: CommentsSectionProps) {
  const session = await getServerAuthSession();

  const comments = await prisma.comment.findMany({
    where: {
      postId: postId,
      replyToId: null, // Only fetch top-level comments
    },
    include: {
      author: true,
      votes: true,
      replies: {
        // First-level replies
        include: {
          author: true,
          votes: true,
        },
      },
    },
  });

  return (
    <div className="mt-4 flex flex-col gap-y-4">
      <hr className="my-6 h-px w-full" />

      <CreateComment postId={postId} />

      <div className="mt-4 flex flex-col gap-y-6">
        {comments
          .filter((comment) => !comment.replyToId)
          .map((topLevelComment) => {
            const topLevelCommentVoteCount = topLevelComment.votes.reduce(
              (acc, vote) => {
                if (vote.type === "UP") return acc + 1;
                if (vote.type === "DOWN") return acc - 1;
                return acc;
              },
              0,
            );

            const topLevelCommentVote = topLevelComment.votes.find(
              (vote) => vote.userId === session?.user.id,
            );

            return (
              <div key={topLevelComment.id} className="flex flex-col">
                {/* Render top-level comments */}
                <div className="mb-2">
                  <PostComment
                    postId={postId}
                    comment={topLevelComment}
                    currentVote={topLevelCommentVote}
                    voteCount={topLevelCommentVoteCount}
                  />
                </div>

                {/* Render replies */}
                {topLevelComment.replies
                  .sort((a, b) => b.votes.length - a.votes.length) // Sort replies by most liked/disliked
                  .map((reply) => {
                    const replyVoteCount = reply.votes.reduce((acc, vote) => {
                      if (vote.type === "UP") return acc + 1;
                      if (vote.type === "DOWN") return acc - 1;
                      return acc;
                    }, 0);

                    const replyVote = reply.votes.find(
                      (vote) => vote.userId === session?.user.id,
                    );

                    return (
                      <div
                        key={reply.id}
                        className="ml-2 border-l-2 border-zinc-200 py-2 pl-4"
                      >
                        <PostComment
                          postId={postId}
                          comment={reply}
                          currentVote={replyVote}
                          voteCount={replyVoteCount}
                        />
                      </div>
                    );
                  })}
              </div>
            );
          })}
      </div>
    </div>
  );
}
