"use client";

import { useEffect, useRef } from "react";
import { useIntersection } from "@mantine/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";

import { Icons } from "~/components/icons";
import { Post } from "~/components/post";
import { INFINITE_SCROLL_PAGINATION_RESULTS } from "~/config";
import { type ExtendedPost } from "~/types/db";

interface PostFeedProps {
  initialPosts: ExtendedPost[];
  subredditName?: string;
}

export function PostFeed({ initialPosts, subredditName }: PostFeedProps) {
  const lastPostRef = useRef<HTMLElement>(null);
  const { ref, entry } = useIntersection({
    root: lastPostRef.current,
    threshold: 1,
  });
  const { data: session } = useSession();

  const { data, fetchNextPage, isFetchingNextPage } = useInfiniteQuery(
    ["infinite-query"],

    async ({ pageParam = 1 }) => {
      const query =
        `/api/posts?limit=${INFINITE_SCROLL_PAGINATION_RESULTS}&page=${pageParam}` +
        (!!subredditName ? `&subredditName=${subredditName}` : "");

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { data } = await axios.get(query);
      return data as ExtendedPost[];
    },

    {
      getNextPageParam: (_, pages) => {
        return pages.length + 1;
      },
      initialData: { pages: [initialPosts], pageParams: [1] },
    },
  );

  useEffect(() => {
    if (entry?.isIntersecting) {
      void fetchNextPage(); // Load more posts when the last post comes into view
    }
  }, [entry, fetchNextPage]);

  const posts = data?.pages.flatMap((page) => page) ?? initialPosts;

  return (
    <div className="col-span-2 flex flex-col space-y-6">
      {posts.map((post, index) => {
        const voteCount = post.votes.reduce((acc, vote) => {
          if (vote.type === "UP") return acc + 1;
          if (vote.type === "DOWN") return acc - 1;
          return acc;
        }, 0);

        const currentVote = post.votes.find(
          (vote) => vote.userId === session?.user.id,
        );

        return index === posts.length - 1 ? (
          // Add a ref to the last post in the list
          <div key={post.id} ref={ref}>
            <Post
              post={post}
              commentCount={post.comments.length}
              subredditName={post.subreddit.name}
              voteCount={voteCount}
              currentVote={currentVote}
            />
          </div>
        ) : (
          <div key={post.id}>
            <Post
              post={post}
              commentCount={post.comments.length}
              subredditName={post.subreddit.name}
              voteCount={voteCount}
              currentVote={currentVote}
            />
          </div>
        );
      })}

      {isFetchingNextPage && (
        <div className="flex justify-center">
          <Icons.spinner className="h-6 w-6 animate-spin text-zinc-500" />
        </div>
      )}
    </div>
  );
}
