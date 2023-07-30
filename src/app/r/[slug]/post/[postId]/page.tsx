import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Post, User, Vote } from "@prisma/client";

import { CommentSection, Icons, PostVoteServer } from "~/components";
import { EditorOutput } from "~/components/editor-output";
import { buttonVariants } from "~/components/ui/button";
import { redis } from "~/lib/redis";
import { formatTimeToNow } from "~/lib/utils";
import { prisma } from "~/server/db";
import { type CachedPost } from "~/types/redis";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

interface PostDetailPageProps {
  params: {
    postId: string;
  };
}

function PostVoteShell() {
  return (
    <div className="flex w-20 flex-col items-center pr-6">
      {/* Upvote */}
      <div className={buttonVariants({ variant: "ghost" })}>
        <Icons.upvote className="h-5 w-5 text-zinc-700" />
      </div>

      {/* Votes */}
      <div className="py-2 text-center text-sm font-medium text-zinc-900">
        <Icons.spinner className="h-3 w-3 animate-spin" />
      </div>

      {/* Downvote */}
      <div className={buttonVariants({ variant: "ghost" })}>
        <Icons.downvote className="h-5 w-5 text-zinc-700" />
      </div>
    </div>
  );
}

export default async function PostDetailPage({
  params: { postId },
}: PostDetailPageProps) {
  const cachedPost = (await redis.hgetall(`post:${postId}`)) as CachedPost;

  let post: (Post & { votes: Vote[]; author: User }) | null = null;

  if (!cachedPost) {
    post = await prisma.post.findFirst({
      where: {
        id: postId,
      },
      include: {
        votes: true,
        author: true,
      },
    });
  }

  if (!post && !cachedPost) return notFound();

  const getData = async () => {
    return await prisma.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        votes: true,
      },
    });
  };

  return (
    <div>
      <div className="flex h-full flex-col items-center justify-between sm:flex-row sm:items-start">
        <Suspense fallback={<PostVoteShell />}>
          <PostVoteServer
            postId={post?.id ?? cachedPost.id}
            getData={getData}
          />
        </Suspense>

        <div className="w-full flex-1 rounded-sm bg-card p-4 sm:w-0">
          <p className="mt-1 max-h-40 truncate text-xs text-muted-foreground">
            <span>
              Posted by u/{post?.author.username ?? cachedPost.authorUsername} •
            </span>{" "}
            {formatTimeToNow(new Date(post?.createdAt ?? cachedPost.createdAt))}
          </p>

          <h1 className="py-2 text-xl font-semibold leading-6 text-primary">
            {post?.title ?? cachedPost.title}
          </h1>

          <EditorOutput content={post?.content ?? cachedPost.content} />

          <Suspense
            fallback={
              <Icons.spinner className="h-5 w-5 animate-spin text-zinc-500" />
            }
          >
            <CommentSection postId={post?.id ?? cachedPost.id} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
