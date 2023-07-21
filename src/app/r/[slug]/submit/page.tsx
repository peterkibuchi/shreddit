import { notFound } from "next/navigation";

import { PostForm } from "~/components";
import { Button } from "~/components/ui/button";
import { prisma } from "~/server/db";

interface CreatePostProps {
  params: {
    slug: string;
  };
}
export default async function CreatePost({ params }: CreatePostProps) {
  const subreddit = await prisma.subreddit.findFirst({
    where: {
      name: params.slug,
    },
  });

  if (!subreddit) return notFound();

  return (
    <div className="flex flex-col items-start gap-6">
      <div className="border-b border-gray-200 pb-5 dark:border-gray-500">
        <div className="-ml-2 -mt-2 flex flex-wrap items-baseline">
          <h3 className="ml-2 mt-2 text-base font-semibold leading-6 text-gray-900 dark:text-gray-500">
            Create Post
          </h3>
          <p className="ml-2 mt-1 truncate text-base text-gray-500 dark:text-primary">
            in r/{params.slug}
          </p>
        </div>
      </div>

      <PostForm subredditId={subreddit.id} />

      <div className="flex w-full justify-end">
        <Button type="submit" className="w-full" form="subreddit-post-form">
          Post
        </Button>
      </div>
    </div>
  );
}
