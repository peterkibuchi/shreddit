import type { Comment, Post, Subreddit, User, Vote } from "~/server/db/schema";

// Author is intentionally narrowed to non-sensitive, publicly displayable
// fields. The full `User` row includes `email`/`emailVerified`, which must
// never be serialized to the client.
export type PublicAuthor = Pick<User, "id" | "name" | "username" | "image">;

export type ExtendedPost = Post & {
  author: PublicAuthor;
  comments: Comment[];
  subreddit: Subreddit;
  votes: Vote[];
};
