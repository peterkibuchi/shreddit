"use client";

import { useEffect, useState } from "react";
import { usePrevious } from "@mantine/hooks";
import { type VoteType } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

import { Icons } from "~/components/icons";
import { Button } from "~/components/ui/button";
import { toast } from "~/components/ui/use-toast";
import { useCustomToasts } from "~/hooks/use-custom-toasts";
import { cn } from "~/lib/utils";
import { type PostVoteRequest } from "~/lib/validators/vote";

interface PostVoteClientProps {
  postId: string;
  initialVoteCount: number;
  userInitialVote?: VoteType | null;
}

export function PostVoteClient({
  postId,
  initialVoteCount,
  userInitialVote,
}: PostVoteClientProps) {
  const [voteCount, setVoteCount] = useState<number>(initialVoteCount);
  const [currentVote, setCurrentVote] = useState(userInitialVote);
  const prevVote = usePrevious(currentVote);
  const { loginToast } = useCustomToasts();

  // Ensure client component is in sync with server after `userInitialVote` is populated
  useEffect(() => {
    setCurrentVote(userInitialVote);
  }, [userInitialVote]);

  const { mutate: vote } = useMutation({
    mutationFn: async (voteType: VoteType) => {
      const payload: PostVoteRequest = { postId, voteType };

      await axios.patch("/api/subreddit/post/vote", payload);
    },

    onError: (err, voteType) => {
      if (voteType === "UP") setVoteCount((prev) => prev - 1);
      else setVoteCount((prev) => prev + 1);

      // reset current vote
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

    onMutate: (voteType) => {
      if (currentVote === voteType) {
        // User is voting the same way again, so remove their vote
        setCurrentVote(undefined);
        if (voteType === "UP") setVoteCount((prev) => prev - 1);
        else if (voteType === "DOWN") setVoteCount((prev) => prev + 1);
      } else {
        // User is voting in the opposite direction, so subtract 2
        setCurrentVote(voteType);
        if (voteType === "UP")
          setVoteCount((prev) => prev + (currentVote ? 2 : 1));
        else if (voteType === "DOWN")
          setVoteCount((prev) => prev - (currentVote ? 2 : 1));
      }
    },
  });

  return (
    <div className="flex flex-col gap-4 pb-4 pr-6 sm:w-20 sm:gap-0 sm:pb-0">
      {/* upvote */}
      <Button
        onClick={() => vote("UP")}
        size="sm"
        variant="ghost"
        aria-label="upvote"
      >
        <Icons.upvote
          className={cn("h-5 w-5 text-secondary-foreground", {
            "fill-emerald-500 text-emerald-500": currentVote === "UP",
          })}
        />
      </Button>

      {/* score */}
      <p className="py-2 text-center text-sm font-medium text-secondary-foreground">
        {voteCount}
      </p>

      {/* downvote */}
      <Button
        onClick={() => vote("DOWN")}
        size="sm"
        className={cn({
          "text-emerald-500": currentVote === "DOWN",
        })}
        variant="ghost"
        aria-label="downvote"
      >
        <Icons.downvote
          className={cn("h-5 w-5 text-secondary-foreground", {
            "fill-red-500 text-red-500": currentVote === "DOWN",
          })}
        />
      </Button>
    </div>
  );
}
