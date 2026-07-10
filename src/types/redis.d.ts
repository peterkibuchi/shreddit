import { type VoteType } from "~/server/db/schema";

export type CachedPost = {
  id: string;
  title: string;
  content: string;
  authorUsername: string;
  currentVote: VoteType | null;
  createdAt: Date;
};
