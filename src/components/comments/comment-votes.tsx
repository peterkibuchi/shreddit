"use client";

import { useState } from "react";
import { usePrevious } from "@mantine/hooks";
import type { CommentVote, VoteType } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

import { Icons } from "~/components/icons";
import { Button } from "~/components/ui/button";
import { toast } from "~/components/ui/use-toast";
import { useCustomToasts } from "~/hooks/use-custom-toasts";
import { cn } from "~/lib/utils";
import { type CommentVoteRequest } from "~/lib/validators/vote";

type PartialVote = Pick<CommentVote, "type">;

interface CommentVotesProps {
  commentId: string;
  currentVote?: PartialVote;
  voteCount: number;
}

export function CommentVotes({
  commentId,
  currentVote: _currentVote,
  voteCount: _voteCount,
}: CommentVotesProps) {
  const [voteCount, setvoteCount] = useState<number>(_voteCount);
  const [currentVote, setCurrentVote] = useState<PartialVote | undefined>(
    _currentVote,
  );

  const { loginToast } = useCustomToasts();
  const prevVote = usePrevious(currentVote);

  const { mutate: vote } = useMutation({
    mutationFn: async (type: VoteType) => {
      const payload: CommentVoteRequest = {
        voteType: type,
        commentId,
      };

      await axios.patch("/api/subreddit/post/comment/vote", payload);
    },

    onError: (err, voteType) => {
      if (voteType === "UP") setvoteCount((prev) => prev - 1);
      else setvoteCount((prev) => prev + 1);

      // Reset current vote
      setCurrentVote(prevVote);

      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        }
      }

      return toast({
        title: "Something went wrong.",
        description: "Your vote was not registered. Please try again.",
        variant: "destructive",
      });
    },

    onMutate: (type: VoteType) => {
      if (currentVote?.type === type) {
        // User is voting the same way again, so remove their vote
        setCurrentVote(undefined);

        if (type === "UP") setvoteCount((prev) => prev - 1);
        else if (type === "DOWN") setvoteCount((prev) => prev + 1);
      } else {
        // User is voting in the opposite direction, so subtract 2
        setCurrentVote({ type });

        if (type === "UP") setvoteCount((prev) => prev + (currentVote ? 2 : 1));
        else if (type === "DOWN")
          setvoteCount((prev) => prev - (currentVote ? 2 : 1));
      }
    },
  });

  return (
    <div className="flex gap-1">
      {/* Upvote */}
      <Button
        onClick={() => vote("UP")}
        size="sm"
        variant="ghost"
        aria-label="upvote"
      >
        <Icons.upvote
          className={cn("h-5 w-5 text-secondary-foreground", {
            "fill-emerald-500 text-emerald-500": currentVote?.type === "UP",
          })}
        />
      </Button>

      {/* Votes */}
      <p className="px-1 py-2 text-center text-xs font-medium text-secondary-foreground">
        {voteCount}
      </p>

      {/* Downvote */}
      <Button
        onClick={() => vote("DOWN")}
        size="sm"
        className={cn({
          "text-emerald-500": currentVote?.type === "DOWN",
        })}
        variant="ghost"
        aria-label="downvote"
      >
        <Icons.downvote
          className={cn("h-5 w-5 text-secondary-foreground", {
            "fill-red-500 text-red-500": currentVote?.type === "DOWN",
          })}
        />
      </Button>
    </div>
  );
}
