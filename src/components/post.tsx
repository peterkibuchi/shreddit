import { useRef } from "react";
import Link from "next/link";
import type { Post, User, Vote } from "@prisma/client";

import { EditorOutput } from "~/components/editor-output";
import { Icons } from "~/components/icons";
import { PostVoteClient } from "~/components/post-vote/post-vote-client";
import { formatTimeToNow } from "~/lib/utils";

type PartialVote = Pick<Vote, "type">;

interface PostProps {
  post: Post & {
    author: User;
    votes: Vote[];
  };
  voteCount: number;
  subredditName: string;
  currentVote?: PartialVote;
  commentCount: number;
}

export function Post({
  post,
  voteCount,
  currentVote,
  subredditName,
  commentCount,
}: PostProps) {
  const postRef = useRef<HTMLParagraphElement>(null);

  return (
    <div className="rounded-md bg-card shadow">
      <div className="flex justify-between px-6 py-4">
        <PostVoteClient
          postId={post.id}
          initialVoteCount={voteCount}
          userInitialVote={currentVote?.type}
        />

        <div className="w-0 flex-1">
          <div className="mt-1 max-h-40 text-xs text-muted-foreground">
            {subredditName ? (
              <>
                <a
                  className="text-sm text-secondary-foreground underline underline-offset-2"
                  href={`/r/${subredditName}`}
                >
                  r/{subredditName}
                </a>
                <span className="px-1">•</span>
              </>
            ) : null}
            <span>Posted by u/{post.author.username}</span>{" "}
            {formatTimeToNow(new Date(post.createdAt))}
          </div>

          <a href={`/r/${subredditName}/post/${post.id}`}>
            <h1 className="py-2 text-lg font-semibold leading-6 text-secondary-foreground">
              {post.title}
            </h1>
          </a>

          <div
            className="relative max-h-40 w-full overflow-clip text-sm"
            ref={postRef}
          >
            <EditorOutput content={post.content} />

            {postRef.current?.clientHeight === 160 ? (
              // Blur bottom if content is too long
              <div className="absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-secondary to-transparent"></div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="z-20 bg-secondary px-4 py-4 text-sm sm:px-6">
        <Link
          href={`/r/${subredditName}/post/${post.id}`}
          className="flex w-fit items-center gap-2"
        >
          <Icons.commentReply className="h-4 w-4" /> {commentCount} comments
        </Link>
      </div>
    </div>
  );
}
