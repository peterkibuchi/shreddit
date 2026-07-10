import { type NextRequest } from "next/server";
import { like } from "drizzle-orm";

import { db } from "~/server/db";
import { subreddits } from "~/server/db/schema";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q");

  if (!q) return new Response("Invalid query", { status: 400 });

  const results = await db.query.subreddits.findMany({
    where: like(subreddits.name, `${q}%`),
    limit: 5,
  });

  return new Response(JSON.stringify(results));
}
