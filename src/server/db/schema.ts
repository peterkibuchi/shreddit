import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

/**
 * Table, column, enum and index names deliberately match the physical names
 * created by the previous Prisma schema (Prisma uses the model/field names
 * verbatim), so this schema maps onto the existing database as-is.
 *
 * Prisma generated `cuid()` ids and `@updatedAt` timestamps client-side; the
 * `$defaultFn`/`$onUpdate` callbacks below reproduce that behavior (there are
 * no database-level defaults or triggers for them).
 */

export const voteTypeEnum = pgEnum("VoteType", ["UP", "DOWN"]);

// Necessary for NextAuth
export const users = pgTable(
  "User",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    name: text("name"),
    email: text("email"),
    emailVerified: timestamp("emailVerified", { mode: "date", precision: 3 }),
    image: text("image"),
    username: text("username"),
  },
  (t) => [
    uniqueIndex("User_email_key").on(t.email),
    uniqueIndex("User_username_key").on(t.username),
  ],
);

export const accounts = pgTable(
  "Account",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    refresh_token_expires_in: integer("refresh_token_expires_in"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (t) => [
    uniqueIndex("Account_provider_providerAccountId_key").on(
      t.provider,
      t.providerAccountId,
    ),
  ],
);

export const sessions = pgTable(
  "Session",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    sessionToken: text("sessionToken").notNull(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    expires: timestamp("expires", { mode: "date", precision: 3 }).notNull(),
  },
  (t) => [uniqueIndex("Session_sessionToken_key").on(t.sessionToken)],
);

export const verificationTokens = pgTable(
  "VerificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date", precision: 3 }).notNull(),
  },
  (t) => [
    uniqueIndex("VerificationToken_token_key").on(t.token),
    uniqueIndex("VerificationToken_identifier_token_key").on(
      t.identifier,
      t.token,
    ),
  ],
);

// My Models
export const subreddits = pgTable(
  "Subreddit",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    name: text("name").notNull(),
    createdAt: timestamp("createdAt", { mode: "date", precision: 3 })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date", precision: 3 })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
    creatorId: text("creatorId")
      .notNull()
      .references(() => users.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
  },
  (t) => [
    uniqueIndex("Subreddit_name_key").on(t.name),
    index("Subreddit_name_idx").on(t.name),
  ],
);

export const subscriptions = pgTable(
  "Subscription",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    subredditId: text("subredditId")
      .notNull()
      .references(() => subreddits.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
  },
  (t) => [primaryKey({ columns: [t.userId, t.subredditId] })],
);

export const posts = pgTable("Post", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  title: text("title").notNull(),
  content: jsonb("content"),
  createdAt: timestamp("createdAt", { mode: "date", precision: 3 })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date", precision: 3 })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
  authorId: text("authorId")
    .notNull()
    .references(() => users.id, { onDelete: "restrict", onUpdate: "cascade" }),
  subredditId: text("subredditId")
    .notNull()
    .references(() => subreddits.id, {
      onDelete: "restrict",
      onUpdate: "cascade",
    }),
});

export const comments = pgTable("Comment", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  text: text("text").notNull(),
  createdAt: timestamp("createdAt", { mode: "date", precision: 3 })
    .notNull()
    .defaultNow(),
  authorId: text("authorId")
    .notNull()
    .references(() => users.id, { onDelete: "restrict", onUpdate: "cascade" }),
  postId: text("postId")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade", onUpdate: "cascade" }),
  commentId: text("commentId"),
  replyToId: text("replyToId").references((): AnyPgColumn => comments.id, {
    onDelete: "no action",
    onUpdate: "no action",
  }),
});

export const votes = pgTable(
  "Vote",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    postId: text("postId")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade", onUpdate: "cascade" }),
    type: voteTypeEnum("type").notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.postId] })],
);

export const commentVotes = pgTable(
  "CommentVote",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    commentId: text("commentId")
      .notNull()
      .references(() => comments.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    type: voteTypeEnum("type").notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.commentId] })],
);

// Relations (for db.query relational queries)
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  createdSubreddits: many(subreddits, { relationName: "CreatedBy" }),
  subscriptions: many(subscriptions),
  posts: many(posts),
  votes: many(votes),
  comments: many(comments),
  commentVotes: many(commentVotes),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const subredditsRelations = relations(subreddits, ({ one, many }) => ({
  creator: one(users, {
    fields: [subreddits.creatorId],
    references: [users.id],
    relationName: "CreatedBy",
  }),
  posts: many(posts),
  subscribers: many(subscriptions),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
  subreddit: one(subreddits, {
    fields: [subscriptions.subredditId],
    references: [subreddits.id],
  }),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, { fields: [posts.authorId], references: [users.id] }),
  subreddit: one(subreddits, {
    fields: [posts.subredditId],
    references: [subreddits.id],
  }),
  comments: many(comments),
  votes: many(votes),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  author: one(users, { fields: [comments.authorId], references: [users.id] }),
  post: one(posts, { fields: [comments.postId], references: [posts.id] }),
  replyTo: one(comments, {
    fields: [comments.replyToId],
    references: [comments.id],
    relationName: "ReplyTo",
  }),
  replies: many(comments, { relationName: "ReplyTo" }),
  votes: many(commentVotes),
}));

export const votesRelations = relations(votes, ({ one }) => ({
  user: one(users, { fields: [votes.userId], references: [users.id] }),
  post: one(posts, { fields: [votes.postId], references: [posts.id] }),
}));

export const commentVotesRelations = relations(commentVotes, ({ one }) => ({
  user: one(users, { fields: [commentVotes.userId], references: [users.id] }),
  comment: one(comments, {
    fields: [commentVotes.commentId],
    references: [comments.id],
  }),
}));

// Model types (replacements for the types previously generated by Prisma)
export type User = typeof users.$inferSelect;
export type Subreddit = typeof subreddits.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type Vote = typeof votes.$inferSelect;
export type CommentVote = typeof commentVotes.$inferSelect;
export type VoteType = (typeof voteTypeEnum.enumValues)[number];
