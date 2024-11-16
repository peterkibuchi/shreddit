import { z } from "zod";

export const PostValidator = z.object({
  content: z.any(),
  subredditId: z.string(),
  title: z
    .string()
    .min(3, {
      message: "Title must be at least 3 characters long",
    })
    .max(128, {
      message: "Title mustn't exceed 128 characters",
    }),
});

export type PostCreationRequest = z.infer<typeof PostValidator>;
