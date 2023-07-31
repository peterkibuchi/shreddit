import { z } from "zod";

import { UsernameValidator } from "~/lib/validators/username";
import { getServerAuthSession } from "~/server/auth";
import { prisma } from "~/server/db";

export async function PATCH(req: Request) {
  try {
    const session = await getServerAuthSession();

    // Check if user is signed in
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const body = await req.json();
    const { name } = UsernameValidator.parse(body);

    // Check if username is already taken
    const usernameExists = await prisma.user.findFirst({
      where: {
        username: name,
      },
    });

    if (usernameExists) {
      return new Response("Username already taken", { status: 409 });
    }

    // Update username
    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        username: name,
      },
    });

    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 400 });
    }

    return new Response(
      "Could not update username at this time. Please try again later",
      { status: 500 },
    );
  }
}
