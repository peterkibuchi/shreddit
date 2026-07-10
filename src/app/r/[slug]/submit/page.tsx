import { Suspense } from "react";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";

import { Icons, PostForm } from "~/components";
import { Button } from "~/components/ui/button";
import { db } from "~/server/db";
import { subreddits } from "~/server/db/schema";

interface CreatePostProps {
  params: Promise<{
    slug: string;
  }>;
}
export default async function CreatePost({ params }: CreatePostProps) {
  const { slug } = await params;

  const subreddit = await db.query.subreddits.findFirst({
    where: eq(subreddits.name, slug),
  });

  if (!subreddit) return notFound();

  return (
    <div className="flex flex-col items-start gap-6">
      <div className="border-b border-gray-200 pb-3 dark:border-gray-500">
        <div className="-mt-2 -ml-2 flex flex-wrap items-baseline">
          <h3 className="mt-2 ml-2 text-base leading-6 font-semibold text-gray-900 dark:text-gray-500">
            Create Post
          </h3>
          <p className="mt-1 ml-2 truncate text-base text-gray-500 dark:text-primary">
            in r/{slug}
          </p>
        </div>
      </div>

      <Suspense
        fallback={
          <Icons.spinner className="h-10 w-10 animate-spin self-center text-zinc-500" />
        }
      >
        <PostForm subredditId={subreddit.id} />
      </Suspense>

      <div className="flex w-full justify-end">
        <Button type="submit" className="w-full" form="subreddit-post-form">
          Post
        </Button>
      </div>
    </div>
  );
}
