import type { Comment, Post, Subreddit, User, Vote } from "~/server/db/schema";

export type ExtendedPost = Post & {
  author: User;
  comments: Comment[];
  subreddit: Subreddit;
  votes: Vote[];
};
