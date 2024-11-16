"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Comment, CommentVote, User } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";

import { CommentVotes } from "~/components/comments/comment-votes";
import { Icons } from "~/components/icons";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { toast } from "~/components/ui/use-toast";
import { UserAvatar } from "~/components/user-avatar";
import { useOnClickOutside } from "~/hooks/use-on-click-outside";
import { formatTimeToNow } from "~/lib/utils";
import { type CommentRequest } from "~/lib/validators/comment";

type ExtendedComment = Comment & {
  author: User;
  votes: CommentVote[];
};

interface PostCommentProps {
  postId: string;
  comment: ExtendedComment;
  currentVote: CommentVote | undefined;
  voteCount: number;
}

export function PostComment({
  comment,
  currentVote,
  postId,
  voteCount,
}: PostCommentProps) {
  const commentRef = useRef<HTMLDivElement>(null);
  const [isReplying, setIsReplying] = useState(false);
  const [input, setInput] = useState<string>(`@${comment.author.username} `);

  const { data: session } = useSession();
  const router = useRouter();
  useOnClickOutside(commentRef, () => {
    setIsReplying(false);
  });

  const { mutate: submitComment, isLoading } = useMutation({
    mutationFn: async ({ postId, text, replyToId }: CommentRequest) => {
      const payload: CommentRequest = { postId, text, replyToId };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { data } = await axios.patch(
        "/api/subreddit/post/comment",
        payload,
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return data;
    },

    onError: () => {
      return toast({
        title: "Something went wrong.",
        description: "Comment wasn't posted successfully. Please try again.",
        variant: "destructive",
      });
    },

    onSuccess: () => {
      router.refresh();
      setIsReplying(false);
    },
  });

  return (
    <div ref={commentRef} className="flex flex-col">
      <div className="flex items-center">
        <UserAvatar
          className="h-6 w-6"
          user={{
            name: comment.author.name ?? null,
            image: comment.author.image ?? null,
          }}
        />

        <div className="ml-2 flex items-center gap-x-2">
          <p className="text-sm font-medium text-primary">
            u/{comment.author.username}
          </p>

          <p className="max-h-40 truncate text-xs text-zinc-500">
            {formatTimeToNow(new Date(comment.createdAt))}
          </p>
        </div>
      </div>

      <p className="mt-2 text-sm text-primary">{comment.text}</p>

      <div className="flex items-center gap-2">
        {/* flex-wrap */}
        <CommentVotes
          commentId={comment.id}
          currentVote={currentVote}
          voteCount={voteCount}
        />
        <Button
          onClick={() => {
            if (!session) return router.push("/login");
            setIsReplying(true);
          }}
          variant="ghost"
          size="sm"
        >
          <Icons.commentReply className="mr-1.5 h-4 w-4" />
          Reply
        </Button>
      </div>

      {isReplying ? (
        <div className="grid w-full gap-1.5">
          <Label htmlFor="comment">Your comment</Label>
          <div className="mt-2">
            <Textarea
              autoFocus
              id="comment"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={1}
              placeholder="What are your thoughts?"
              onFocus={(e) =>
                e.currentTarget.setSelectionRange(
                  e.currentTarget.value.length,
                  e.currentTarget.value.length,
                )
              }
            />

            <div className="mt-2 flex justify-end gap-2">
              <Button
                tabIndex={-1}
                variant="outline"
                onClick={() => setIsReplying(false)}
              >
                Cancel
              </Button>
              <Button
                isLoading={isLoading}
                onClick={() => {
                  if (!input) return;
                  submitComment({
                    postId,
                    text: input,
                    replyToId: comment.replyToId ?? comment.id, // Default to top-level comment
                  });
                }}
              >
                Post
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
