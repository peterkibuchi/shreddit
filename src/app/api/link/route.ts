/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { type NextRequest } from "next/server";
import axios from "axios";

import { getServerAuthSession } from "~/server/auth";

export async function GET(req: NextRequest) {
  // Only authenticated users compose posts (and therefore use the link tool).
  // Gating this endpoint prevents it from being abused as an open request proxy.
  const session = await getServerAuthSession();

  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(req.url);
  const href = url.searchParams.get("url");

  if (!href) {
    return new Response("Invalid href", { status: 400 });
  }

  // Only allow fetching over HTTP(S) to reject file://, gopher://, etc.
  let target: URL;
  try {
    target = new URL(href);
  } catch {
    return new Response("Invalid href", { status: 400 });
  }

  if (target.protocol !== "http:" && target.protocol !== "https:") {
    return new Response("Invalid href", { status: 400 });
  }

  try {
    const res = await axios.get(target.toString(), {
      timeout: 5000,
      maxContentLength: 5_000_000,
    });

    // Parse the HTML using regular expressions
    const titleMatch = res.data.match(/<title>(.*?)<\/title>/);
    const title = titleMatch ? titleMatch[1] : "";

    const descriptionMatch = res.data.match(
      /<meta name="description" content="(.*?)"/,
    );
    const description = descriptionMatch ? descriptionMatch[1] : "";

    const imageMatch = res.data.match(
      /<meta property="og:image" content="(.*?)"/,
    );
    const imageUrl = imageMatch ? imageMatch[1] : "";

    // Return the data in the format required by the editor tool
    return new Response(
      JSON.stringify({
        success: 1,
        meta: {
          title,
          description,
          image: {
            url: imageUrl,
          },
        },
      }),
    );
  } catch {
    return new Response("Could not fetch link preview", { status: 502 });
  }
}
