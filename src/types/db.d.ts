import type { Comment, Post, Subreddit, User, Vote } from "@prisma/client";

export type ExtendedPost = Post & {
  author: User;
  comments: Comment[];
  subreddit: Subreddit;
  votes: Vote[];
};
