"use client";

import { startTransition } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { useCustomToasts } from "~/hooks/use-custom-toasts";
import { type SubscribeToSubredditPayload } from "~/lib/validators/subreddit";

interface JoinLeaveToggleProps {
  isSubscribed: boolean;
  subredditId: string;
  subredditName: string;
}

export function JoinLeaveToggle({
  isSubscribed,
  subredditId,
  subredditName,
}: JoinLeaveToggleProps) {
  const { loginToast } = useCustomToasts();
  const router = useRouter();

  const { mutate: subscribe, isPending: isSubLoading } = useMutation({
    mutationFn: async () => {
      const payload: SubscribeToSubredditPayload = {
        subredditId,
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { data } = await axios.post("/api/subreddit/subscribe", payload);
      return data as string;
    },

    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        }
      }

      return toast.error("There was a problem.", {
        description: "Something went wrong. Please try again.",
      });
    },

    onSuccess: () => {
      startTransition(() => {
        // Refresh the current route and fetch new data from the server
        // without losing client-side browser or React state.
        router.refresh();
      });
      toast.success("Subscribed!", {
        description: `You are now subscribed to r/${subredditName}`,
      });
    },
  });

  const { mutate: unsubscribe, isPending: isUnsubLoading } = useMutation({
    mutationFn: async () => {
      const payload: SubscribeToSubredditPayload = {
        subredditId,
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { data } = await axios.post("/api/subreddit/unsubscribe", payload);
      return data as string;
    },
    onError: (err: AxiosError) => {
      toast.error("Error", {
        description: err.response?.data as string,
      });
    },
    onSuccess: () => {
      startTransition(() => {
        // Refresh the current route and fetch new data from the server without
        // losing client-side browser or React state.
        router.refresh();
      });
      toast.success("Unsubscribed!", {
        description: `You are now unsubscribed from/${subredditName}`,
      });
    },
  });

  return isSubscribed ? (
    <Button
      className="mt-1 mb-4 w-full"
      isLoading={isUnsubLoading}
      onClick={() => unsubscribe()}
    >
      Leave Community
    </Button>
  ) : (
    <Button
      className="mt-1 mb-4 w-full"
      isLoading={isSubLoading}
      onClick={() => subscribe()}
    >
      Join Community
    </Button>
  );
}
